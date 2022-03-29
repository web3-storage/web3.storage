import debug from 'debug'
// import * as mailchimp_transactional from '@mailchimp/mailchimp_transactional'
import MailChimpFactory from '@mailchimp/mailchimp_transactional'

const log = debug('email')

export const EMAIL_TYPES = [
  'Used75PercentStorage',
  'Used80PercentStorage',
  'Used85PercentStorage',
  'Used90PercentStorage'
]

// For now we just give each email type a fixed subject.
const EMAIL_SUBJECTS = {
  Used75PercentStorage: '75% of storage quota reached',
  Used80PercentStorage: '80% of storage quota reached',
  Used85PercentStorage: '85% of storage quota reached',
  Used90PercentStorage: '90% of storage quota reached'
}
// We might want to make these configurable via method parameters in future:
const EMAIL_FROM_ADDR = 'support@web3.storage'
const EMAIL_FROM_NAME = 'Web3.Storage'

/**
 * Provides an interface for sending emails.
 * This interface remains consistent regardless of which email provider is configured behind it.
 */
export class EmailService {
  /**
   * @param {import('@web3-storage/db').DBClient} db
   * @param {string|undefined} providerStr
   */
  constructor (db, providerStr) {
    this.db = db
    this.providerStr = providerStr || process.env.EMAIL_PROVIDER
    this.provider = new EMAIL_PROVIDERS[providerStr]()
  }

  /**
   * Send an email to a user.
   * Optionally checks email sending history for this user and email type to avoid
   * re-sending if user has been recently notified.
   * @param {{id: number, email: string, name: string}} user
   * @param {string} emailType
   * @param {object} options
   * @returns void
   */
  async sendEmail (user, emailType, {
    daysSince = null,
    failSilently = false,
    templateVars = {}
  } = {}) {
    if (!EMAIL_TYPES.includes(emailType)) {
      throw new Error(`Invalid email type ${emailType}.`)
    }
    // See if this email type has been sent recently
    if (daysSince && await this.db.emailSentRecently(user.id, emailType, daysSince)) {
      log(`📧 NOT sending email ${emailType} to ${user.name} (${user.email}), as it's already been sent in the last ${daysSince} days.`)
      return
    }
    // Send the email
    log(`📧 Sending email '${emailType}' to ${user.name} (${user.email}).`)
    // Get the message id from the mailing service
    const messageId = await this.provider.sendEmail(emailType, user.email, user.name, templateVars)
    if (messageId) {
      // Log the email
      await this.db.logEmailSent(user.id, emailType, messageId)
    } else {
      const msg = `📧🚨 Failed to send ${emailType} email to ${user.name} (${user.email}) using ${this.providerStr}.`
      if (failSilently) {
        log(msg)
      } else {
        throw new Error(msg)
      }
    }
  }
}


/**
 * An email provider which sends emails using MailChimp.
 */
class MailChimpEmailProvider {
  constructor () {
    this.templates = {
      Used75PercentStorage: 'user-storage-quota-warning-v1',
      Used80PercentStorage: 'user-storage-quota-warning-v1',
      Used85PercentStorage: 'user-storage-quota-warning-v1',
      Used90PercentStorage: 'user-storage-quota-warning-v1'
    }
    if (!process.env.MAILCHIMP_API_KEY) {
      throw new Error("MAILCHIMP_API_KEY environment variable is not set.")
    }
    // log(typeof mailchimp_transactional)
    // log(Object.keys(mailchimp_transactional))
    this.mailchimpTx = MailChimpFactory(process.env.MAILCHIMP_API_KEY)
    // this.mailchimpTx = mailchimp_transactional.default(process.env.MAILCHIMP_API_KEY)
  }

  /**
   * Sends the email of the given type to the given recipient.
   * Returns the unique message ID if successful, or undefined if the sending failed.
   * @param {string} emailType
   * @param {string} toAddr
   * @param {string} toName
   * @param {string} templateVars
   * @returns {Promise<string|undefined>}
   */
  async sendEmail(emailType, toAddr, toName, templateVars) {
    const fullVars = {...templateVars, ...this.getAdditionalVars(emailType)}
    // Restructure the template vars into the format that MailChimp requires
    const varDefs = []
    for (const property in fullVars) {
      varDefs.push({name: property, content: fullVars[property]})
    }
    const mergeVars = [{rcpt: toAddr, vars: varDefs}]
    const messageDef = {
      template_name: this.templates[emailType],
      template_content: [{}],
      message: {
        to: [{name: toName, email: toAddr}],
        subject: EMAIL_SUBJECTS[emailType],
        from_email: EMAIL_FROM_ADDR,
        from_name: EMAIL_FROM_NAME,
        merge_vars: mergeVars
        // There are various other options we can add in here, relating to tracking, IP address, etc
        // https://mailchimp.com/developer/transactional/api/messages/send-using-message-template/
      }
    }
    // The API returns an array of responses, one for each recipient, so we only need the first one
    const response = (await this.mailchimpTx.messages.sendTemplate(messageDef))[0]
    if (response.status !== "sent") {
      log(`📧🚨 MailChimp failed to send. Status: ${response.status}, reason: ${response.reject_reason}.`)
      return
    }
    return response._id
  }

  getAdditionalVars(emailType) {
    // In the DB we track each specific email type separately, but in MailChimp we reuse the same
    // template for several of these types. So this method provides the additional variables which
    // we need to pass into the template in order to customise it for the specific use case.
    const mapping = {
      Used75PercentStorage: {QUOTA_USED_PERCENT: '75'},
      Used80PercentStorage: {QUOTA_USED_PERCENT: '80'},
      Used85PercentStorage: {QUOTA_USED_PERCENT: '85'},
      Used90PercentStorage: {QUOTA_USED_PERCENT: '90'}
    }
    return mapping[emailType] || {}
  }
}

/**
 * An email provider which pretends to send emails.
 * For use in tests to allow for mocking/listening/checking.
 */
class DummyEmailProvider {

  async sendEmail(emailType, toAddr, toName, templateVars) {
    log(`📧 Dummy: email type ${emailType} to ${toName} (${toAddr}).`)
  }
}

const EMAIL_PROVIDERS = {
  mailchimp: MailChimpEmailProvider,
  dummy: DummyEmailProvider
}
