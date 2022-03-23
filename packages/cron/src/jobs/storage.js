import debug from 'debug'
import { emailType, EmailService } from '../lib/email.js'

const log = debug('storage:checkStorageUsed')

/**
 * Get users with storage quota usage in percentage range and email them as
 * appropriate when approaching their storage quota limit.
 * @param {{
 *   db: import('@web3-storage/db').DBClient
 * }} config
 */
export async function checkStorageUsed ({ db }) {
  if (!log.enabled) {
    console.log('ℹ️ Enable logging by setting DEBUG=storage:checkStorageUsed')
  }

  log('🗄 Checking users storage quotas')

  let users
  const emailService = new EmailService({ db })

  // Send email every day
  users = await db.getUsersByStorageUsed({
    fromPercent: 90
  })
  users.forEach(async (user) => {
    log(`📧 Sending an email to ${user.name}: ${user.percentStorageUsed}% of quota used`)
    await emailService.sendEmail(user, emailType.Used90PercentStorage, 1)
  })

  // Send email every 7 days
  users = await db.getUsersByStorageUsed({
    fromPercent: 85,
    toPercent: 90
  })
  users.forEach(async (user) => {
    log(`📧 Sending an email to ${user.name}: ${user.percentStorageUsed}% of quota used`)
    await emailService.sendEmail(user, emailType.Used85PercentStorage)
  })

  users = await db.getUsersByStorageUsed({
    fromPercent: 80,
    toPercent: 85
  })
  users.forEach(async (user) => {
    log(`📧 Sending an email to ${user.name}: ${user.percentStorageUsed}% of quota used`)
    await emailService.sendEmail(user, emailType.Used80PercentStorage)
  })

  users = await db.getUsersByStorageUsed({
    fromPercent: 75,
    toPercent: 80
  })
  users.forEach(async (user) => {
    log(`📧 Sending an email to ${user.name}: ${user.percentStorageUsed}% of quota used`)
    await emailService.sendEmail(user, emailType.Used75PercentStorage)
  })

  log('✅ Done')
}
