import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useCallback, useLayoutEffect, useRef } from 'react';

import countly from 'lib/countly';
import Button, { ButtonVariant } from 'components/button/button';

const TokenCreator = () => {
  const inputRef = useRef(/** @type {HTMLInputElement|null} */ (null));

  const { query, push } = useRouter();

  const tokens = []; // TODO: Hook up to tokens

  useLayoutEffect(() => {
    if (!!query.create) {
      inputRef.current?.focus();
    }
  }, [query.create]);

  return (
    <div className="token-creator-container">
      <div className={clsx(!query.create && 'hidden', 'token-creator-input-container')}>
        <input ref={inputRef} className="token-creator-input" placeholder="Name your token" />
        <button className="token-creator-submit" onClick={useCallback(() => push('/tokens'), [push])}>
          +
        </button>
      </div>
      <Button
        className={clsx('token-creator-create', query.create && 'hidden')}
        href="/account"
        onClick={useCallback(() => push('/tokens?create=true'), [push])}
        variant={ButtonVariant.TEXT}
        tracking={
          !!tokens.length
            ? {
                event: countly.events.TOKEN_CREATE,
                ui: countly.ui.NEW_TOKEN,
                action: 'Create new token',
              }
            : { ui: countly.ui.TOKENS_EMPTY, action: 'New API Token' }
        }
      >
        + Create a new API Token
      </Button>
    </div>
  );
};

export default TokenCreator;
