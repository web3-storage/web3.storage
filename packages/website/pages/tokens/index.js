import clsx from 'clsx';
import Link from 'next/link';
import { useEffect } from 'react';

import TokenCreator from 'components/tokens/tokenCreator/tokenCreator';
import TokensManager from 'components/tokens/tokensManager/tokensManager';
import Button from 'components/button/button';
import { useTokens } from 'components/contexts/tokensContext';
import TokensData from '../../content/pages/app/tokens.json';

const Tokens = () => {
  const { tokens, fetchDate, isFetchingTokens, getTokens } = useTokens();
  const content = TokensData.page_content;
  // Initial fetch on component load
  useEffect(() => {
    if (!fetchDate && !isFetchingTokens) {
      getTokens();
    }
  }, [fetchDate, getTokens, isFetchingTokens]);

  return (
    <div className="page-container tokens-container grid">
      <div className="tokens-header">
        <h3>{content.heading}</h3>
        <TokenCreator content={TokensData.page_content.token_creator} />
      </div>
      <TokensManager content={TokensData.page_content.tokens_manager} />
      <div className="tokens-footer">
        <Button
          className={clsx('dashboard-link', !!tokens.length && 'hasTokens')}
          href={content.ui.return.url}
          variant={content.ui.return.theme}
        >
          <Link href={content.ui.return.url}>{content.ui.return.text}</Link>
        </Button>
        <div dangerouslySetInnerHTML={{ __html: content.ui.test_token }} className="testing-cta-container"></div>
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
      title: TokensData.seo.title,
      redirectTo: '/login',
      isRestricted: true,
    },
  };
}

export default Tokens;
