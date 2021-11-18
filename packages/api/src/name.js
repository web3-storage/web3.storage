import * as uint8arrays from 'uint8arrays'
import * as ipns from 'ipns'
import * as Digest from 'multiformats/hashes/digest'
import { base36 } from 'multiformats/bases/base36'
import { CID } from 'multiformats/cid'
import { keys } from 'libp2p-crypto'
import { PreciseDate } from '@google-cloud/precise-date'
import { HTTPError } from './errors.js'
import { JSONResponse } from './utils/json-response.js'

const libp2pKeyCode = 0x72

/**
 * @param {Request} request
 * @param {import('./env').Env} env
 */
export async function nameGet (request, env) {
  const { params: { key } } = request
  const { code } = CID.parse(key, base36)
  if (code !== libp2pKeyCode) {
    throw new HTTPError(`invalid key code: ${code}`, 400)
  }

  const record = await env.db.resolveNameRecord(key)
  if (!record) {
    throw new HTTPError(`record not found for key: ${key}`, 404)
  }

  const { value } = ipns.unmarshal(uint8arrays.fromString(record, 'base64pad'))
  return new JSONResponse({ value: uint8arrays.toString(value), record })
}

/**
 * @param {Request} request
 * @param {import('./env').Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function namePost (request, env, ctx) {
  const { params: { key } } = request
  const keyCid = CID.parse(key, base36)

  if (keyCid.code !== libp2pKeyCode) {
    throw new HTTPError(`invalid key code: ${keyCid.code}`, 400)
  }

  const record = await request.text()
  const entry = ipns.unmarshal(uint8arrays.fromString(record, 'base64pad'))
  const pubKey = keys.unmarshalPublicKey(Digest.decode(keyCid.multihash.bytes).bytes)

  if (entry.pubKey && !keys.unmarshalPublicKey(entry.pubKey).equals(pubKey)) {
    throw new HTTPError('embedded public key mismatch', 400)
  }

  await ipns.validate(pubKey, entry)

  await env.db.publishNameRecord(
    key,
    record,
    Boolean(entry.signatureV2),
    entry.sequence,
    new PreciseDate(uint8arrays.toString(entry.validity)).getFullTime()
  )

  ctx.waitUntil((async () => {
    const record = await env.db.resolveNameRecord(key)
    if (!record) return // something went really wrong
    const { value } = ipns.unmarshal(uint8arrays.fromString(record, 'base64pad'))
    const data = { value: uint8arrays.toString(value), record }
    await NameRoom.broadcast(request, env.nameRooms, key, data)
  })())

  return new JSONResponse({ id: key }, { status: 202 })
}

/**
 * @param {Request} request
 * @param {import('./env').Env} env
 */
export async function nameWatchGet (request, env) {
  const { params: { key } } = request
  const keyCid = CID.parse(key, base36)

  if (keyCid.code !== libp2pKeyCode) {
    throw new HTTPError(`invalid key code: ${keyCid.code}`, 400)
  }

  const record = await env.db.resolveNameRecord(key)
  if (!record) {
    throw new HTTPError(`record not found for key: ${key}`, 404)
  }

  return NameRoom.join(request, env.nameRooms, key)
}

/**
 * A Cloudflare Durable Object. Each instance is a group of users interested in
 * a particular IPNS key ID. The static API is used by workers to communicate
 * with it.
 */
export class NameRoom {
  constructor () {
    /** @type {Array<{ webSocket: WebSocket }>} */
    this.sessions = []
  }

  /**
   * @param {Request} request 
   * @returns {Promise<Response>}
   */
  async fetch (request) {
    const url = new URL(request.url)
    switch (url.pathname) {
      // create new websocket connection
      case '/websocket':
        if (request.headers.get('Upgrade') !== 'websocket') {
          return new Response('expected websocket upgrade', { status: 400 })
        }
        const [client, server] = new WebSocketPair()
        server.accept()

        const session = { webSocket: server }
        this.sessions.push(session)

        const closeOrErrorHandler = () => {
          this.sessions = this.sessions.filter(s => s !== session)
        }
        server.addEventListener('close', closeOrErrorHandler)
        server.addEventListener('error', closeOrErrorHandler)

        return new Response(null, { status: 101, webSocket: client })

      // broadcast an updated value to everyone in the room
      case '/broadcast':
        const data = await request.text()
        for (const session of this.sessions) {
          session.webSocket.send(data)
        }
        return new Response()

      default:
        return new Response('not found', { status: 404 })
    }
  }

  /**
   * @param {Request} req
   * @param {import('./env').DurableObjectNamespace} ns 
   * @param {string} key IPNS Key ID
   */
  static async join (req, ns, key) {
    const roomId = ns.idFromName(key)
    const room = ns.get(roomId)

    const url = new URL(req.url)
    url.pathname = '/websocket'

    return room.fetch(url, req)
  }

  /**
   * @param {Request} req
   * @param {import('./env').DurableObjectNamespace} ns 
   * @param {string} key IPNS Key ID
   * @param {{ value: string, record: string }} data
   */
  static async broadcast (req, ns, key, data) {
    const roomId = ns.idFromName(key)
    const room = ns.get(roomId)

    const url = new URL(req.url)
    url.pathname = '/broadcast'

    return room.fetch(new Request({ url, body: JSON.stringify(data) }))
  }
}
