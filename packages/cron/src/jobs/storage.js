import debug from 'debug'
import { EmailService } from '../lib/email.js'
import { emailType } from '@web3-storage/db'

const log = debug('storage:checkStorageUsed')
let emailService

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
  emailService = new EmailService({ db })

  // Send email every day
  users = await db.getUsersByStorageUsed({
    fromPercent: 100
  })
  await emailService.sendEmails({
    users,
    email: emailType.Used100PercentStorage,
    numberOfDays: 1
  })

  users = await db.getUsersByStorageUsed({
    fromPercent: 90,
    toPercent: 100
  })
  await emailService.sendEmails({
    users,
    email: emailType.Used90PercentStorage,
    numberOfDays: 1
  })

  // Send email every 7 days
  users = await db.getUsersByStorageUsed({
    fromPercent: 85,
    toPercent: 90
  })
  await emailService.sendEmails({
    users,
    email: emailType.Used90PercentStorage
  })

  users = await db.getUsersByStorageUsed({
    fromPercent: 80,
    toPercent: 85
  })
  await emailService.sendEmails({
    users,
    email: emailType.Used90PercentStorage
  })

  users = await db.getUsersByStorageUsed({
    fromPercent: 75,
    toPercent: 80
  })
  await emailService.sendEmails({
    users,
    email: emailType.Used90PercentStorage
  })

  log('✅ Done')
}
