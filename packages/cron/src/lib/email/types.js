/**
 * @file Provides classes, one for each of the EMAIL_TYPES, which provide:
 * - A subject for the email.
 * - A list of required template vars, which must be supplied when sending it.
 * - A function formatting those vars, as in-template formatting is limited.
 */

/**
 * Base class which should be extended for each of the EMAIL_TYPES to provide
 * information and utilities for sending emails of that type.
 * @property {string} subject
 * @property {string[]} requiredVars
 */
class EmailType {
  /** Validate that the given object of vars contains all of - and only - the
    * required keys for this email type.
    * @param {Object<string, any>} vars
    */
  validateTemplateVars (vars) {
    const provided = Object.keys(vars).sort()
    const expected = this.requiredVars.sort()
    if (JSON.stringify(provided) !== JSON.stringify(expected)) {
      throw Error(`Expected email vars ${expected} but got ${provided}`)
    }
  }

  /**
   * Perform any formatting of the template vars which are unlikely to be able
   * to be done in the template.
   * @param {Object<string, any>} vars
   * @returns {Object<string, any>} vars
   */
  formatTemplateVars (vars) {
    return vars
  }
}

export class User75PercentStorage extends EmailType {
  constructor () {
    super()
    this.subject = '75% of storage quota reached'
    this.requiredVars = []
  }
}

export class User80PercentStorage extends EmailType {
  constructor () {
    super()
    this.subject = '80% of storage quota reached'
    this.requiredVars = []
  }
}

export class User85PercentStorage extends EmailType {
  constructor () {
    super()
    this.subject = '85% of storage quota reached'
    this.requiredVars = []
  }
}

export class User90PercentStorage extends EmailType {
  constructor () {
    super()
    this.subject = '90% of storage quota reached'
    this.requiredVars = []
  }
}

export class User100PercentStorage extends EmailType {
  constructor () {
    super()
    this.subject = 'Storage quota exceeded'
    this.requiredVars = []
  }
}

export class AdminStorageExceeded extends EmailType {
  constructor () {
    super()
    this.subject = 'Users exceeding their storage quotas'
    this.requiredVars = ['users']
  }

  formatTemplateVars (vars) {
    // Reformat the bytes values of the storage quota and used storage values
    // to make them nicely human-readable. This is impossible in the templating
    // languages of most email providers, but is a display thing, so shouldn't
    // be the responsibility of the code which triggers the email sending.
    const users = []
    for (const user of vars.users) {
      users.push({
        ...user,
        lastUpdate: user.lastUpdate.toLocaleDateString('en-US'),
        storageQuota: this._bytesToTiBStr(user.storageQuota),
        storageUsed: this._bytesToTiBStr(user.storageUsed),
        percentStorageUsed: user.percentStorageUsed.toFixed(1)
      })
    }
    return { ...vars, users: users }
  }

  /** Convert a number of bytes to a human-readable string of Tebibytes */
  _bytesToTiBStr (bytes) {
    return `${(bytes / 1_099_511_627_776).toFixed(2)}TiB`
  }
}
