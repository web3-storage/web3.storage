import debug from 'debug'
import { EMAIL_TYPE } from '@web3-storage/db'

const log = debug('storage:checkStorageUsed')

const supportEmail = 'support@web3.storage'

const USER_BY_USED_STORAGE_QUERY = `
  SELECT users_by_storage_used($1, $2, $3, $4)
`

const USER_BY_EMAIL_QUERY = `
  SELECT id AS _id , email, name FROM public.user WHERE email=$1
`

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
 *  roPg: import('pg').Client
 *  emailService: import('../lib/email/service').EmailService
 *  userBatchSize?: number
 * }} config
 */
export async function checkStorageUsed ({ db, roPg, emailService, userBatchSize = 100 }) {
  if (!log.enabled) {
    console.log('ℹ️ Enable logging by setting DEBUG=storage:checkStorageUsed')
  }

  log('🗄 Checking users storage quotas')

  for (const email of STORAGE_QUOTA_EMAILS) {
    let offset = 0

    while (true) {
      const { rows: results } = await roPg.query(USER_BY_USED_STORAGE_QUERY, [
        email.fromPercent,
        email.toPercent || 100,
        userBatchSize,
        offset
      ])

      if (!results.length) break

      const users = results.map((user) => {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          storageQuota: user.storage_quota,
          storageUsed: user.storage_used,
          percentStorageUsed: Math.floor((user.storage_used / user.storage_quota) * 100)
        }
      })

      if (email.emailType === EMAIL_TYPE.User100PercentStorage) {
        const { rows: results } = await roPg.query(USER_BY_EMAIL_QUERY, [supportEmail])

        if (results.length) {
          throw new Error(`${supportEmail} does not exists`)
        }

        const toAdmin = results[0]

        const emailSent = await emailService.sendEmail(toAdmin, EMAIL_TYPE.AdminStorageExceeded, {
          secondsSinceLastSent: email.secondsSinceLastSent,
          templateVars: { users }
        })

        if (emailSent) {
          log('📧 Sent a list of users exceeding their quotas to admin')
        }
      }

      for (const user of users) {
        const to = {
          _id: user.id,
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
      offset += userBatchSize
    }
  }

  log('✅ Done')
}
