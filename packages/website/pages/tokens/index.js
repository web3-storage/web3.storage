import clsx from 'clsx';
import { useEffect, useState } from 'react';

import TokenCreator from 'components/tokens/tokenCreator/tokenCreator';
import TokensManager from 'components/tokens/tokensManager/tokensManager';
import Button, { ButtonVariant } from 'components/button/button';
import { useTokens } from 'components/contexts/tokensContext';
import TokensData from '../../content/pages/app/tokens.json';
import { useUser } from 'hooks/use-user';
import PinningRequestModal from 'components/pinningRequestModal/pinningRequestModal';
import GeneralPageData from '../../content/pages/general.json';

const Tokens = () => {
  const { tokens, fetchDate, isFetchingTokens, getTokens } = useTokens();
  const [isPinningRequestModalOpen, setIsPinningRequestModalOpen] = useState(false);
  const user = useUser();
  const content = TokensData.page_content;
  // Initial fetch on component load
  useEffect(() => {
    if (!fetchDate && !isFetchingTokens) {
      getTokens();
    }
  }, [fetchDate, getTokens, isFetchingTokens]);

  return (
    <div className="page-container tokens-container">
      <div className="tokens-header">
        <h1 className="table-heading">{content.heading}</h1>

        {user?.info && !user.info.tags.HasPsaAccess && !user.info.tagProposals.HasPsaAccess && (
          <Button variant={ButtonVariant.TEXT} onClick={() => setIsPinningRequestModalOpen(true)}>
            {content.pinning_request.text}
          </Button>
        )}

        <TokenCreator content={TokensData.page_content.token_creator} />
      </div>
      <TokensManager content={TokensData.page_content.tokens_manager} />
      <div className="tokens-footer">
        <Button
          className={clsx('dashboard-link', !!tokens.length && 'hasTokens')}
          href={content.ui.return.url}
          variant={content.ui.return.theme}
        >
          {content.ui.return.text}
        </Button>
        <div dangerouslySetInnerHTML={{ __html: content.ui.test_token }} className="testing-cta-container"></div>
      </div>
      {isPinningRequestModalOpen && (
        <PinningRequestModal isOpen={isPinningRequestModalOpen} onClose={() => setIsPinningRequestModalOpen(false)} />
      )}
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
      title: TokensData.seo.title,
      redirectTo: '/login',
      isRestricted: true,
      breadcrumbs: [crumbs.index, crumbs.tokens],
    },
  };
}

export default Tokens;
