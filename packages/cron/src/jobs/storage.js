import debug from 'debug'
import { EMAIL_TYPE, parseTextToNumber } from '@web3-storage/db'

const log = debug('storage:checkStorageUsed')

const supportEmail = 'support@web3.storage'

const USER_BY_USED_STORAGE_QUERY = `
  SELECT * FROM users_by_storage_used($1, $2, $3, $4)
`

const MAX_USER_ID_QUERY = `
 SELECT max(id)::TEXT as max from public.user
`

const USER_BY_EMAIL_QUERY = `
  SELECT id AS _id , email, name FROM public.user WHERE email=$1
`

const userByStorageRowToUser = (row) => {
  const storageQuota = parseTextToNumber(row.storage_quota)
  const storageUsed = parseTextToNumber(row.storage_used)
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    storageQuota,
    storageUsed,
    percentStorageUsed: Math.floor((storageUsed / storageQuota) * 100)
  }
}

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
 *  roPg: import('pg').Client
 *  emailService: import('../lib/email/service').EmailService
 *  userBatchSize?: number
 * }} config
 */
export async function checkStorageUsed ({ roPg, emailService, userBatchSize = 1000 }) {
  if (!log.enabled) {
    console.log('ℹ️ Enable logging by setting DEBUG=storage:checkStorageUsed')
  }
  log('🗄 Checking users storage quotas')

  /** @type {{ rows: Array.<{max: string}> }} */
  const { rows: maxIdResult } = await roPg.query(MAX_USER_ID_QUERY)
  const maxId = BigInt(maxIdResult[0].max)

  for (const email of STORAGE_QUOTA_EMAILS) {
    const usersOverQuota = []
    let startId = 0

    while (true) {
      const { rows: results } = await roPg.query(USER_BY_USED_STORAGE_QUERY, [
        email.fromPercent,
        email.toPercent,
        startId,
        userBatchSize
      ])

      const users = results
        .map(userByStorageRowToUser)

      if (email.emailType === EMAIL_TYPE.User100PercentStorage && users.length > 0) {
        usersOverQuota.push(...users)
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

      const maxFetchedId = users.pop().id
      if (maxFetchedId >= maxId) {
        log('🗄 Reached last user')
        break
      } else {
        startId = maxFetchedId + 1
      }
    }

    if (usersOverQuota.length > 0) {
      const { rows: results } = await roPg.query(USER_BY_EMAIL_QUERY, [supportEmail])

      if (!results.length) {
        throw new Error(`${supportEmail} does not exists`)
      }

      const toAdmin = results[0]

      const emailSent = await emailService.sendEmail(toAdmin, EMAIL_TYPE.AdminStorageExceeded, {
        secondsSinceLastSent: email.secondsSinceLastSent,
        templateVars: { users: usersOverQuota }
      })

      if (emailSent) {
        log('📧 Sent a list of users exceeding their quotas to admin')
      }
    }
  }

  log('✅ Done')
}
