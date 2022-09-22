import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from 'react-query';

import Loading from 'components/loading/loading';
import { redirectMagic, redirectSocial } from 'lib/magic.js';

export function getStaticProps() {
  return {
    props: {
      title: 'Login Redirect - Web3 Storage',
    },
  };
}

const Callback = () => {
  const router = useRouter();
  console.log('callback router', {
    router,
    query: router.query,
  });
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
        const redirectUriQuery = router.query.redirect_uri;
        const redirectUri =
          redirectUriQuery && Array.isArray(redirectUriQuery) ? redirectUriQuery[0] : redirectUriQuery;
        router.push(redirectUri ?? '/account');
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
  return (
    <div className="page-container">
      <Loading />
    </div>
  );
};

export default Callback;
