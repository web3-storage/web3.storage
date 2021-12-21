import Link from 'next/link';

import countly from 'lib/countly';
import Loading from 'components/loading/loading';
import Button, { ButtonVariant } from 'components/button/button';
import { useTokens } from 'components/contexts/tokensContext';

const TokensManager = () => {
  const { tokens, fetchDate, isFetchingTokens } = useTokens();
  console.log('done?!', tokens, fetchDate, isFetchingTokens);
  return (
    <div className="section tokens-manager-container">
      <h4>API Tokens</h4>
      <div className="tokens-manager-row tokens-manager-header">
        <span className="token-name">Name</span>
        <span className="token-id">Token</span>
      </div>
      <div className="tokens-manager-table-content">
        {isFetchingTokens || !fetchDate ? (
          <Loading className={'tokens-manager-loading-spinner'} />
        ) : !tokens.length ? (
          <span className="tokens-manager-upload-cta">
            You don’t have any API Tokens created yet.{'\u00A0'}
            <Button
              href="/tokens?create=true"
              variant={ButtonVariant.TEXT}
              tracking={{ ui: countly.ui.TOKENS_EMPTY, action: 'New API Token' }}
            >
              <Link href="/tokens?create=true">Create your first API token.</Link>
            </Button>
          </span>
        ) : (
          <div>TODO: Tokens content</div>
        )}
      </div>
    </div>
  );
};

export default TokensManager;
