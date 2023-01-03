/**
 * Given a value, return it parsed as json, if possible.
 * If parsing results in SyntaxError, just return the value
 */
export function maybeJsonParseable (value) {
  let parsedVal = value
  try {
    // in case the value parses to something false e.g. 'false' or '0'
    parsedVal = JSON.parse(value)
  } catch (error) {
    // @ts-ignore
    switch (error.name) {
      case 'SyntaxError':
        // it happens
        break
      default:
        // unexpected
        throw error
    }
  }
  return parsedVal
}

/**
 * @param {Record<string,any>} env
 * @param {string} [varName] - environment variable name to use, defaults to NEXT_PUBLIC_MAGIC_TESTMODE_ENABLED
 * @returns {boolean} whether magic.link testMode should be enabled
 */
export function magicTestModeIsEnabledFromEnv (env, varName = 'NEXT_PUBLIC_MAGIC_TESTMODE_ENABLED') {
  const envValue = env[varName]
  return Boolean(maybeJsonParseable(envValue))
}
