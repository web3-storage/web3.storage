import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { useQueryClient } from 'react-query';

import GithubSVG from 'assets/icons/github';
import Button, { ButtonVariant } from 'components/button/button';
import countly, { trackEvent } from 'lib/countly';
import { loginEmail, loginSocial } from 'lib/magic';
import { PageProps } from 'components/types';

enum LoginType {
  GITHUB = 'github',
  EMAIL = 'email',
}

const Login = () => {
  // App query client
  const queryClient = useQueryClient();

  // App wide methods
  const { push } = useRouter();

  // Error states
  const [errors, setErrors] = useState<{ email?: string }>({});

  // User form data binding
  const [{ email }, setFormData] = useState<{ email?: string }>({});

  // Redirecting state
  const [isLoggingIn, setIsLoggingIn] = useState('');

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
    // await authorizeAndNavigateToAccount('test:email');
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
        <h3>Log in with</h3>
        <button onClick={onGithubLogin}>
          <div className="section section-github">
            <GithubSVG /> {isLoggingIn === LoginType.GITHUB ? 'Redirecting...' : 'Github'}
          </div>
        </button>
        <h3 className="login-type-divider">or</h3>
        <div className="section section-email">
          <input
            className={clsx('login-email', errors.email && 'error')}
            placeholder="Enter your email"
            onChange={useCallback(e => setFormData({ email: e.currentTarget.value }), [])}
          />
          <Button
            variant={ButtonVariant.PINK_BLUE}
            onClick={onLoginWithEmail}
            tracking={{
              event: countly.events.LOGIN_CLICK,
              ui: countly.ui.LOGIN,
              action: 'Sign Up / Login',
            }}
            disabled={isLoggingIn === LoginType.EMAIL}
          >
            Sign up / Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export function getStaticProps(): { props: PageProps } {
  return {
    props: {
      title: 'Login - Web3 Storage',
      redirectTo: '/account',
      redirectIfFound: true,
      authOnLoad: false,
    },
  };
}

export default Login;
