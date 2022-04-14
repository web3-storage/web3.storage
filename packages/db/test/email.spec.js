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
    let emailHasBeenSent = await dbClient.emailHasBeenSent({
      userId: Number(user._id),
      emailType: EMAIL_TYPE[EMAIL_TYPE.User100PercentStorage]
    })
    assert.strictEqual(emailHasBeenSent, false, 'Has not been sent')

    // log an email
    await dbClient.logEmailSent({
      userId: Number(user._id),
      emailType: EMAIL_TYPE[EMAIL_TYPE.User100PercentStorage],
      messageId: '1'
    })

    // check the email has already been sent today
    emailHasBeenSent = await dbClient.emailHasBeenSent({
      userId: Number(user._id),
      emailType: EMAIL_TYPE[EMAIL_TYPE.User100PercentStorage],
      secondsSinceLastSent: 60 * 60 * 23
    })
    assert.strictEqual(emailHasBeenSent, true, 'Has been sent')
  })
})
