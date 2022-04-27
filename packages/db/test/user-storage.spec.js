/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index.js'
import {
  token,
  createUserWithFiles
} from './utils.js'

describe('Users used storage', () => {
  /** @type {DBClient} */
  const dbClient = new DBClient({
    endpoint: 'http://127.0.0.1:3000',
    token,
    postgres: true
  })

  beforeEach(async () => {
    await createUserWithFiles(dbClient, {
      email: 'test1@email.com',
      percentStorageUsed: 60
    })

    await createUserWithFiles(dbClient, {
      email: 'test2@email.com',
      percentStorageUsed: 79
    })

    await createUserWithFiles(dbClient, {
      email: 'test3@email.com',
      percentStorageUsed: 90
    })

    await createUserWithFiles(dbClient, {
      email: 'test4@email.com',
      percentStorageUsed: 145,
      storageQuota: 2199023255552
    })
  })

  it('returns user details needed for email', async () => {
    const users = await dbClient.getUsersByStorageUsed({
      fromPercent: 50
    })
    assert.strictEqual(users.length, 4, 'All valid users returned')
    assert.ok(!users.some(user => user.email === 'test5@email.com'), 'User with account restricted is not included')
    assert(users[0].name, 'User has a name')
    assert(users[0].email, 'User has an email')
    assert(users[0].storageQuota, 'User has storage quota')
    assert(users[0].storageUsed, 'User has storage quota used')
  })

  it('retrieves correct users in a range', async () => {
    const users = await dbClient.getUsersByStorageUsed({
      fromPercent: 70,
      toPercent: 95
    })
    assert.strictEqual(users.length, 2, 'Users with quota in a range')
    assert.strictEqual(users[0].email, 'test3@email.com')
    assert.strictEqual(users[1].email, 'test2@email.com')
  })

  it('retrieves users sorted by percent storage used descending', async () => {
    const users = await dbClient.getUsersByStorageUsed({
      fromPercent: 50
    })
    assert.strictEqual(users[0].percentStorageUsed, 145, 'Sorted by percent used storage descending')
    assert.strictEqual(users[1].percentStorageUsed, 90, 'Sorted by percent used storage descending')
    assert.strictEqual(users[2].percentStorageUsed, 79, 'Sorted by percent used storage descending')
    assert.strictEqual(users[3].percentStorageUsed, 60, 'Sorted by percent used storage descending')
  })

  it('uses user quota instead of default if one has been specified', async () => {
    const users = await dbClient.getUsersByStorageUsed({
      fromPercent: 90
    })
    assert.strictEqual(users.length, 2, 'Users with non-default quota included')
    assert.strictEqual(users[0].email, 'test4@email.com')
    assert.strictEqual(users[1].email, 'test3@email.com')
  })
})
