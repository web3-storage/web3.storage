import debug from 'debug'
import { EMAIL_TYPE } from '@web3-storage/db'

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
   * Send an email to a user.
   * Optionally checks email sending history for this user and email type to avoid
   * re-sending if user has been recently notified.
   * @param {{id?: number, email: string, name: string}} user
   * @param {string} emailType
   * @param {object} [options]
   * @param {number} [options.secondsSinceLastSent]
   * @param {boolean} [options.failSilently]
   * @param {object} [options.templateVars]
   * @returns {Promise<boolean>} true if email sent otherwise false
   */
  async sendEmail (user, emailType, {
    secondsSinceLastSent = null,
    failSilently = false,
    templateVars = {}
  } = {}) {
    let userId
    if (!user.id) {
      const toUser = await this.db.getUserByEmail(user.email)
      if (!toUser) return false
      userId = Number(toUser._id)
    } else {
      userId = user.id
    }

    if (secondsSinceLastSent) {
      if (await this.db.emailHasBeenSent({
        userId,
        emailType: EMAIL_TYPE[emailType],
        secondsSinceLastSent
      })) {
        return false
      }
    }

    // TODO Send the email

    // Get the message id from the mailing service for the email logging
    const messageId = '1'

    await this.db.logEmailSent({
      userId,
      emailType: EMAIL_TYPE[emailType],
      messageId
    })

    return true
  }
}
