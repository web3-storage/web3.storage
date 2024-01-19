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
      const [publicAddress, magicClaims] = env.magic.token.decode(token)
      return {
        issuer: magicClaims.iss,
        publicAddress
      }
    }
  }
}

export const magicLinkBypassForE2ETestingInTestmode = createMagicTestmodeBypasss()

function isMagicTestModeToken (token) {
  let parsed
  try {
    parsed = JSON.parse(globalThis.atob(token))
  } catch {
    return false
  }
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

/**
 * create a token parseable as a magic.link test mode token
 * @param {BigInt} publicAddress
 * @param {*} claims
 * @returns
 */
export function createMagicTestModeToken (
  publicAddress = BigInt(Math.round(Math.random() * Number.MAX_SAFE_INTEGER)),
  claims
) {
  const tokenClaims = {
    sub: 'TEST_MODE_USER_ID',
    aud: 'TEST_MODE_CLIENT_ID',
    iat: Date.now(),
    ext: '?',
    iss: '@web3-storage/api/test',
    nbf: 1,
    tid: 1,
    add: 1,
    ...claims
  }
  const tokenJson = JSON.stringify([`0x${publicAddress.toString(16)}`, JSON.stringify(tokenClaims)])
  const authToken = globalThis.btoa(tokenJson)
  return authToken
}
