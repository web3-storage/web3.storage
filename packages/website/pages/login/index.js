import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { useQueryClient } from 'react-query';

import GithubSVG from '../../assets/icons/github.js';
import Button from '../../components/button/button.js';
import { loginEmail, loginSocial } from '../../lib/magic.js';
import analytics, { saEvent } from '../../lib/analytics.js';
import LoginData from '../../content/pages/app/login.json';
import GeneralPageData from '../../content/pages/general.json';

const LoginType = {
  GITHUB: 'github',
  EMAIL: 'email',
};

/**
 * Get the first thing
 * @template T
 * @param {T | T[] | undefined} thingOrThings
 */
function first(thingOrThings) {
  if (Array.isArray(thingOrThings)) {
    return thingOrThings[0];
  }
  return thingOrThings;
}

const Login = () => {
  // App query client
  const queryClient = useQueryClient();

  // App wide methods
  const { push, query } = useRouter();

  // Error states
  const [errors, setErrors] = useState(/** @type {{email?: string}} */ ({}));

  // User form data binding
  const [{ email }, setFormData] = useState(/** @type {{email?: string}} */ ({}));

  // Redirecting state
  const [isLoggingIn, setIsLoggingIn] = useState('');

  const pageContent = LoginData.page_content;

  // Callback for email login logic
  const onLoginWithEmail = useCallback(async () => {
    setErrors({ email: undefined });
    setIsLoggingIn(LoginType.EMAIL);
    const finalRedirectUri = first(query.redirect_uri) ?? '/account';
    try {
      await loginEmail(email || '', finalRedirectUri);
      await queryClient.invalidateQueries('magic-user');
      push(finalRedirectUri);
    } catch (error) {
      setIsLoggingIn('');

      console.error('An unexpected error happened occurred:', error);

      // @ts-ignore Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196)
      setErrors({ email: error.message });
    }
  }, [email, push, queryClient, query.redirect_uri]);

  // Callback for github login logic
  const onGithubLogin = useCallback(async () => {
    // Tracking event
    saEvent(analytics.events.LOGIN_CLICK, {
      ui: analytics.ui.LOGIN,
      action: 'Github',
      link: '',
    });

    // Logging in
    setIsLoggingIn(LoginType.GITHUB);
    loginSocial(LoginType.GITHUB);
  }, [setIsLoggingIn]);

  return (
    <div className="page-container login-container">
      <div className="login-content">
        <h3>{pageContent.heading}</h3>
        <button className="section section-github" onClick={onGithubLogin}>
          <GithubSVG /> {isLoggingIn === LoginType.GITHUB ? 'Redirecting...' : 'Github'}
        </button>
        <h3 className="login-type-divider">or</h3>
        <div className="section section-email">
          <input
            className={clsx('login-email', errors.email && 'error')}
            placeholder={pageContent.form_placeholder}
            onChange={useCallback(e => setFormData({ email: e.currentTarget.value }), [])}
          />
          <Button
            variant={pageContent.cta.theme}
            onClick={onLoginWithEmail}
            tracking={{
              event: analytics.events[pageContent.cta.event],
              ui: analytics.ui[pageContent.cta.ui],
              action: pageContent.cta.action,
            }}
            disabled={isLoggingIn === LoginType.EMAIL}
          >
            {pageContent.cta.text}
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Static Props
 *
 * @returns {{ props: import('components/types').PageProps}}
 */
export function getStaticProps() {
  const crumbs = GeneralPageData.breadcrumbs;
  return {
    props: {
      title: LoginData.seo.title,
      redirectTo: '/account',
      redirectIfFound: true,
      authOnLoad: false,
      breadcrumbs: [crumbs.index, crumbs.login],
    },
  };
}

export default Login;
