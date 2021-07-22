/**
 * Add some mock deals to your database for your existing content.
 *
 * Usage:
 *     FAUNA_KEY=<SECRET> node add-mock-deals.js
 */
import { DBClient, gql } from '@web3-storage/db'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import * as pb from '@ipld/dag-pb'
import crypto from 'crypto'

const FIND_UPLOADS = gql`
  query FindUploads($cursor: String, $size: Int) {
    findUploadsCreatedAfter(since: "2021-06-01T00:00:00.000Z", _size: $size, _cursor: $cursor) {
      data {
        content {
          cid
        }
      }
      after
    }
  }
`

const CREATE_AGGREGATE = gql`
  mutation CreateAggregate($data: CreateAggregateInput!) {
    createAggregate(data: $data) {
      _id
    }
  }
`

const ADD_AGGREGATE_ENTRIES = gql`
  mutation AddAggregateEntries($dataCid: String!, $entries: [AggregateEntryInput!]!) {
    addAggregateEntries(dataCid: $dataCid, entries: $entries) {
      _id
    }
  }
`

const CREATE_DEAL = gql`
  mutation CreateDeal($data: CreateOrUpdateDealInput!) {
    createOrUpdateDeal(data: $data) {
      _id
    }
  }
`

/**
 * The maximum is exclusive and the minimum is inclusive.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

/**
 * @param {number} code
 * @returns {Promise<string>}
 */
async function randomCid (code) {
  const bytes = crypto.randomBytes(10)
  const hash = await sha256.digest(bytes)
  return CID.create(1, code, hash).toString()
}

async function mockAggregate () {
  const dataCid = await randomCid(pb.code)
  const pieceCid = await randomCid(0xf101)
  return { dataCid, pieceCid }
}

/**
 * @param {string} cid Content CID
 */
function mockAggregateEntry (cid) {
  return { cid, dataModelSelector: `Links/${randomInt(0, 3)}/Links/${randomInt(0, 3)}` }
}

/**
 * @param {string} dataCid
 */
function mockDeal (dataCid) {
  const status = ['Queued', 'Published', 'Active'][randomInt(0, 3)]
  const storageProvider = `f0${randomInt(1000, 100000)}`
  const dealId = randomInt(1000, 1000000)

  if (status === 'Queued') {
    return null
  }

  if (status === 'Published') {
    const activation = new Date(Date.now() + randomInt(0, 5000000))
    const renewal = new Date(activation.getTime() + randomInt(0, 5000000))
    return { dataCid, storageProvider, dealId, activation: activation.toISOString(), renewal: renewal.toISOString(), status }
  }

  const activation = new Date(Date.now() - randomInt(0, 5000000))
  const renewal = new Date(Date.now() + randomInt(0, 5000000))
  return { dataCid, storageProvider, dealId, activation: activation.toISOString(), renewal: renewal.toISOString(), status }
}

async function main () {
  const { FAUNA_KEY } = process.env
  if (!FAUNA_KEY) throw new Error('missing FAUNA_KEY environment variable')

  const db = new DBClient({ token: FAUNA_KEY })

  let cursor = null
  while (true) {
    const size = randomInt(1, 5)
    const { findUploadsCreatedAfter: page } = await db.query(FIND_UPLOADS, { cursor, size })
    const aggregate = await mockAggregate()
    console.log('🗃 Creating aggregate', aggregate)
    await db.query(CREATE_AGGREGATE, { data: aggregate })

    const entries = page.data.map(({ content }) => mockAggregateEntry(content.cid))
    console.log('📜 Creating aggregate entries', { dataCid: aggregate.dataCid, entries })
    await db.query(ADD_AGGREGATE_ENTRIES, { dataCid: aggregate.dataCid, entries })

    const deal = mockDeal(aggregate.dataCid)
    if (deal) {
      console.log('🤝 Creating deal', deal)
      await db.query(CREATE_DEAL, { data: deal })
    } else {
      console.log('⏩ Skipping creating deal')
    }

    if (!page.after) break
    cursor = page.after
  }

  console.log('✅ Done')
}

main()
