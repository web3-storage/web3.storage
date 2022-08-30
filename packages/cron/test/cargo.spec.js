/* eslint-env mocha */
import assert from 'assert'
import { createCargoDag, createUpload, createUser, createUserAuthKey, dbEndpoint, getContents, getUpload, listUploads, randomCid, token } from '@web3-storage/db/test-utils'
import { DBClient } from '@web3-storage/db'
import { updateDagSizes } from '../src/jobs/dagcargo.js'
import { getCargoPgPool, getPg } from '../src/lib/utils.js'

const env = {
  ...process.env,
  ENV: 'dev',
  // These DB vars aren't necessary if you're using the latest .env.tpl, but are here
  // to avoid errors if people are still using the old version before these were added
  DAG_CARGO_HOST: '127.0.0.1',
  DAG_CARGO_DATABASE: 'postgres',
  DAG_CARGO_USER: 'postgres',
  DAG_CARGO_PASSWORD: 'postgres'
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
  let cargoPool
  let rwPg

  async function updateDagSizesWrp ({ user, after = new Date(1990, 1, 1), limit = 1000 }) {
    const allUploadsBefore = (await listUploads(dbClient, user._id, { page: 1 })).uploads
    await updateDagSizes({
      cargoPool,
      rwPg,
      after,
      limit
    })
    const allUploadsAfter = (await listUploads(dbClient, user._id, { page: 1 })).uploads
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
    cargoPool = await getCargoPgPool(env)
  })

  after(async () => {
    await rwPg.end()
    await cargoPool.end()
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
        dagSize: 105, // To be updated
        actualSize: 1000
      }, {
        cid: await randomCid(),
        dagSize: 110,
        actualSize: 110
      }, {
        cid: await randomCid(),
        dagSize: 125, // To be updated
        actualSize: 90
      }, {
        cid: await randomCid(),
        dagSize: 0, // To be updated
        actualSize: 90
      }, {
        cid: await randomCid(),
        dagSize: 100,
        actualSize: null
      }, {
        cid: await randomCid(),
        dagSize: null, // To be updated
        actualSize: 10
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

  it('updates only when needed', async () => {
    const toBeUpdated = contentItems
      .filter((c) => getToBeUpdatedNull(c) || getToBeUpdatedWrong(c))
      .map(c => c.cid)

    const beforeContents = await getContents(dbClient, toBeUpdated)
    await updateDagSizesWrp({ user })
    const afterFirstRoundContents = await getContents(dbClient, toBeUpdated)

    const updatedCidsFirstRound = afterFirstRoundContents.filter((cAfter) => {
      const beforeContent = beforeContents.find((cBefore) => cAfter.cid === cBefore.cid)
      return beforeContent?.updated_at !== cAfter.updated_at
    })

    assert.deepStrictEqual(updatedCidsFirstRound.map(c => c.cid).sort(), toBeUpdated.slice().sort())

    await updateDagSizesWrp({ user })
    const afterSecondRoundContents = await getContents(dbClient, toBeUpdated)

    const updatedCidsSecondRound = afterSecondRoundContents.filter((cAfter) => {
      const firstRoundContent = afterFirstRoundContents.find((cFirstRound) => cAfter.cid === cFirstRound.cid)
      return firstRoundContent?.updated_at !== cAfter.updated_at
    })
    assert.strictEqual(updatedCidsSecondRound.length, 0)
  })
})
