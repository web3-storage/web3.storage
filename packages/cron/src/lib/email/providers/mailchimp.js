import MailchimpFactory from '@mailchimp/mailchimp_transactional'
import * as EmailTypeClasses from '../types.js'
import { EmailSendError } from '../errors.js'

/**
 * An email provider which sends emails using Mailchimp.
 * This contains all Mailchimp-specific logic and settings.
 */
export default class MailchimpEmailProvider {
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

    this.mailchimpTx = MailchimpFactory(process.env.MAILCHIMP_API_KEY)
  }

  /**
     * Sends the email of the given type to the given recipient.
     * Returns the unique message ID.
     * Throws EmailSendError if the sending failed.
     * @param {string} emailType
     * @param {string} toAddr
     * @param {string} toName
     * @param {string} fromAddr
     * @param {string} fromName
     * @param {Object.<string, any>} templateVars
     * @returns {Promise<string|undefined>}
     */
  async sendEmail (emailType, toAddr, toName, fromAddr, fromName, templateVars) {
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
        from_email: fromAddr,
        from_name: fromName,
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
      throw new EmailSendError(`📧 🚨 Mailchimp error: ${response.response.data.message}`)
    }
    response = response[0]
    if (response.status !== 'sent') {
      throw new EmailSendError(`📧 🚨 Mailchimp failed to send. Status: ${response.status}, reason: ${response.reject_reason}.`)
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
    const varDefs = Object.entries(templateVars).map(([name, content]) => {
      return { name, content }
    })
    return varDefs
  }
}
