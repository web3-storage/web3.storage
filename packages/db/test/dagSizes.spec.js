/* eslint-env mocha */

import assert from 'assert'
import { DBClient } from '../index.js'
import { createCargoDag, createUpload, createUser, createUserAuthKey, dbEndpoint, getUpload, randomCid, token } from './utils.js'

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

  beforeEach(async () => {
    user = await createUser(dbClient)
    authKey = await createUserAuthKey(dbClient, user._id)
    // cid, public.content.dag_size, cargo.dag.size_actual
    contentItems = [
      [await randomCid(), 100, 100],
      [await randomCid(), 100, 1000],
      [await randomCid(), 100, 100],
      [await randomCid(), 100, 90],
      [await randomCid(), 0, 90],
      [await randomCid(), 100, null],
      [await randomCid(), null, null],
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

    updatedCids = await dbClient.fixDagSize(new Date(2010, 0, 0))
  })

  it('updates the incorrect sizes', async () => {
    const wrongSizes = contentItems.filter((c) => c[1] && c[2] && c[1] !== c[2])
    await Promise.all(wrongSizes.map(async c => {
      const u = await getUpload(dbClient, c[0], user._id)
      assert.strictEqual(u.dagSize, c[2])
    }))
    assert.strictEqual(wrongSizes.length, updatedCids.length)
    assert(wrongSizes.map(e => e[0]).every((e) => updatedCids.includes(e)))
  })

  it('does not update correct ones', async () => {
    const correctSizes = contentItems.filter((c) => c[1] === c[2])
    await Promise.all(correctSizes.map(async c => {
      const u = await getUpload(dbClient, c[0], user._id)
      assert.strictEqual(u.dagSize, c[1])
    }))
  })

  it('does not mess with correct ones', async () => {
    const nullOrZeroSizes = contentItems.filter((c) => c[1] === c[2])
    await Promise.all(nullOrZeroSizes.map(async c => {
      const u = await getUpload(dbClient, c[0], user._id)
      assert.strictEqual(u.dagSize, c[1])
    }))
  })
})
