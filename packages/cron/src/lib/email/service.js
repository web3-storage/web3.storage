import debug from 'debug'
import { EMAIL_TYPE } from '@web3-storage/db'
import * as EmailTypeClasses from './types.js'
import * as mailchimp from '@mailchimp/mailchimp_transactional'

// We might want to make these configurable via method parameters in future:
const EMAIL_FROM_ADDR = 'support@web3.storage'
const EMAIL_FROM_NAME = 'Web3.Storage'

const log = debug('email:EmailService')

/**
 * Provides an interface for sending emails.
 * This interface remains consistent regardless of which email provider is
 * configured behind it.
 */
export class EmailService {
  /**
   * @param {{
   *   db: import('@web3-storage/db').DBClient,
   *   [provider]: string
   * }} config
   */
  constructor ({ db, provider }) {
    if (!log.enabled) {
      console.log('ℹ️ Enable logging by setting DEBUG=email:EmailService')
    }
    this.db = db
    this.providerStr = provider || process.env.EMAIL_PROVIDER || 'mailchimp'
    this.provider = new EMAIL_PROVIDERS[this.providerStr]()
  }

  /**
   * Send an email to a user.
   * Optionally checks email sending history for this user and email type to avoid
   * re-sending if user has been recently notified.
   * @param {{_id: number, email: string, name: string}} user
   * @param {string} emailType
   * @param {Object} [options]
   * @param {number} [options.secondsSinceLastSent]
   * @param {boolean} [options.failSilently]
   * @param {Object.<string, any>} [options.templateVars]
   * @returns {Promise<boolean>} true if email sent otherwise false
   */
  async sendEmail (user, emailType, {
    secondsSinceLastSent = null,
    failSilently = false,
    templateVars = {}
  } = {}) {
    const type = new EmailTypeClasses[emailType]()
    type.validateTemplateVars(templateVars)
    const formattedVars = type.formatTemplateVars(templateVars)

    if (secondsSinceLastSent) {
      if (await this.db.emailHasBeenSent({
        userId: user._id,
        emailType: emailType,
        secondsSinceLastSent
      })) {
        log(`📧 NOT sending email ${emailType} to ${user.name} (${user.email}), as it's been sent too recently.`)
        return false
      }
    }

    // Send the email
    log(`📧 Sending email '${emailType}' to ${user.name} (${user.email}).`)
    const messageId = await this.provider.sendEmail(emailType, user.email, user.name, formattedVars)
    if (messageId) {
      // Log the email
      await this.db.logEmailSent({ userId: user._id, emailType, messageId })
    } else {
      const msg = `📧 🚨 Failed to send ${emailType} email to ${user.name} (${user.email}) using ${this.providerStr}.`
      if (failSilently) {
        log(msg)
      } else {
        throw new Error(msg)
      }
    }

    return true
  }
}

/**
 * An email provider which sends emails using Mailchimp.
 * This contains all Mailchimp-specific logic and settings.
 */
class MailchimpEmailProvider {
  constructor () {
    this.templates = {
      User75PercentStorage: 'user-storage-quota-warning',
      User80PercentStorage: 'user-storage-quota-warning',
      User85PercentStorage: 'user-storage-quota-warning',
      User90PercentStorage: 'user-storage-quota-warning',
      User100PercentStorage: 'user-storage-quota-exceeded',
      AdminStorageExceeded: 'admin-list-of-users-exceeding-quota'
    }
    if (!process.env.MAILCHIMP_API_KEY) {
      throw new Error('MAILCHIMP_API_KEY environment variable is not set.')
    }
    // log(typeof mailchimp_transactional)
    // log(Object.keys(mailchimp_transactional))
    const MailchimpFactory = mailchimp.default
    this.mailchimpTx = MailchimpFactory(process.env.MAILCHIMP_API_KEY)
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
  async sendEmail (emailType, toAddr, toName, templateVars) {
    const type = new EmailTypeClasses[emailType]()
    const varDefs = this._restructureVars({
      ...templateVars,
      ...this._getAdditionalVars(emailType)
    })
    const mergeVars = [{ rcpt: toAddr, vars: varDefs }]
    const messageDef = {
      template_name: this.templates[emailType],
      template_content: [],
      message: {
        to: [{ name: toName, email: toAddr }],
        subject: type.subject,
        from_email: EMAIL_FROM_ADDR,
        from_name: EMAIL_FROM_NAME,
        merge_vars: mergeVars,
        merge_language: 'handlebars'
        // There are various other options we can add in here, relating to tracking, IP address, etc
        // https://mailchimp.com/developer/transactional/api/messages/send-using-message-template/
      }
    }
    // It appears that the API returns a different type of response depending on the success or not.
    // If there's an overall problem with the request, the response is an object, but if it's
    // successful or if there's a problem with the message-level part of the request, it gives an
    // array of responses, one for each recipient.
    let response = await this.mailchimpTx.messages.sendTemplate(messageDef)
    if (!Array.isArray(response)) {
      console.error(`📧 🚨 Mailchimp error: ${response.response.data.message}`)
      return
    }
    response = response[0]
    if (response.status !== 'sent') {
      console.error(`📧 🚨 Mailchimp failed to send. Status: ${response.status}, reason: ${response.reject_reason}.`)
      return
    }
    return response._id
  }

  /**
   * In the DB we track each specific email type separately, but in Mailchimp we
   * reuse the same template for several of these types. So this method provides
   * the additional variables which we need to pass into the template in order
   * to customise it for the specific use case.
   */
  _getAdditionalVars (emailType) {
    const mapping = {
      User75PercentStorage: { quota_used_percent: '75' },
      User80PercentStorage: { quota_used_percent: '80' },
      User85PercentStorage: { quota_used_percent: '85' },
      User90PercentStorage: { quota_used_percent: '90' }
    }
    return mapping[emailType] || {}
  }

  /**
   * Restructure the template vars into the format that Mailchimp requires.
   */
  _restructureVars (templateVars) {
    const varDefs = []
    for (const [key, value] of Object.entries(templateVars)) {
      varDefs.push({ name: key, content: value })
    }
    return varDefs
  }
}

const EMAIL_PROVIDERS = {
  mailchimp: MailchimpEmailProvider
  // dummy: DummyEmailProvider
}
