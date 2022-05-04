/* eslint-env mocha */

import DummyEmailProvider from '../src/lib/email/providers/dummy.js'
import { EmailService } from '../src/lib/email/service.js'
import sinon from 'sinon'
import { EMAIL_TYPE } from '@web3-storage/db'
import assert from 'assert'
import { getDBClient } from '../src/lib/utils.js'
import MailchimpEmailProvider from '../src/lib/email/providers/mailchimp.js'
import { User100PercentStorage } from '../src/lib/email/types.js'

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
const aUser = { _id: 1, email: 'some.email@mail.com', name: 'aName' }

describe('Mail service', () => {
  let db
  let logStub

  beforeEach(() => {
    db = getDBClient(env)
    logStub = sinon.stub(db, 'logEmailSent')
  })

  it('should allow to setup different providers by setting env', () => {
    process.env.EMAIL_PROVIDER = 'dummy'
    const emailService = new EmailService({ db })
    const sendDummyEmailSpy = sinon.spy(DummyEmailProvider.prototype, 'sendEmail')
    const sendMailchimpEmailSpy = sinon.spy(MailchimpEmailProvider.prototype, 'sendEmail')
    emailService.sendEmail(aUser, EMAIL_TYPE.User100PercentStorage)
    assert.ok(sendDummyEmailSpy.calledOnce)
    assert.ok(sendMailchimpEmailSpy.notCalled)
  })

  it('should allow to setup different providers by passing it in the constructor', () => {
    const emailService = new EmailService({ db, provider: 'dummy' })
    const sendDummyEmailSpy = sinon.spy(DummyEmailProvider.prototype, 'sendEmail')
    const sendMailchimpEmailSpy = sinon.spy(MailchimpEmailProvider.prototype, 'sendEmail')
    emailService.sendEmail(aUser, EMAIL_TYPE.User100PercentStorage)
    assert.ok(sendDummyEmailSpy.calledOnce)
    assert.ok(sendMailchimpEmailSpy.notCalled)
  })

  it('delegates sending to provider', async () => {
    const emailService = new EmailService({ db, provider: 'dummy' })
    const sendEmailSpy = sinon.spy(DummyEmailProvider.prototype, 'sendEmail')
    const templateVars = {
      someKey: 'someValue'
    }
    sinon.stub(User100PercentStorage.prototype, 'formatTemplateVars').returns(templateVars)
    sinon.stub(User100PercentStorage.prototype, 'validateTemplateVars')

    await emailService.sendEmail(aUser, EMAIL_TYPE.User100PercentStorage, {
      templateVars
    })

    assert.ok(sendEmailSpy.calledOnceWith(
      EMAIL_TYPE.User100PercentStorage,
      aUser.email,
      aUser.name,
      'support@web3.storage',
      'Web3.Storage',
      templateVars
    ))
  })

  it('validates template vars for email type', () => {
    const emailService = new EmailService({ db, provider: 'dummy' })
    const validateSpy = sinon.spy(User100PercentStorage.prototype, 'validateTemplateVars')

    emailService.sendEmail(aUser, EMAIL_TYPE.User100PercentStorage)
    assert.ok(validateSpy.calledOnce)
  })

  it('validates template vars for email type', () => {
    const emailService = new EmailService({ db, provider: 'dummy' })
    const validateSpy = sinon.spy(User100PercentStorage.prototype, 'validateTemplateVars')

    emailService.sendEmail(aUser, EMAIL_TYPE.User100PercentStorage)
    assert.ok(validateSpy.calledOnce)
  })

  it('formats vars for email type', () => {
    const emailService = new EmailService({ db, provider: 'dummy' })
    const validateSpy = sinon.spy(User100PercentStorage.prototype, 'formatTemplateVars')

    emailService.sendEmail(aUser, EMAIL_TYPE.User100PercentStorage)
    assert.ok(validateSpy.calledOnce)
  })

  it('checks if email was sent recently when needed', () => {
    const emailService = new EmailService({ db, provider: 'dummy' })
    const emailHasBeenSentSpy = sinon.stub(db, 'emailHasBeenSent').returns(true)
    const sendMailchimpEmailSpy = sinon.spy(MailchimpEmailProvider.prototype, 'sendEmail')
    const secondsSinceLastSent = 1000

    emailService.sendEmail(aUser, EMAIL_TYPE.User100PercentStorage, {
      secondsSinceLastSent
    })

    assert.ok(emailHasBeenSentSpy.calledOnceWith({
      userId: aUser._id,
      emailType: EMAIL_TYPE.User100PercentStorage,
      secondsSinceLastSent
    }))
    assert.ok(sendMailchimpEmailSpy.notCalled)
  })

  it('logs the email has been sent', async () => {
    const emailService = new EmailService({ db, provider: 'dummy' })

    await emailService.sendEmail(aUser, EMAIL_TYPE.User100PercentStorage)

    assert.ok(logStub.calledOnceWith({ userId: aUser._id, emailType: EMAIL_TYPE.User100PercentStorage, messageId: sinon.match.any }))
  })

  it('raises if send fails', async () => {
    const emailService = new EmailService({ db, provider: 'dummy' })
    sinon.stub(DummyEmailProvider.prototype, 'sendEmail').returns(null)

    assert.rejects(async () => {
      await emailService.sendEmail(aUser, EMAIL_TYPE.User100PercentStorage)
    })
  })
})
