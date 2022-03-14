export class DBError extends Error {
  /**
   * @param {{
   *   message: string
   *   details: string
   *   hint: string
   *   code: string
   * }} cause
   */
  constructor ({ message, details, hint, code }) {
    super(`${message}, details: ${details}, hint: ${hint}, code: ${code}`)
    this.name = 'DBError'
    this.code = DBError.CODE
  }
}

DBError.CODE = 'ERROR_DB'

export class CustomDBError extends Error {
  /**
   * @param {{
   *   message: string
   *   details?: string
   * }} cause
   */
  constructor ({ message, details }) {
    super(`${message}, details: ${details}`)
    this.name = 'CustomDBError'
    this.code = CustomDBError.CODE
  }
}

CustomDBError.CODE = 'CUSTOM_ERROR_DB'
