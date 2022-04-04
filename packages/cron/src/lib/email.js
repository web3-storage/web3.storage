import debug from 'debug'
import { emailType } from '@web3-storage/db'

const log = debug('email:EmailService')

export class EmailService {
  /**
   * @param {{
 *   db: import('@web3-storage/db').DBClient
   * }} config
   */
  constructor ({ db }) {
    if (!log.enabled) {
      console.log('ℹ️ Enable logging by setting DEBUG=email:EmailService')
    }
    this.db = db
  }

  /**
   * Send an email to several users.
   * @param {object} opts
   * @param {Array<import('@web3-storage/db/db-client-types').UserStorageUsedOutput>} opts.users
   * @param {string} opts.email
   * @param {number} [opts.numberOfDays]
   */
  async sendEmails ({
    users,
    email,
    numberOfDays = 7
  }) {
    await Promise.all(users.map((user) => {
      return this.sendEmail({
        user,
        email,
        numberOfDays
      })
    }))
  }

  /**
   * Send an email to a user.
   * Checks email notification history for this user and email type to avoid
   * re-sending if user has been recently notified.
   * @param {object} opts
   * @param {import('@web3-storage/db/db-client-types').UserStorageUsedOutput} opts.user
   * @param {string} opts.email
   * @param {number} opts.numberOfDays
  * @returns void
   */
  async sendEmail ({
    user,
    email,
    numberOfDays
  }) {
    // See if this email type has been sent recently
    if (await this.db.emailSentRecently({
      userId: Number(user.id),
      emailType: emailType[email],
      numberOfDays
    })) {
      return
    }

    if (email === emailType.Used100PercentStorage) {
      log(`📧 Sending a quota exceeded email to ${user.name}: ${user.percentStorageUsed}% of quota used`)
    } else {
      log(`📧 Sending an email to ${user.name}: ${user.percentStorageUsed}% of quota used`)
    }

    // TODO Send the email

    // Get the message id from the mailing service for the email logging
    const messageId = '1'

    // Log the email
    await this.db.logEmailSent({
      userId: Number(user.id),
      emailType: emailType[email],
      messageId
    })
  }
}
