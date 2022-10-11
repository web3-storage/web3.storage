import { stringify } from 'querystring';

import { useRouter } from 'next/router';
import { useEffect } from 'react';

import Loading from 'components/loading/loading';
import { useAuthorization } from 'components/contexts/authorizationContext';

// ====================================================================== Restricted Route
/**
 * @typedef {Object} RestrictedRouteProps
 * @property {JSX.Element} children
 * @property {boolean} [isRestricted] whether or not this route is restricted to auhtenticated users
 * @property {string} [redirectTo] If redirectTo is set, redirect if the user was not found
 * @property {boolean} [redirectIfFound] If redirectIfFound is also set, redirect if the user was found.
 * @property {boolean} [requiresAuth] If requiresAuth is set and redirectTo isn't set then,
 *                                    redirect to the login page setting the return uri to this page
 */

/**
 * A route wrapper that handles logic for restricted route access and redirecting
 *
 * @param {RestrictedRouteProps} props
 *
 * @returns
 */
const RestrictedRoute = ({ isRestricted = false, children, redirectTo, redirectIfFound = false, requiresAuth }) => {
  const { push, asPath } = useRouter();
  const { isLoading, isFetching, isLoggedIn } = useAuthorization();

  useEffect(() => {
    if (!(redirectTo || requiresAuth) || isLoading || isFetching) {
      return;
    }
    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !isLoggedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && isLoggedIn)
    ) {
      push(redirectTo ?? '');
    } else if (requiresAuth && !isLoggedIn) {
      push(`/login/?${stringify({ redirect_uri: asPath })}`);
    }
  }, [redirectTo, redirectIfFound, isFetching, isLoading, isLoggedIn, push, asPath, requiresAuth]);

  const shouldWaitForLoggedIn = (isRestricted || requiresAuth) && !isLoggedIn;

  return !shouldWaitForLoggedIn ? (
    children
  ) : (
    <div className="page-container">
      <Loading />
    </div>
  );
};

export default RestrictedRoute;
