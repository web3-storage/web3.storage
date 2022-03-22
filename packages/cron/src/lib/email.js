export const emailType = {
  Used75PercentStorage: 'Used75PercentStorage',
  Used80PercentStorage: 'Used80PercentStorage',
  Used85PercentStorage: 'Used85PercentStorage',
  Used90PercentStorage: 'Used90PercentStorage',
  UsedOver100PercentStorage: 'UsedOver100PercentStorage'
}

export class EmailService {
  /**
   * @param {import('@web3-storage/db').DBClient} db
   */
  constructor (db, log) {
    this.db = db
    this.log = log
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

    // Send the email
    this.log(`📧 Sending an email to ${user.name}: ${user.percentStorageUsed}% of quota used`)

    // Get the message id from the mailing service
    const messageId = '1'

    // Log the email
    await this.db.logEmailSent(user.id, emailType[email], messageId)
  }
}
