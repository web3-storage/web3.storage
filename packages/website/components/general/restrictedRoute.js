import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useAuthorization } from 'components/contexts/authorizationContext';

// ====================================================================== Restricted Route
/**
 * @typedef {Object} RestrictedRouteProps
 * @property {import('react').ReactChildren} children
 * @property {boolean} [isRestricted] whether or not this route is restricted to auhtenticated users
 * @property {string} [redirectTo] If redirectTo is set, redirect if the user was not found
 * @property {boolean} [redirectIfFound] If redirectIfFound is also set, redirect if the user was found.
 */

/**
 * A route wrapper that handles logic for restricted route access and redirecting
 *
 * @param {RestrictedRouteProps} props
 */
export default function RestrictedRoute({ isRestricted = false, children, redirectTo, redirectIfFound = false }) {
  const router = useRouter();
  const { isLoading, isFetching, isLoggedIn } = useAuthorization();

  useEffect(() => {
    if (!redirectTo || isLoading || isFetching) {
      return;
    }
    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !isLoggedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && isLoggedIn)
    ) {
      router.push(redirectTo);
    }
  }, [redirectTo, redirectIfFound, isFetching, isLoading, isLoggedIn, router]);

  const shouldWaitForLoggedIn = isRestricted && !isLoggedIn;

  return (
    <>
      {/* TODO: Loading state */}
      {!shouldWaitForLoggedIn && children}
    </>
  );
}
