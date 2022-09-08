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

export class ConstraintError extends Error {
  /**
   * @param {{
   *   message: string
   *   details?: string
   * }} cause
   */
  constructor ({ message, details }) {
    super(`${message}, details: ${details}`)
    this.name = 'ConstraintError'
    this.code = ConstraintError.CODE
  }
}

ConstraintError.CODE = 'CONSTRAINT_ERROR_DB'

export class RangeNotSatisfiableDBError extends Error {
  constructor (message) {
    super(message)
    this.name = 'RangeNotSatisfiableError'
    this.code = RangeNotSatisfiableDBError.CODE
  }
}

RangeNotSatisfiableDBError.CODE = 'RANGE_NOT_SATISFIABLE_ERROR_DB'
