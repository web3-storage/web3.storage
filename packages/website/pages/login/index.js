import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { useQueryClient } from 'react-query';

import GithubSVG from 'assets/icons/github';
import Button from 'components/button/button';
import LoginData from '../../content/pages/app/login.json';
import countly, { trackEvent } from 'lib/countly';
import { loginEmail, loginSocial } from 'lib/magic';

const LoginType = {
  GITHUB: 'github',
  EMAIL: 'email',
};

const Login = () => {
  // App query client
  const queryClient = useQueryClient();

  // App wide methods
  const { push } = useRouter();

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

    try {
      await loginEmail(email || '');
      await queryClient.invalidateQueries('magic-user');
      push('/account');
    } catch (error) {
      setIsLoggingIn('');

      console.error('An unexpected error happened occurred:', error);

      // @ts-ignore Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196)
      setErrors({ email: error.message });
    }
  }, [email, push, queryClient]);

  // Callback for github login logic
  const onGithubLogin = useCallback(async () => {
    // Tracking event
    trackEvent(countly.events.LOGIN_CLICK, {
      ui: countly.ui.LOGIN,
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
              event: countly.events[pageContent.cta.event],
              ui: countly.ui[pageContent.cta.ui],
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
  return {
    props: {
      title: LoginData.seo.title,
      redirectTo: '/account',
      redirectIfFound: true,
      authOnLoad: false,
    },
  };
}

export default Login;
