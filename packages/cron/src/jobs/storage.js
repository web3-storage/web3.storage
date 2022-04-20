import debug from 'debug'
import { EmailService } from '../lib/email.js'
import { EMAIL_TYPE } from '@web3-storage/db'

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

  emailService = new EmailService({ db })

  // Send email every day
  const usersStorageExceeded = await db.getUsersByStorageUsed({
    fromPercent: 100
  })
  if (usersStorageExceeded.length) {
    await emailService.sendAdminEmail({
      users: usersStorageExceeded,
      email: EMAIL_TYPE.AdminStorageExceeded,
      secondsSinceLastSent: 60 * 60 * 23
    })
    await emailService.sendUserEmails({
      users: usersStorageExceeded,
      email: EMAIL_TYPE.User100PercentStorage,
      secondsSinceLastSent: 60 * 60 * 23
    })
  }

  const usersFrom90to100 = await db.getUsersByStorageUsed({
    fromPercent: 90,
    toPercent: 100
  })
  if (usersFrom90to100.length) {
    await emailService.sendUserEmails({
      users: usersFrom90to100,
      email: EMAIL_TYPE.User90PercentStorage,
      secondsSinceLastSent: 60 * 60 * 23
    })
  }

  // Send email every 7 days
  const usersFrom85to90 = await db.getUsersByStorageUsed({
    fromPercent: 85,
    toPercent: 90
  })
  if (usersFrom85to90.length) {
    await emailService.sendUserEmails({
      users: usersFrom85to90,
      email: EMAIL_TYPE.User85PercentStorage
    })
  }

  const usersFrom80to85 = await db.getUsersByStorageUsed({
    fromPercent: 80,
    toPercent: 85
  })
  if (usersFrom80to85.length) {
    await emailService.sendUserEmails({
      users: usersFrom80to85,
      email: EMAIL_TYPE.User80PercentStorage
    })
  }

  const usersFrom75to80 = await db.getUsersByStorageUsed({
    fromPercent: 75,
    toPercent: 80
  })
  if (usersFrom75to80.length) {
    await emailService.sendUserEmails({
      users: usersFrom75to80,
      email: EMAIL_TYPE.User75PercentStorage
    })
  }

  log('✅ Done')
}
