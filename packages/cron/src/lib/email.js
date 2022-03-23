export const emailType = {
  Used75PercentStorage: 'Used75PercentStorage',
  Used80PercentStorage: 'Used80PercentStorage',
  Used85PercentStorage: 'Used85PercentStorage',
  Used90PercentStorage: 'Used90PercentStorage',
  UsedOver100PercentStorage: 'UsedOver100PercentStorage'
}

export class EmailService {
  /**
   * @param {{
 *   db: import('@web3-storage/db').DBClient
   * }} config
   */
  constructor ({ db }) {
    this.db = db
  }

  /**
   * Send an email to a user.
   * Checks email notification history for this user and email type to avoid
   * re-sending if user has been recently notified.
   * @param {import('@web3-storage/db/db-client-types').UserStorageUsed} user
   * @param {string} email
   * @param {number} daysSince
   * @returns void
   */
  async sendEmail (user, email, daysSince = 7) {
    // See if this email type has been sent recently
    if (await this.db.emailSentRecently(user.id, emailType[email], daysSince)) {
      return
    }

    // TODO Send the email

    // Get the message id from the mailing service for the email logging
    const messageId = '1'

    // Log the email
    await this.db.logEmailSent(user.id, emailType[email], messageId)
  }
}
