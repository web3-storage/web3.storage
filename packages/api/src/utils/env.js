export function magicTestModeFromEnv(env) {
  return Boolean(env?.NEXT_PUBLIC_MAGIC_TESTMODE_ENABLED)
}
