/* eslint-env mocha */

import DummyEmailProvider from '../src/lib/email/providers/dummy.js'
import { EmailService } from '../src/lib/email/service.js'
import sinon from 'sinon'
import { EMAIL_TYPE } from '@web3-storage/db'
import assert from 'assert'
import { getDBClient } from '../src/lib/utils.js'
import MailchimpEmailProvider from '../src/lib/email/providers/mailchimp.js'
import { EmailSendError } from '../src/lib/email/errors.js'
import { User100PercentStorage } from '../src/lib/email/types.js'

const env = {
  DEBUG: '*',
  ENV: 'dev',
  DATABASE: 'postgres',
  PG_REST_URL: 'http://localhost:3000',
  PG_REST_JWT: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTYwMzk2ODgzNCwiZXhwIjoyNTUwNjUzNjM0LCJyb2xlIjoic2VydmljZV9yb2xlIn0.necIJaiP7X2T2QjGeV-FhpkizcNTX8HjDDBAxpgQTEI'
}
const aUser = { _id: '1', email: 'some.email@mail.com', name: 'aName' }

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

describe('Mailchimp provider', () => {
  let provider
  let sendTemplate

  beforeEach(() => {
    process.env.MAILCHIMP_API_KEY = 'test'
    provider = new MailchimpEmailProvider()
    sendTemplate = sinon.stub(provider, '_sendTemplate')
  })

  it('should call _sendTemplate', () => {
    provider.sendEmail(
      'User75PercentStorage', 'user@example.com', 'User Person', 'support@web3.storage', 'Web3.Storage', {}
    )
    assert.ok(sendTemplate.calledOnce)
  })

  it('should raise EmailSendError if API call fails', async () => {
    // The sendTemplate method has two different types of return value, depending on how it fails
    sendTemplate.returns({ response: { data: { message: 'There was an error' } } })
    assert.rejects(
      async () => {
        await provider.sendEmail(
          'User75PercentStorage', 'user@example.com', 'User Person', 'support@web3.storage', 'Web3.Storage', {}
        )
      },
      EmailSendError
    )
    sendTemplate.returns([{ status: 'not sent', reject_reason: 'something bad' }])
    assert.rejects(
      async () => {
        await provider.sendEmail(
          'User75PercentStorage', 'user@example.com', 'User Person', 'support@web3.storage', 'Web3.Storage', {}
        )
      },
      EmailSendError
    )
  })

  it('should return message ID if API call succeeds', async () => {
    sendTemplate.returns([{ status: 'sent', _id: 'abc' }])
    const returnVal = await provider.sendEmail(
      'User75PercentStorage', 'user@example.com', 'User Person', 'support@web3.storage', 'Web3.Storage', {}
    )
    assert.equal(returnVal, 'abc')
  })

  it('should pass template name corresponding to email type', async () => {
    sendTemplate.returns([{ status: 'sent', _id: 'abc' }])
    await provider.sendEmail(
      'User75PercentStorage', 'user@example.com', 'User Person', 'support@web3.storage', 'Web3.Storage', {}
    )
    const templateId = sendTemplate.getCall(0).args[0].template_name
    assert.equal(templateId, 'user-storage-quota-warning')
  })

  it('should pass vars in correct format', async () => {
    sendTemplate.returns([{ status: 'sent', _id: 'abc' }])
    await provider.sendEmail(
      'User75PercentStorage',
      'user@example.com',
      'User Person',
      'support@web3.storage',
      'Web3.Storage',
      { colour: 'blue' }
    )
    const mergeVars = sendTemplate.getCall(0).args[0].message.merge_vars
    assert.equal(mergeVars[0].rcpt, 'user@example.com')
    assert.ok(
      mergeVars[0].vars.every((varDef) => {
        return JSON.stringify(Object.keys(varDef).sort()) === JSON.stringify(['content', 'name'])
      })
    )
    assert.ok(
      mergeVars[0].vars.filter((varDef) => {
        return varDef.name === 'colour' && varDef.content === 'blue'
      })
    )
  })
})
