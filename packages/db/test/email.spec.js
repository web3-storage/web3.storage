/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index.js'
import { createUser, token } from './utils.js'
import { EMAIL_TYPE } from '../constants.js'

describe('Email', () => {
  /** @type {DBClient} */
  const dbClient = new DBClient({
    endpoint: 'http://127.0.0.1:3000',
    token,
    postgres: true
  })

  it('checks email log before sending', async () => {
    const user = await createUser(dbClient, {
      name: 'test5-name',
      email: 'test5@email.com'
    })

    // check an email has not been sent
    let hasBeenSentRecently = await dbClient.emailSentRecently({
      userId: Number(user._id),
      emailType: EMAIL_TYPE[EMAIL_TYPE.Used100PercentStorage]
    })
    assert.strictEqual(hasBeenSentRecently, false, 'Has not been sent')

    // log an email
    await dbClient.logEmailSent({
      userId: Number(user._id),
      emailType: EMAIL_TYPE[EMAIL_TYPE.Used100PercentStorage],
      messageId: '1'
    })

    // check the email has already been sent today
    hasBeenSentRecently = await dbClient.emailSentRecently({
      userId: Number(user._id),
      emailType: EMAIL_TYPE[EMAIL_TYPE.Used100PercentStorage],
      numberOfDays: 1
    })
    assert.strictEqual(hasBeenSentRecently, true, 'Has been sent')
  })
})
