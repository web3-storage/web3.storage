import debug from 'debug'
import { EmailService } from '../lib/email.js'

const emailNotifications = [
  {
    emailType: 'Used75PercentStorage',
    fromPercent: 75,
    toPercent: 80,
    maxFrequencyDays: 7
  },
  {
    emailType: 'Used80PercentStorage',
    fromPercent: 80,
    toPercent: 85,
    maxFrequencyDays: 7
  },
  {
    emailType: 'Used85PercentStorage',
    fromPercent: 85,
    toPercent: 90,
    maxFrequencyDays: 7
  },
  {
    emailType: 'Used90PercentStorage',
    fromPercent: 90,
    toPercent: null,
    maxFrequencyDays: 1
  }
]

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

  for (const emailNotification of emailNotifications) {
    users = await db.getUsersByStorageUsed({
      fromPercent: emailNotification.fromPercent,
      toPercent: emailNotification.toPercent
    })
    users.forEach(async (user) => await emailService.sendEmail(
      user,
      emailNotification.emailType,
      emailNotification.maxFrequencyDays
    ))
  }

  log('✅ Done')
}
