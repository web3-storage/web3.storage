/* eslint-env mocha */
import assert from 'assert'
import { createCargoDag, createUpload, createUser, createUserAuthKey, dbEndpoint, getUpload, listUploads, randomCid, token } from '@web3-storage/db/test-utils'
import { DBClient } from '@web3-storage/db'
import { updateDagSizes } from '../src/jobs/dagcargo.js'
import { getPg } from '../src/lib/utils.js'

const env = {
  ...process.env,
  ENV: 'dev',
  RO_PG_CONNECTION: 'postgres://postgres:postgres@127.0.0.1:5432/postgres'
}

function getToBeUpdatedNull (cItem) {
  return cItem.dagSize === null && // It's null in web3.storage
    cItem.actualSize !== null// It's has a size in cargo
}

function getToBeUpdatedWrong (cItem) {
  return cItem.dagSize !== cItem.actualSize && //  web3.storage value is different from cargo
    cItem.actualSize !== null // It's has a size in cargo
}

describe('Fix dag sizes migration', () => {
  /** @type {DBClient} */
  let dbClient
  let user
  let authKey
  let contentItems
  let roPg
  let rwPg

  async function updateDagSizesWrp ({ user, after = new Date(1990, 1, 1), limit = 1000 }) {
    const allUploadsBefore = await listUploads(dbClient, user._id)
    await updateDagSizes({
      roPg,
      rwPg,
      after,
      limit
    })
    const allUploadsAfter = await listUploads(dbClient, user._id)
    const updatedCids = allUploadsAfter.filter((uAfter) => {
      const beforeUpload = allUploadsBefore.find((uBefore) => uAfter.cid === uBefore.cid)
      return beforeUpload?.dagSize !== uAfter.dagSize
    }).map(u => u.cid)

    return {
      allUploadsAfter,
      allUploadsBefore,
      updatedCids
    }
  }

  before(async () => {
    dbClient = new DBClient({
      endpoint: dbEndpoint,
      token,
      postgres: true
    })
    rwPg = await getPg(env, 'rw')
    roPg = await getPg(env, 'ro')
  })

  after(async () => {
    await rwPg.end()
    await roPg.end()
  })

  beforeEach(async () => {
    user = await createUser(dbClient)
    authKey = await createUserAuthKey(dbClient, user._id)
    // cid, public.content.dag_size, cargo.dag.size_actual
    contentItems = [
      {
        cid: await randomCid(),
        dagSize: 120,
        actualSize: 120
      }, {
        cid: await randomCid(),
        dagSize: 105,
        actualSize: 1000 // To be updated
      }, {
        cid: await randomCid(),
        dagSize: 110,
        actualSize: 110
      }, {
        cid: await randomCid(),
        dagSize: 125,
        actualSize: 90 // To be updated
      }, {
        cid: await randomCid(),
        dagSize: 0,
        actualSize: 90 // To be updated
      }, {
        cid: await randomCid(),
        dagSize: 100,
        actualSize: null
      }, {
        cid: await randomCid(),
        dagSize: null,
        actualSize: null
      }, {
        cid: await randomCid(),
        dagSize: 0,
        actualSize: 0
      }
    ]
    for (let i = 0; i < contentItems.length; i++) {
      const c = contentItems[i]
      await Promise.all([
        createUpload(dbClient, user._id, authKey, c.cid, {
          dagSize: c.dagSize
        }),
        createCargoDag(dbClient, {
          cid_v1: c.cid,
          size_actual: c.actualSize
        }, {
          cid_v1: c.cid,
          size_claimed: c.dagSize
        })
      ])
    }
  })

  it('updates the incorrect sizes', async () => {
    await updateDagSizesWrp({ user })
    const wrongSizes = contentItems.filter(getToBeUpdatedWrong)
    await Promise.all(wrongSizes.map(async c => {
      const u = await getUpload(dbClient, c.cid, user._id)
      assert.strictEqual(u.dagSize, c.actualSize, `Not updated ${c.cid}`)
    }))
  })

  it('updates the null sizes', async () => {
    await updateDagSizesWrp({ user })
    const nullSizes = contentItems.filter(getToBeUpdatedNull)
    await Promise.all(nullSizes.map(async c => {
      const u = await getUpload(dbClient, c.cid, user._id)
      assert.strictEqual(u.dagSize, c.actualSize, `Not updated ${c.cid}`)
    }))
  })

  it('returns the cids of all the updated content', async () => {
    const { updatedCids } = await updateDagSizesWrp({ user })
    const toBeUpdated = contentItems.filter((c) => getToBeUpdatedNull(c) || getToBeUpdatedWrong(c))

    assert.strictEqual(toBeUpdated.length, updatedCids.length)
    assert(toBeUpdated.map(e => e.cid).every((e) => updatedCids.includes(e)))
  })

  it('does not mess with correct ones', async () => {
    const { allUploadsBefore, allUploadsAfter } = await updateDagSizesWrp({ user })
    const correctSizes = contentItems.filter((c) => !getToBeUpdatedNull(c) && !getToBeUpdatedWrong(c))
    await Promise.all(correctSizes.map(async c => {
      const u = await getUpload(dbClient, c.cid, user._id)
      assert.strictEqual(u.dagSize, c.dagSize)
      assert.strictEqual(allUploadsBefore.find((u) => u.cid === c.cid).updated,
        allUploadsAfter.find((u) => u.cid === c.cid).updated, `Updated date of ${c.cid}`)
    }))
  })

  it('iterates until no more content needs updating', async () => {
    // Limiting to one cid per iteration
    const { updatedCids } = await updateDagSizesWrp({ user, limit: 1 })
    const wrongSizes = contentItems.filter(getToBeUpdatedWrong)
    await Promise.all(wrongSizes.map(async c => {
      const u = await getUpload(dbClient, c.cid, user._id)
      assert.strictEqual(u.dagSize, c.actualSize, `Not updated ${c.cid}`)
    }))
    const toBeUpdated = contentItems.filter((c) => getToBeUpdatedNull(c) || getToBeUpdatedWrong(c))

    assert.strictEqual(toBeUpdated.length, updatedCids.length)
  })

  it('updates the updated_at field', async () => {
    const { allUploadsBefore, allUploadsAfter } = await updateDagSizesWrp({ user })

    const nullOrZeroSizes = contentItems.filter((c) => getToBeUpdatedNull(c) || getToBeUpdatedWrong(c))
    nullOrZeroSizes.map(async c => {
      const u = allUploadsAfter.find(u => u.cid === c.cid)
      assert.strictEqual(u.dagSize, c.actualSize)
      assert.notStrictEqual(allUploadsBefore.find((u) => u.cid === c.cid).updated,
        allUploadsAfter.find((u) => u.cid === c.cid).updated, `Not updated updated_at of ${c.cid}`)
    })
  })
})
