import { useEffect } from 'react'
import { isLoggedIn } from './magic.js'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import constants from './constants.js'

/**
 * User Logged In Hook
 *
 * @param {Object} options
 * @param {string} [options.redirectTo]
 * @param {boolean} [options.redirectIfFound]
 * @param {boolean} [options.enabled]
 * @returns
 */
export function useLoggedIn({ redirectTo, redirectIfFound, enabled } = {}) {
  const router = useRouter()
  const { status, data: loggedIn, error, isFetching, isLoading } = useQuery('magic-user', isLoggedIn, {
    staleTime: constants.MAGIC_TOKEN_LIFESPAN,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })

  useEffect(() => {
    console.log('🚀 useLoggedIn')
    console.table({
      redirectTo,
      redirectIfFound,
      enabled,
      loggedIn,
      isFetching,
      isLoading,
      status,
      error
    })
    
    if (!redirectTo || isLoading || isFetching) {
      console.log('➡️ skipped')
      return
    }
    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !loggedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && loggedIn)
    ) {
      router.push(redirectTo)
      console.log(`➡️ redirected to ${redirectTo}`)
    }

    console.log(`➡️ ignored`)
  }, [redirectTo, redirectIfFound, status, isFetching, isLoading, loggedIn, router, enabled])

  return { status, isLoggedIn: loggedIn, error, isFetching, isLoading }
}
