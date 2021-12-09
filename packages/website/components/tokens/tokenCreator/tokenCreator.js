import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useCallback, useLayoutEffect, useRef } from 'react';

import Button, { ButtonVariant } from 'components/button/button';

const Tokens = () => {
  const inputRef = useRef();

  const { query, push } = useRouter();

  useLayoutEffect(() => {
    if (!!query.create) {
      inputRef.current.focus();
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
      >
        + Create a new API Token
      </Button>
    </div>
  );
};

export default Tokens;
