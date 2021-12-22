import Link from 'next/link';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { useQueryClient } from 'react-query';

import TokenRowItem from './tokenRowItem';
import countly from 'lib/countly';
import Loading from 'components/loading/loading';
import Button, { ButtonVariant } from 'components/button/button';
import { useTokens } from 'components/contexts/tokensContext';

const TokensManager = () => {
  const { tokens, fetchDate, isFetchingTokens, deleteToken, getTokens, isCreating } = useTokens();
  const [deletingTokenId, setDeletingTokenId] = useState('');
  const queryClient = useQueryClient();

  const deleteTokenCallback = useCallback(
    async id => {
      if (!window.confirm('Are you sure? Deleted tokens cannot be recovered!')) {
        return;
      }
      console.log('herr we gurr');
      setDeletingTokenId(id);

      try {
        await deleteToken(id);
      } finally {
        await queryClient.invalidateQueries('get-tokens');

        countly.trackEvent(countly.events.TOKEN_DELETE, {
          ui: countly.ui.TOKENS,
        });

        await getTokens();
        setDeletingTokenId('');
      }
    },
    [queryClient, deleteToken, setDeletingTokenId, getTokens]
  );

  return (
    <div className="section tokens-manager-container">
      <h4>API Tokens</h4>
      <TokenRowItem name="Name" secret="Token" isHeader />
      <div className="tokens-manager-table-content">
        {isFetchingTokens || !fetchDate ? (
          <Loading className={'tokens-manager-loading-spinner'} />
        ) : !tokens.length ? (
          <span className="tokens-manager-upload-cta">
            You don’t have any API Tokens created yet.{'\u00A0'}
            <Button
              className={clsx(isCreating && 'isDisabled')}
              href="/tokens?create=true"
              variant={ButtonVariant.TEXT}
              tracking={{ ui: countly.ui.TOKENS_EMPTY, action: 'New API Token' }}
            >
              <Link href="/tokens?create=true">Create your first API token.</Link>
            </Button>
          </span>
        ) : (
          tokens.map(({ name, secret, _id }) => (
            <TokenRowItem
              key={secret}
              id={_id}
              name={name}
              secret={secret}
              deletingTokenId={deletingTokenId}
              onTokenDelete={() => deleteTokenCallback(_id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TokensManager;
