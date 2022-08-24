import { magicLinkBypassForUnitTestingWithTestToken } from '../../src/magic.link.js'

const symbol = Symbol.for('AuthorizationTestContext')

export class AuthorizationTestContext {
  static install (testContext, constructorArgs = []) {
    const authzContext = new AuthorizationTestContext(...constructorArgs)
    testContext[symbol] = authzContext
  }

  static use (testContext) {
    if (!(symbol in testContext)) {
      throw new Error('cant use AuthorizationTestContext because it hasnt been installed yet')
    }
    return testContext[symbol]
  }

  constructor (
    bypass = magicLinkBypassForUnitTestingWithTestToken
  ) {
    this.bypass = bypass
  }

  /**
   * Create a bearer token that can be used by tests that require one to test something behind basic is-user checks
   */
  createUserToken () {
    return this.bypass.requiredTokenValue
  }
}
