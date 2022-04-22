/* eslint-env mocha */
import {
  createUser,
  createUserAuthKey,
  createUpload,
  createPsaPinRequest
} from '../../db/test/utils.js'
import execa from 'execa'
import assert from 'assert'
import { getDBClient } from '../src/lib/utils.js'
import { EMAIL_TYPE } from '@web3-storage/db'
import { checkStorageUsed } from '../src/jobs/storage.js'
import { EmailService } from '../src/lib/email.js'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import * as pb from '@ipld/dag-pb'
import sinon from 'sinon'

const env = {
  DEBUG: '*',
  ENV: 'dev',
  CLUSTER_API_URL: 'http://localhost:9094',
  CLUSTER_IPFS_PROXY_API_URL: 'http://127.0.0.1:9095/api/v0/',
  CLUSTER_BASIC_AUTH_TOKEN: 'dGVzdDp0ZXN0',
  DATABASE: 'postgres',
  PG_REST_URL: 'http://localhost:3000',
  PG_REST_JWT: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTYwMzk2ODgzNCwiZXhwIjoyNTUwNjUzNjM0LCJyb2xlIjoic2VydmljZV9yb2xlIn0.necIJaiP7X2T2QjGeV-FhpkizcNTX8HjDDBAxpgQTEI'
}

describe('cron - check user storage quotas', () => {
  const dbClient = getDBClient(env)
  let test2user, test3user, test4user
  const pins = [
    {
      status: 'Pinning',
      location: {
        peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK6',
        peerName: 'web3-storage-sv15',
        region: 'region'
      }
    },
    {
      status: 'Pinned',
      location: {
        peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK7',
        peerName: 'web3-storage-sv16',
        region: 'region'
      }
    }
  ]

  async function randomCid (code = pb.code) {
    const hash = await sha256.digest(Buffer.from(`${Math.random()}`))
    return CID.create(1, code, hash).toString()
  }

  /**
   * Helper function to create a user with uploads and pin requests and a specified
   * percentage of storage quota used
   */
  async function createUserWithFiles ({
    email,
    percentStorageUsed,
    storageQuota = 1099511627776
  }) {
    const user = await createUser(dbClient, {
      email,
      name: email.replace('@email.com', '-name')
    })

    if (storageQuota !== 1099511627776) {
      // non-default storage quota
      await dbClient.createUserTag(Number(user._id), {
        tag: 'StorageLimitBytes',
        value: storageQuota.toString()
      })
    }

    const authKey = await createUserAuthKey(dbClient, Number(user._id), {
      name: `${email}-key`
    })

    const uploads = Math.floor(Math.random() * 5)
    const pinRequests = Math.floor(Math.random() * 5)
    const dagSize = Math.ceil(((percentStorageUsed / 100) * storageQuota) / (uploads + pinRequests))

    for (let i = 0; i < uploads; i++) {
      const cid = await randomCid()
      await createUpload(dbClient, Number(user._id), Number(authKey), cid, {
        dagSize
      })
    }

    for (let i = 0; i < pinRequests; i++) {
      const cid = await randomCid()
      await createPsaPinRequest(dbClient, authKey, cid, {
        dagSize,
        pins
      })
    }

    return user
  }

  beforeEach(async () => {
    await createUser(dbClient, {
      email: 'admin@web3.storage',
      name: 'Web3 Storage Admin'
    })

    await createUserWithFiles({
      email: 'test1@email.com',
      percentStorageUsed: 60
    })

    test2user = await createUserWithFiles({
      email: 'test2@email.com',
      percentStorageUsed: 79
    })

    test3user = await createUserWithFiles({
      email: 'test3@email.com',
      percentStorageUsed: 90
    })

    test4user = await createUserWithFiles({
      email: 'test4@email.com',
      percentStorageUsed: 145,
      storageQuota: 2199023255552
    })
  })

  it('can be executed', async () => {
    const { stderr: emailLog1 } = await execa('./src/bin/storage.js', { env })
    const log1Lines = emailLog1.split('\n')
    assert.match(log1Lines[0], /storage:checkStorageUsed 🗄 Checking users storage quotas/)
    assert.match(log1Lines[1], /storage:checkStorageUsed 📧 Sending a quota exceeded email to admin/)
    assert.match(log1Lines[2], /storage:checkStorageUsed 📧 Sending a quota exceeded email to test4-name: 145% of quota used/)
    assert.match(log1Lines[3], /storage:checkStorageUsed 📧 Sending an email to test3-name: 90% of quota used/)
    assert.match(log1Lines[4], /storage:checkStorageUsed 📧 Sending an email to test2-name: 79% of quota used/)
    assert.match(log1Lines[5], /storage:checkStorageUsed ✅ Done/)

    const adminUser = await dbClient.getUserByEmail('admin@web3.storage')
    assert.ok(adminUser, 'admin user found')
    const adminStorageExceeded = await dbClient.emailHasBeenSent({
      userId: Number(adminUser._id),
      emailType: EMAIL_TYPE.AdminStorageExceeded,
      secondsSinceLastSent: 60 * 60 * 23
    })
    assert.strictEqual(adminStorageExceeded, true, 'Admin storage exceeded email sent')

    const over75EmailSent = await dbClient.emailHasBeenSent({
      userId: Number(test2user._id),
      emailType: EMAIL_TYPE.User75PercentStorage,
      secondsSinceLastSent: 60 * 60 * 23
    })
    assert.strictEqual(over75EmailSent, true, 'Over 75% email sent')

    const over90EmailSent = await dbClient.emailHasBeenSent({
      userId: Number(test3user._id),
      emailType: EMAIL_TYPE.User90PercentStorage,
      secondsSinceLastSent: 60 * 60 * 23
    })
    assert.strictEqual(over90EmailSent, true, 'Over 90% email sent')

    const over100EmailSent = await dbClient.emailHasBeenSent({
      userId: Number(test4user._id),
      emailType: EMAIL_TYPE.User100PercentStorage,
      secondsSinceLastSent: 60 * 60 * 23
    })
    assert.strictEqual(over100EmailSent, true, 'Over 100% email sent')

    // Ensure emails are not re-sent
    const { stderr: emailLog2 } = await execa('./src/bin/storage.js', { env })
    const log2Lines = emailLog2.split('\n')
    assert.match(log2Lines[0], /storage:checkStorageUsed 🗄 Checking users storage quotas/)
    assert.match(log2Lines[1], /storage:checkStorageUsed ✅ Done/)
  })

  it('calls the email service with the correct parameters', async () => {
    const emailService = new EmailService({ db: dbClient })
    const sendEmailStub = sinon.stub(emailService, 'sendEmail')
    await checkStorageUsed({ db: dbClient, emailService })

    assert.strictEqual(sendEmailStub.getCalls().length, 4, 'email service called 4 times')

    assert.strictEqual(sendEmailStub.getCall(0).args[0].email, 'admin@web3.storage')
    assert.strictEqual(sendEmailStub.getCall(0).args[1], 'AdminStorageExceeded', 'admin exceeded daily check')
    assert.strictEqual(sendEmailStub.getCall(0).args[2].secondsSinceLastSent, 60 * 60 * 23)
    assert.ok(sendEmailStub.getCall(0).args[2].templateVars, 'users passed to email template')

    assert.strictEqual(sendEmailStub.getCall(1).args[0].email, 'test4@email.com')
    assert.strictEqual(sendEmailStub.getCall(1).args[1], 'User100PercentStorage', 'user exceeded daily check')
    assert.strictEqual(sendEmailStub.getCall(1).args[2].secondsSinceLastSent, 60 * 60 * 23)

    assert.strictEqual(sendEmailStub.getCall(2).args[0].email, 'test3@email.com')
    assert.strictEqual(sendEmailStub.getCall(2).args[1], 'User90PercentStorage', 'user daily check over 90')
    assert.strictEqual(sendEmailStub.getCall(2).args[2].secondsSinceLastSent, 60 * 60 * 23)

    assert.strictEqual(sendEmailStub.getCall(3).args[0].email, 'test2@email.com')
    assert.strictEqual(sendEmailStub.getCall(3).args[1], 'User75PercentStorage', 'user weekly check over 75')
    assert.strictEqual(sendEmailStub.getCall(3).args[2].secondsSinceLastSent, 60 * 60 * 24 * 7)
  })
})
