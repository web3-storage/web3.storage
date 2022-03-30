/* eslint-env mocha */

import assert from 'assert'
import { DBClient } from '../index.js'
import { createCargoDag, createUpload, createUser, createUserAuthKey, dbEndpoint, getUpload, listUploads, randomCid, token } from './utils.js'

function getToBeUpdatedNull (cItem) {
  return cItem[1] === null && // It's null in web3.storage
    cItem[2] !== null// It's has a size in cargo
}

function getToBeUpdatedWrong (cItem) {
  return cItem[1] !== cItem[2] && //  web3.storage value is different from cargo
    cItem[2] !== null // It's has a size in cargo
}

describe.only('Fix dag sizes migration', () => {
  /** @type {DBClient} */
  const dbClient = new DBClient({
    endpoint: dbEndpoint,
    token,
    postgres: true
  })
  let user
  let authKey
  let contentItems
  let updatedCids
  let allUploadsAfter
  let allUploadsBefore

  beforeEach(async () => {
    user = await createUser(dbClient)
    authKey = await createUserAuthKey(dbClient, user._id)
    // cid, public.content.dag_size, cargo.dag.size_actual
    contentItems = [
      [await randomCid(), 100, 100],
      [await randomCid(), 100, 1000], // To be updated
      [await randomCid(), 100, 100],
      [await randomCid(), 100, 90], // To be updated
      [await randomCid(), 0, 90], // To be updated
      [await randomCid(), 100, null],
      [await randomCid(), null, null], // To be updated
      [await randomCid(), 0, 0]
    ]
    for (let i = 0; i < contentItems.length; i++) {
      const c = contentItems[i]
      await Promise.all([
        createUpload(dbClient, user._id, authKey, c[0], {
          dagSize: c[1]
        }),
        createCargoDag(dbClient, {
          cid_v1: c[0],
          size_actual: c[2]
        })
      ])
    }

    allUploadsBefore = await listUploads(dbClient, user._id)
    updatedCids = await dbClient.fixDagSize(new Date(2010, 0, 0))
    allUploadsAfter = await listUploads(dbClient, user._id)
  })

  it('updates the incorrect sizes', async () => {
    const wrongSizes = contentItems.filter(getToBeUpdatedWrong)
    await Promise.all(wrongSizes.map(async c => {
      const u = await getUpload(dbClient, c[0], user._id)
      assert.strictEqual(u.dagSize, c[2], `Not updated ${c[0]}`)
    }))
  })

  it('updates the null sizes', async () => {
    const nullSizes = contentItems.filter(getToBeUpdatedNull)
    await Promise.all(nullSizes.map(async c => {
      const u = await getUpload(dbClient, c[0], user._id)
      assert.strictEqual(u.dagSize, c[2], `Not updated ${c[0]}`)
    }))
  })

  it('returns the cids of all the updated content', async () => {
    const toBeUpdated = contentItems.filter((c) => getToBeUpdatedNull(c) || getToBeUpdatedWrong(c))
    assert.strictEqual(toBeUpdated.length, updatedCids.length)
    assert(toBeUpdated.map(e => e[0]).every((e) => updatedCids.includes(e)))
  })

  it('does not mess with correct ones', async () => {
    const nullOrZeroSizes = contentItems.filter((c) => !getToBeUpdatedNull(c) && !getToBeUpdatedWrong(c))
    await Promise.all(nullOrZeroSizes.map(async c => {
      const u = await getUpload(dbClient, c[0], user._id)
      assert.strictEqual(u.dagSize, c[1])
      assert.strictEqual(allUploadsBefore.find((u) => u.cid === c[0]).updated_at,
        allUploadsAfter.find((u) => u.cid === c[0]).updated_at, `Updated date of ${c[0]}`)
    }))
  })

  it('updates the updated_at field', async () => {
    const nullOrZeroSizes = contentItems.filter((c) => !getToBeUpdatedNull(c) && !getToBeUpdatedWrong(c))
    await Promise.all(nullOrZeroSizes.map(async c => {
      const u = await getUpload(dbClient, c[0], user._id)
      assert.strictEqual(u.dagSize, c[1])
      assert.strictEqual(allUploadsBefore.find((u) => u.cid !== c[0]).updated_at,
        allUploadsAfter.find((u) => u.cid === c[0]).updated_at, `Not updated date of ${c[0]}`)
    }))
  })
})
