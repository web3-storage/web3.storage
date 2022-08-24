import { magicTestModeIsEnabledFromEnv, maybeJsonParseable } from './utils/env.js'

const createMagicTestTokenBypass = (
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
    ].join(' '),
    isAllowedToken (env, token) {
      const allowDangerousTokens = env => Boolean(maybeJsonParseable(env[requiredVariableName]))
      const isRequiredTokenValue = (token) => token === requiredTokenValue
      return allowDangerousTokens(env) && isRequiredTokenValue(token)
    }
  }
}

export const defaultBypassMagicLinkVariableName = 'DANGEROUSLY_BYPASS_MAGIC_AUTH'

export const magicLinkBypassForUnitTestingWithTestToken = createMagicTestTokenBypass(
  defaultBypassMagicLinkVariableName,
  'test-magic'
)

/**
 * Create an object that represents configuration for how to bypass server-side auth when magic.link testMode is being used.
 * In this case, magic will give out tokens, but those tokens won't work in all possible ways with the magic sdk server-side, so sometimes a bypass is required.
 * It is common to use testMode in our end to end tests of user flows that require authentication through magic.link.
 */
function createMagicTestmodeBypasss () {
  return {
    isEnabledForToken (env, token) {
      if (!magicTestModeIsEnabledFromEnv(env)) {
        // magic testMode isn't enabled, so it can't be an allowed testMode token
        return false
      }
      return isMagicTestModeToken(token)
    },
    authenticateMagicToken (env, token) {
      const [, magicClaims] = env.magic.token.decode(token)
      return {
        issuer: magicClaims.iss
      }
    }
  }
}

export const magicLinkBypassForE2ETestingInTestmode = createMagicTestmodeBypasss()

function isMagicTestModeToken (token) {
  const parsed = JSON.parse(globalThis.atob(token))
  if (parsed.length !== 2) {
    // unexpeced parse
    return false
  }
  const claims = JSON.parse(parsed[1])
  const isTestModeSub = (claims) => claims.sub === 'TEST_MODE_USER_ID'
  const isTestModeAud = (claims) => claims.aud === 'TEST_MODE_CLIENT_ID'
  const isTestModeToken = [isTestModeAud(claims), isTestModeSub(claims)].every(Boolean)
  return isTestModeToken
}
