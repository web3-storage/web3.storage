import clsx from 'clsx';
import Link from 'next/link';
import { useEffect } from 'react';

import TokenCreator from 'components/tokens/tokenCreator/tokenCreator';
import TokensManager from 'components/tokens/tokensManager/tokensManager';
import Button, { ButtonVariant } from 'components/button/button';
import { useTokens } from 'components/contexts/tokensContext';

const Tokens = () => {
  const { tokens, fetchDate, isFetchingTokens, getTokens } = useTokens();

  // Initial fetch on component load
  useEffect(() => {
    if (!fetchDate && !isFetchingTokens) {
      getTokens();
    }
  }, [fetchDate, getTokens, isFetchingTokens]);

  return (
    <div className="page-container tokens-container grid">
      <div className="tokens-header">
        <h3>API Tokens</h3>
        <TokenCreator />
      </div>
      <TokensManager />
      <div className="tokens-footer">
        <Button
          className={clsx('dashboard-link', !!tokens.length && 'hasTokens')}
          href="/account"
          variant={ButtonVariant.TEXT}
        >
          <div>❯</div>
          <Link href="/account">Return to dashboard</Link>
        </Button>
        <span className="testing-cta">
          Want to test the token quickly? Paste it in{'\u00A0'}
          <Button
            href="https://bafybeic5r5yxjh5xpmeczfp34ysrjcoa66pllnjgffahopzrl5yhex7d7i.ipfs.dweb.link/"
            variant={ButtonVariant.TEXT}
          >
            <a
              href="https://bafybeic5r5yxjh5xpmeczfp34ysrjcoa66pllnjgffahopzrl5yhex7d7i.ipfs.dweb.link/"
              target="_blank"
              rel="noreferrer"
            >
              this demo website&nbsp;&nbsp;❯
            </a>
          </Button>
        </span>
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
      title: 'Manage API Tokens - web3.storage',
      redirectTo: '/login',
      isRestricted: true,
    },
  };
}

export default Tokens;
