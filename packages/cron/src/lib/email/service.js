import debug from 'debug'
import * as EmailTypeClasses from './types.js'

import { EmailSendError } from './errors.js'
import MailchimpEmailProvider from './providers/mailchimp.js'
import DummyEmailProvider from './providers/dummy.js'

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
   *   provider?: string
   * }} config
   */
  constructor ({ db, provider }) {
    if (!log.enabled) {
      console.log('ℹ️ Enable logging by setting DEBUG=email:EmailService')
    }
    this.db = db
    this.providerStr = provider || process.env.EMAIL_PROVIDER || 'mailchimp'
    this.provider = new EMAIL_PROVIDERS_MAP[this.providerStr]()

    log(`ℹ️ Using Email ${this.providerStr} provider`)

    this.fromAddr = EMAIL_FROM_ADDR
    this.fromName = EMAIL_FROM_NAME
  }

  /**
   * Send an email to a user.
   * Optionally checks email sending history for this user and email type to avoid
   * re-sending if user has been recently notified.
   * @param {{_id: string, email: string, name: string}} user
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
    let messageId

    if (secondsSinceLastSent) {
      if (await this.db.emailHasBeenSent({
        userId: user._id,
        emailType: emailType,
        secondsSinceLastSent
      })) {
        log(`📧 NOT sending email ${emailType} to user ${user._id}, as it's been sent too recently.`)
        return false
      }
    }

    // Send the email
    log(`📧 Sending email '${emailType}' to user ${user._id}.`)
    try {
      messageId = await this.provider.sendEmail(emailType, user.email, user.name, this.fromAddr, this.fromName, formattedVars)
    } catch (error) {
      console.error(`📧 🚨 Failed to send ${emailType} email to user ${user._id} using ${this.providerStr}.`)
      if (failSilently && error instanceof EmailSendError) {
        console.error(error)
        return
      } else {
        throw error
      }
    }
    // Log the email
    await this.db.logEmailSent({ userId: user._id, emailType, messageId })
    return true
  }
}

export const EMAIL_PROVIDERS = {
  mailchimp: 'mailchimp',
  dummy: 'dummy'
}

const EMAIL_PROVIDERS_MAP = {
  [EMAIL_PROVIDERS.mailchimp]: MailchimpEmailProvider,
  [EMAIL_PROVIDERS.dummy]: DummyEmailProvider
}
