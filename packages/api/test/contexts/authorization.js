const symbol = Symbol.for('AuthorizationTestContext')

export const createMagicTestTokenHack = (
  requiredVariableName,
  requiredTokenValue
) => {
  return {
    requiredVariableName,
    requiredTokenValue,
    summary: [
      'This is a hack for testing our APIs even though most of them require a valid magic token.',
      'When testing, we\'ll use a special-use token.',
      'And our token-validating middleware will allow that token,',
      `but *only* when env.${requiredVariableName} is truthy.`
    ].join(' ')
  }
}

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
    magicBypassHack = createMagicTestTokenHack(
      'DANGEROUSLY_BYPASS_MAGIC_AUTH',
      'test-magic'
    )
  ) {
    this.magicBypassHack = magicBypassHack
  }

  /**
   * Create a bearer token that can be used by tests that require one to test something behind basic is-user checks
   */
  createUserToken () {
    return this.magicBypassHack.requiredTokenValue
  }
}
