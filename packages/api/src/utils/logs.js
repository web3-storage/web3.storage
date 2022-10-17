/* eslint-env serviceworker */
import { nanoid } from 'nanoid/non-secure'
import { MaintenanceError } from '../errors.js'

// https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent
/** @typedef {{ waitUntil(p: Promise): void }} Ctx */

const logtailApiURL = 'https://in.logtail.com/'

const buildMetadataFromHeaders = (/** @type {Headers} */ headers) => {
  /** @type {Record<string, string>} */
  const responseMetadata = {}
  Array.from(headers).forEach(([key, value]) => {
    responseMetadata[key.replace(/-/g, '_')] = value
  })
  return responseMetadata
}

export class Logging {
  /**
   * @param {import('@web-std/fetch').Request} request
   * @param {import('../index').Ctx} ctx
   * @param {Object} opts
   * @param {string} opts.token
   * @param {string} opts.version
   * @param {string} opts.branch
   * @param {string} opts.commithash
   * @param {import('toucan-js').default} opts.sentry
   * @param {boolean} [opts.debug]
   * @param {boolean} [opts.sendToLogtail]
   * @param {boolean} [opts.sendToSentry]
   */
  constructor (request, ctx,
    { sendToLogtail = true, sendToSentry = true, ...opts }
  ) {
    this.ctx = ctx
    this.opts = opts
    this.sendToSentry = sendToSentry
    this.sendToLogtail = sendToLogtail
    /** @typedef {{ name: string, description?: string, start: number, end?: number, duration?: number, value?: number }} Timer */
    /** @type {Map<string, Timer>} */
    this._times = new Map()
    /**
     * @type {string[]}
     */
    this._timesOrder = []
    /**
     * @type {any[]}
     */
    this.logEventsBatch = []
    this.startTs = Date.now()
    this.currentTs = this.startTs
    this._finished = false

    // @ts-ignore
    const cf = request.cf
    let rCf
    if (cf) {
      // @ts-ignore
      const { tlsClientAuth, tlsExportedAuthenticator, ...rest } = cf
      rCf = rest
    }
    this.metadata = {
      user: {
        id: '0'
      },
      request: {
        url: request.url,
        method: request.method,
        headers: buildMetadataFromHeaders(request.headers),
        cf: rCf
      },
      cloudflare_worker: {
        version: opts.version,
        commit: opts.commithash,
        branch: opts.branch,
        worker_id: nanoid(10),
        worker_started: this.startTs
      }
    }

    // As this class must be instantiated once per request, we can automatically
    // start the timing of the request here
    this.time('request')
  }

  /**
   * Set user
   *
   * @param {object} user
   * @param {string} user.id
   */
  setUser (user) {
    this.metadata.user.id = user.id
    this.sendToSentry && this.opts.sentry.setUser({
      id: `${user.id}`
    })
  }

  _date () {
    const now = Date.now()
    if (now === this.currentTs) {
      const dt = new Date().toISOString()
      /**
       * Fake increment the datetime string to order the logs entries
       * It won't leap seconds but for most cases it will increment by 1 the datetime milliseconds
       */
      const newDt = dt.replace(/\.(\d*)Z/, (s, p1, p2) => {
        return `.${String(Number(p1) + this.logEventsBatch.length)}Z`
      })
      return new Date(newDt).toISOString()
    } else {
      this.currentTs = now
      return new Date().toISOString()
    }
  }

  /**
   * Add log entry to batch
   *
   * @param {any} body
   */
  _add (body) {
    this.logEventsBatch.push(body)
  }

  async postBatch () {
    if (process.env.NODE_ENV === 'development') {
      return
    }

    if (this.logEventsBatch.length > 0) {
      const batchInFlight = [...this.logEventsBatch]
      this.logEventsBatch = []
      const rHost = batchInFlight[0].metadata.request.headers.host
      const body = JSON.stringify(batchInFlight)
      const request = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.opts?.token}`,
          'Content-Type': 'application/json',
          'User-Agent': `Cloudflare Worker via ${rHost}`
        },
        body
      }
      const resp = await fetch(logtailApiURL, request)
      if (this.opts?.debug) {
        console.info(
          `[${this._date()}]`,
          `${batchInFlight.length} logs pushed with status ${resp.status}.`
        )
      }
    }
  }

  /**
   * End instance, push logs and servers timings
   *
   * @param {Response} response
   */
  async end (response) {
    if (this._finished) {
      throw new Error(
        `end() has already been called on this Logging instance.
        You must make a new instance per request.`
      )
    }
    this._finished = true
    if (this.opts?.debug) {
      response.headers.set('Server-Timing', this._timersString())
    }
    // Automatically stop the timer of the request
    this.timeEnd('request')

    const run = async () => {
      const dt = this._date()
      const duration = Date.now() - this.startTs
      const log = {
        message: '',
        dt,
        level: 'info',
        metadata: {
          ...this.metadata,
          timers: this._timersMetadata(),
          response: {
            headers: buildMetadataFromHeaders(response.headers),
            status_code: response.status,
            duration
          }
        }
      }
      this._add(log)
      if (this.sendToLogtail) {
        await this.postBatch()
      }
    }
    this.ctx.waitUntil(run())
    return response
  }

  /**
   * Log
   *
   * @param {string | Error} message
   * @param {'debug' | 'info' | 'warn' | 'error'} level
   * @param {any} [context]
   * @param {any} [metadata]
   */
  log (message, level, context, metadata) {
    const dt = this._date()
    let log = {
      dt,
      level,
      metadata: { ...this.metadata, ...metadata },
      ...context
    }

    // This array of errors not to send to Sentry could be configurable in the
    // constructor if we want to keep this Logging class more generic
    const skipForSentry = [MaintenanceError]

    if (message instanceof Error) {
      log = {
        ...log,
        stack: message.stack,
        message: message.message
      }

      if (this.sendToSentry && !skipForSentry.some((cls) => message instanceof cls)) {
        this.opts.sentry.captureException(message)
      }
      if (this.opts?.debug) {
        console[level](`[${dt}]`, message)
      }
    } else {
      log = {
        ...log,
        message
      }
      if (this.opts?.debug) {
        console[level](`[${dt}]`, log.message, context)
      }
    }

    this._add(log)
  }

  /**
   * @param {string} message
   * @param {any} [context]
   */
  debug (message, context) {
    return this.log(message, 'debug', context)
  }

  /**
   * @param {string} message
   * @param {any} [context]
   */
  info (message, context) {
    return this.log(message, 'info', context)
  }

  /**
   * @param {string} message
   * @param {any} [context]
   */
  warn (message, context) {
    return this.log(message, 'warn', context)
  }

  /**
   * @param {string | Error} message
   * @param {any} [context]
   */
  error (message, context) {
    return this.log(message, 'error', context)
  }

  /**
   * Start a timer to be logged under the given name.
   * @param {string} name
   * @param {any} [description]
   */
  time (name, description) {
    if (this._times.get(name)) {
      return console.warn(`A timer named ${name} has already been started`)
    }
    this._times.set(name, {
      name: name,
      description: description,
      start: Date.now()
    })
    this._timesOrder.push(name)
  }

  /**
   * End the timer of the given name.
   * @param {string} name
   */
  timeEnd (name) {
    const timeObj = this._times.get(name)
    if (!timeObj) {
      return console.warn(`No such name ${name}`)
    }
    this._times.delete(name)
    const end = Date.now()
    const duration = end - timeObj.start
    const value = duration
    timeObj.value = value
    this._times.set(name, {
      ...timeObj,
      end,
      duration
    })

    if (this.opts?.debug) {
      console.log(`[${this._date()}]`, `${name}: ${duration} ms`)
    }
    return timeObj
  }

  _timersString () {
    const result = []
    for (const key of this._timesOrder) {
      // @ts-expect-error
      const { name, duration, description } = this._times.get(key)
      result.push(
        description
          ? `${name};desc="${description}";dur=${duration}`
          : `${name};dur=${duration}`
      )
    }

    return result.join(',')
  }

  _timersMetadata () {
    /** @type {Record<string, number>} */
    const result = {}
    for (const val of this._times.values()) {
      if (val.duration !== undefined) {
        result[val.name] = val.duration
      }
    }
    return result
  }
}
