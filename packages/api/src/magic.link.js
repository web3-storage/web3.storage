export const createMagicTestTokenBypass = (
  requiredVariableName,
  requiredTokenValue
) => {
  return {
    requiredVariableName,
    requiredTokenValue,
    defaults: {
      issuer: 'test-magic-issuer'
    },
    summary: [
      'This is a bypass for testing our APIs even though most of them require a valid magic token.',
      'When testing, we\'ll use a special-use token.',
      'And our token-validating middleware will allow that token,',
      `but *only* when env.${requiredVariableName} is truthy.`
    ].join(' ')
  }
}

export const defaultBypassMagicLinkVariableName = 'DANGEROUSLY_BYPASS_MAGIC_AUTH'

export const magicLinkBypass = createMagicTestTokenBypass(
  defaultBypassMagicLinkVariableName,
  'test-magic'
)
