import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from 'react-query';

import { redirectMagic, redirectSocial } from 'Lib/magic.js';

export function getStaticProps() {
  return {
    props: {
      title: 'Login Redirect - Web3 Storage',
      callback: true,
      needsLoggedIn: false,
    },
  };
}

const Callback = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const finishSocialLogin = async () => {
      try {
        await redirectSocial();
        await queryClient.invalidateQueries('magic-user');
        router.push('/account');
      } catch (err) {
        console.error(err);
        await queryClient.invalidateQueries('magic-user');
        router.push('/login');
      }
    };
    const finishEmailRedirectLogin = async () => {
      try {
        await redirectMagic();
        await queryClient.invalidateQueries('magic-user');
        router.push('/account');
      } catch (err) {
        console.error(err);
        await queryClient.invalidateQueries('magic-user');
        router.push('/login');
      }
    };
    if (!router.query.provider && router.query.magic_credential) {
      finishEmailRedirectLogin();
    }
    if (router.query.provider) {
      finishSocialLogin();
    }
  }, [router, router.query, queryClient]);

  // TODO handle errors
  return <div className="page-container" />;
};

export default Callback;
