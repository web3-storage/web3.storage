import debug from 'debug'

const emailType = {
  Used75PercentStorage: 'Used75PercentStorage',
  Used80PercentStorage: 'Used80PercentStorage',
  Used85PercentStorage: 'Used85PercentStorage',
  Used90PercentStorage: 'Used90PercentStorage',
  UsedOver100PercentStorage: 'UsedOver100PercentStorage'
}

const log = debug('storage:checkStorageUsed')

/**
 * Get users with storage quota usage in percentage range and email them as
 * appropriate when approaching the storage quota limit.
 * @param {import('@web3-storage/db').DBClient} db
 */
export async function checkStorageUsed (db) {
  if (!log.enabled) {
    console.log('ℹ️  Enable logging by setting DEBUG=storage:checkStorageUsed')
  }

  log('🗄  Checking users storage quotas')

  let users
  const emailService = new EmailService(db)

  // Send email every day
  users = await db.getUsersByStorageUsed({
    fromPercent: 90
  })
  users.forEach(async (user) => await emailService.sendEmail(user, emailType.Used90PercentStorage, 1))

  // Send email every 7 days
  users = await db.getUsersByStorageUsed({
    fromPercent: 85,
    toPercent: 90
  })
  users.forEach(async (user) => await emailService.sendEmail(user, emailType.Used85PercentStorage))

  users = await db.getUsersByStorageUsed({
    fromPercent: 80,
    toPercent: 85
  })
  users.forEach(async (user) => await emailService.sendEmail(user, emailType.Used80PercentStorage))

  users = await db.getUsersByStorageUsed({
    fromPercent: 75,
    toPercent: 80
  })
  users.forEach(async (user) => await emailService.sendEmail(user, emailType.Used75PercentStorage))

  log('✅ Done')
}

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
    log(`📧 Sending an email to ${user.name}: ${user.percentStorageUsed}% of quota used`)

    // Get the message id from the mailing service
    const messageId = '1'

    // Log the email
    await this.db.logEmailSent(user.id, emailType[email], messageId)
  }
}
