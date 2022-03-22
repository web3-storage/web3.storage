import debug from 'debug'

const log = debug('email')

export class EmailService {
  /**
   * @param {import('@web3-storage/db').DBClient} db
   */
  constructor (db) {
    this.db = db
  }

  /**
   * Send an email to a user.
   * Checks email notification history for this user and email type to avoid
   * re-sending if user has been recently notified.
   * @param {{id: number, email: string, name: string}} user
   * @param {string} emailType
   * @param {number} daysSince
   * @returns void
   */
  async sendEmail (user, emailType, daysSince) {
    // See if this email type has been sent recently
    if (daysSince && await this.db.emailSentRecently(user.id, emailType, daysSince)) {
      log(`📧 NOT sending email '${emailType}' to ${user.name} (${user.email}), as it's already been sent in the last ${daysSince} days.`)
      return
    }

    // Send the email
    log(`📧 Sending email '${emailType}' to ${user.name} (${user.email}).`)

    // Get the message id from the mailing service
    const messageId = '1'

    // Log the email
    await this.db.logEmailSent(user.id, emailType, messageId)
  }
}
