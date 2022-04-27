import debug from 'debug'
import { EMAIL_TYPE } from '@web3-storage/db'

const log = debug('storage:checkStorageUsed')

const STORAGE_QUOTA_EMAILS = [
  {
    emailType: EMAIL_TYPE.User100PercentStorage,
    fromPercent: 100,
    // 1 day approx, with flexibility for cron irregularity
    secondsSinceLastSent: 60 * 60 * 23
  },
  {
    emailType: EMAIL_TYPE.User90PercentStorage,
    fromPercent: 90,
    toPercent: 100,
    // 1 day approx, with flexibility for cron irregularity
    secondsSinceLastSent: 60 * 60 * 23
  },
  {
    emailType: EMAIL_TYPE.User85PercentStorage,
    fromPercent: 85,
    toPercent: 90,
    // 1 week approx, with flexibility for cron irregularity
    secondsSinceLastSent: 60 * 60 * 24 * 7 - (60 * 60)
  },
  {
    emailType: EMAIL_TYPE.User80PercentStorage,
    fromPercent: 80,
    toPercent: 85,
    // 1 week approx, with flexibility for cron irregularity
    secondsSinceLastSent: 60 * 60 * 24 * 7 - (60 * 60)
  },
  {
    emailType: EMAIL_TYPE.User75PercentStorage,
    fromPercent: 75,
    toPercent: 80,
    // 1 week approx, with flexibility for cron irregularity
    secondsSinceLastSent: 60 * 60 * 24 * 7 - (60 * 60)
  }
]

/**
 * Get users with storage quota usage in percentage range and email them as
 * appropriate when approaching their storage quota limit.
 * @param {{
 *  db: import('@web3-storage/db').DBClient
 *  emailService: import('../lib/email.js').EmailService
 * }} config
 */
export async function checkStorageUsed ({ db, emailService }) {
  if (!log.enabled) {
    console.log('ℹ️ Enable logging by setting DEBUG=storage:checkStorageUsed')
  }

  log('🗄 Checking users storage quotas')

  for (const email of STORAGE_QUOTA_EMAILS) {
    const users = await db.getUsersByStorageUsed({
      fromPercent: email.fromPercent,
      ...(email.toPercent && { toPercent: email.toPercent })
    })

    if (users.length) {
      if (email.emailType === EMAIL_TYPE.User100PercentStorage) {
        const adminUser = await db.getUserByEmail('admin@web3.storage')

        const emailSent = await emailService.sendEmail(adminUser, EMAIL_TYPE.AdminStorageExceeded, {
          secondsSinceLastSent: email.secondsSinceLastSent,
          templateVars: { users }
        })

        if (emailSent) {
          log('📧 Sent a list of users exceeding their quotas to admin')
        }
      }

      for (const user of users) {
        const to = {
          id: Number(user.id),
          email: user.email,
          name: user.name
        }

        const emailSent = await emailService.sendEmail(to, email.emailType, {
          ...(email.secondsSinceLastSent && { secondsSinceLastSent: email.secondsSinceLastSent })
        })

        if (emailSent) {
          if (email.emailType === EMAIL_TYPE.User100PercentStorage) {
            log(`📧 Sent a quota exceeded email to ${user.name}: ${user.percentStorageUsed}% of quota used`)
          } else {
            log(`📧 Sent an email to ${user.name}: ${user.percentStorageUsed}% of quota used`)
          }
        }
      }
    }
  }

  log('✅ Done')
}
