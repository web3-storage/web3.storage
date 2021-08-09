import { DBClient, gql } from '@web3-storage/db'
import ora from 'ora'
import Table from 'cli-table'
import { format } from 'd3-format'
import prettyMs from 'pretty-ms'
import retry from 'p-retry'
import bytes from 'bytes'
import fs from 'fs'
import path from 'path'
import stringify from 'csv-stringify'
import { pipeline } from 'stream/promises'

const formatNumber = format(',')

const FIND_USERS_BY_CREATED = gql`
  query FindUsers($from: Time! $to: Time, $after: String) {
    findUsersByCreated(from: $from, to: $to, _size: 20000, _cursor: $after) {
      data {
        _id
        email
        created
      }
      after
    }
  }
`

const FIND_UPLOADS_CREATED_AFTER = gql`
  query FindUploads($since: Time! $cursor: String) {
    findUploadsCreatedAfter(since: $since, _size: 5000, _cursor: $cursor) {
      data {
        user {
          _id
        }
        content {
          dagSize
        }
        created
        deleted
      }
      after
    }
  }
`

export async function run (options) {
  const db = getDBClient(process.env)
  const spinner = ora()
  const from = '2021-07-28T00:00:00.000Z'
  const to = new Date().toISOString()

  let totalUsers = 0
  let totalUploads = 0
  let users = []
  const userUploads = new Map()

  spinner.start('Fetching users page 0...')

  try {
    await Promise.all([
      (async () => {
        let after = null
        let i = 1
        while (true) {
          const { findUploadsCreatedAfter: uploadsPage } = await retry(() => db.query(FIND_UPLOADS_CREATED_AFTER, { since: from, cursor: after }))
          totalUploads += uploadsPage.data.length

          for (const upload of uploadsPage.data) {
            const uploads = userUploads.get(upload.user._id) || []
            userUploads.set(upload.user._id, uploads.concat(upload))
          }

          spinner.text = renderText(`Fetching uploads page ${i}...`, { totalUsers, totalUploads, users, userUploads }, options)
          after = uploadsPage.after
          if (!after) break
          i++
        }
      })(),
      (async () => {
        let after = null
        let i = 1
        while (true) {
          const { findUsersByCreated: userPage } = await retry(() => db.query(FIND_USERS_BY_CREATED, { from, to, after }))
          totalUsers += userPage.data.length
          users = users.concat(userPage.data)

          spinner.text = renderText(`Fetching users page ${i}...`, { totalUsers, totalUploads, users, userUploads }, options)
          after = userPage.after
          if (!after) break
          i++
        }
      })()
    ])

    spinner.text = renderText('✅ Complete!', { totalUsers, totalUploads, users, userUploads }, options)
    spinner.stopAndPersist()

    if (!options.output) {
      return
    }

    const outPath = path.resolve(options.output)
    spinner.start(`Writing CSV to ${outPath}`)
    const out = fs.createWriteStream(outPath)
    await renderCSV({ users, userUploads }, out, options)
    spinner.succeed()
  } catch (err) {
    spinner.fail()
    console.error(err)
  }
}

function prepareRows ({ users, userUploads }, options = {}) {
  const data = []
  for (const user of users) {
    const uploads = userUploads.get(user._id) || []
    const created = new Date(user.created)
    let first = Infinity
    let last = 0
    let totalDagSize = 0
    for (const u of uploads) {
      const created = new Date(u.created)
      if (created.getTime() < first) {
        first = created.getTime()
      }
      if (created.getTime() > last) {
        last = created.getTime()
      }
      totalDagSize += u.content.dagSize || 0
    }
    data.push([user._id, user.email, created, uploads.length, totalDagSize, first, last])
  }
  data.sort((a, b) => b[3] - a[3])
  return options.top ? data.slice(0, parseInt(options.top)) : data
}

function renderText (msg, { totalUsers, totalUploads, users, userUploads }, options = {}) {
  const table = new Table({
    head: ['ID', 'Email', 'Created', 'Uploads', 'Power', 'Time to 1st upload', 'Time since last upload']
  })
  const data = prepareRows({ users, userUploads }, { top: 10, ...options })
  for (const row of data) {
    const timeToFirst = row[5] === Infinity ? '' : prettyMs(row[5] - row[2].getTime(), { compact: true })
    const timeSinceLast = row[6] === 0 ? '' : prettyMs(Date.now() - row[6], { compact: true })
    const created = row[2].toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    })
    table.push([row[0], row[1], created, formatNumber(row[3]), bytes.format(row[4]), timeToFirst, timeSinceLast])
  }
  return `${msg || ''}

${formatNumber(totalUsers)} users  ${formatNumber(totalUploads)} uploads

${table.toString()}

Report generated ${new Date().toLocaleString(undefined, {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric'
})}
`
}

function renderCSV ({ users, userUploads }, dest, options = {}) {
  return pipeline(
    async function * () {
      yield ['ID', 'Email', 'Created', 'Uploads', 'Power', 'Time to 1st upload', 'Time since last upload']
      const data = prepareRows({ users, userUploads }, options)
      for (const row of data) {
        const timeToFirst = row[5] === Infinity ? '' : row[5] - row[2].getTime()
        const timeSinceLast = row[6] === 0 ? '' : Date.now() - row[6]
        const created = row[2].toISOString()
        yield [row[0], row[1], created, row[3], row[4], timeToFirst, timeSinceLast]
      }
    },
    stringify(),
    dest
  )
}

/**
 * Create a new Fauna DB client instance from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 */
function getDBClient (env) {
  let token
  if (env.ENV === 'production') {
    if (!env.FAUNA_KEY) throw new Error('missing FAUNA_KEY environment var')
    token = env.FAUNA_KEY
  } else if (env.ENV === 'staging') {
    if (!env.STAGING_FAUNA_KEY) throw new Error('missing STAGING_FAUNA_KEY environment var')
    token = env.STAGING_FAUNA_KEY
  } else if (env.ENV === 'dev') {
    if (!env.DEV_FAUNA_KEY) throw new Error('missing DEV_FAUNA_KEY environment var')
    token = env.DEV_FAUNA_KEY
  } else {
    throw new Error(`unsupported environment ${env.ENV}`)
  }
  return new DBClient({ token })
}
