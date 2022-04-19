import debug from 'debug'
import { EmailService } from '../lib/email.js'
import { EMAIL_TYPE } from '@web3-storage/db'

const log = debug('storage:checkStorageUsed')

const STORAGE_QUOTA_EMAILS = [
  {
    emailType: EMAIL_TYPE.User100PercentStorage,
    fromPercent: 100,
    secondsSinceLastSent: 60 * 60 * 23
  },
  {
    emailType: EMAIL_TYPE.User90PercentStorage,
    fromPercent: 90,
    toPercent: 100,
    secondsSinceLastSent: 60 * 60 * 23
  },
  {
    emailType: EMAIL_TYPE.User85PercentStorage,
    fromPercent: 85,
    toPercent: 90
  },
  {
    emailType: EMAIL_TYPE.User80PercentStorage,
    fromPercent: 80,
    toPercent: 85
  },
  {
    emailType: EMAIL_TYPE.User75PercentStorage,
    fromPercent: 75,
    toPercent: 80
  }
]

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

  const emailService = new EmailService({ db })

  for (const email of STORAGE_QUOTA_EMAILS) {
    const users = await db.getUsersByStorageUsed({
      fromPercent: email.fromPercent,
      ...email.toPercent && { toPercent: email.toPercent }
    })

    if (users.length) {
      if (email.emailType === EMAIL_TYPE.User100PercentStorage) {
        await emailService.sendAdminEmail({
          users,
          email: EMAIL_TYPE.AdminStorageExceeded,
          secondsSinceLastSent: 60 * 60 * 23
        })
      }

      await emailService.sendUserEmails({
        users,
        email: email.emailType,
        ...email.secondsSinceLastSent && { secondsSinceLastSent: email.secondsSinceLastSent }
      })
    }
  }

  log('✅ Done')
}
