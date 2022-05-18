/* eslint-env mocha */
import {
  createUser,
  createUserWithFiles
} from '../../db/test/utils.js'
import assert from 'assert'
import { getDBClient } from '../src/lib/utils.js'
import { EMAIL_TYPE } from '@web3-storage/db'
import { checkStorageUsed } from '../src/jobs/storage.js'
import { EmailService, EMAIL_PROVIDERS } from '../src/lib/email/service.js'
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
  let adminUser, test2user, test3user, test4user, emailService

  beforeEach(async () => {
    emailService = new EmailService({ db: dbClient, provider: EMAIL_PROVIDERS.dummy })
    adminUser = await createUser(dbClient, {
      email: 'admin@web3.storage',
      name: 'Web3 Storage Admin'
    })

    await createUserWithFiles(dbClient, {
      email: 'test1@email.com',
      percentStorageUsed: 60
    })

    test2user = await createUserWithFiles(dbClient, {
      email: 'test2@email.com',
      percentStorageUsed: 79
    })

    test3user = await createUserWithFiles(dbClient, {
      email: 'test3@email.com',
      percentStorageUsed: 90
    })

    test4user = await createUserWithFiles(dbClient, {
      email: 'test4@email.com',
      percentStorageUsed: 145,
      storageQuota: 2199023255552
    })
  })

  it('can be executed', async () => {
    sinon.spy(emailService.provider, 'sendEmail')

    await checkStorageUsed({ db: dbClient, emailService })

    assert.equal(emailService.provider.sendEmail.callCount, 4)

    // Admin email
    emailService.provider.sendEmail.calledWith(EMAIL_TYPE.AdminStorageExceeded, 'admin@web3.storage')

    // Users email
    emailService.provider.sendEmail.calledWith(EMAIL_TYPE.User75PercentStorage, 'test2@email.com')
    emailService.provider.sendEmail.calledWith(EMAIL_TYPE.User85PercentStorage, 'test3@email.com')
    emailService.provider.sendEmail.calledWith(EMAIL_TYPE.User100PercentStorage, 'test4@email.com')

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
    emailService.provider.sendEmail.resetHistory()
    await checkStorageUsed({ db: dbClient, emailService })

    sinon.assert.notCalled(emailService.provider.sendEmail)
  })

  it('calls the email service with the correct parameters', async () => {
    const sendEmailStub = sinon.stub(emailService, 'sendEmail')
    await checkStorageUsed({ db: dbClient, emailService })

    assert.strictEqual(sendEmailStub.getCalls().length, 4, 'email service called 4 times')

    assert.strictEqual(sendEmailStub.getCall(0).args[0].id, adminUser.id)
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
    assert.strictEqual(sendEmailStub.getCall(3).args[2].secondsSinceLastSent, 60 * 60 * 24 * 7 - (60 * 60))
  })
})
