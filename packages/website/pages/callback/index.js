import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from 'react-query';

import { redirectMagic, redirectSocial } from '../../lib/magic.js';
import Loading from '../../components/loading/loading.js';
import GeneralPageData from '../../content/pages/general.json';

export function getStaticProps() {
  const crumbs = GeneralPageData.breadcrumbs;
  return {
    props: {
      title: 'Login Redirect - Web3 Storage',
      breadcrumbs: [crumbs.index, crumbs.callback],
    },
  };
}

const Callback = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectUriQuery = router.query.redirect_uri;
  const redirectUri =
    (redirectUriQuery && Array.isArray(redirectUriQuery) ? redirectUriQuery[0] : redirectUriQuery) ?? '/account';
  useEffect(() => {
    const finishSocialLogin = async () => {
      try {
        await redirectSocial();
        await queryClient.invalidateQueries('magic-user');
        router.push(redirectUri);
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

        router.push(redirectUri);
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
  }, [router, router.query, queryClient, redirectUri]);

  // TODO handle errors
  return (
    <div className="page-container">
      <Loading />
    </div>
  );
};

export default Callback;
