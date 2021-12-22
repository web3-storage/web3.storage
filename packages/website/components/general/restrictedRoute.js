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
 */

/**
 * A route wrapper that handles logic for restricted route access and redirecting
 *
 * @param {RestrictedRouteProps} props
 *
 * @returns
 */
const RestrictedRoute = ({ isRestricted = false, children, redirectTo, redirectIfFound = false }) => {
  const { push } = useRouter();
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
      push(redirectTo);
    }
  }, [redirectTo, redirectIfFound, isFetching, isLoading, isLoggedIn, push]);

  const shouldWaitForLoggedIn = isRestricted && !isLoggedIn;

  return !shouldWaitForLoggedIn ? (
    children
  ) : (
    <div className="page-container">
      <Loading />
    </div>
  );
};

export default RestrictedRoute;
