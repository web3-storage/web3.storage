import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useCallback, useState, useLayoutEffect, useRef } from 'react';

import Button, { ButtonVariant } from 'components/button/button';

const Tokens = () => {
  const inputRef = useRef();

  const { query } = useRouter();
  const [isCreating, setIsCreating] = useState(!!query.create);

  const onCreate = useCallback(() => {
    console.log('create that token!');
    setIsCreating(false);
  }, [setIsCreating]);

  useLayoutEffect(() => {
    console.log('oh!', inputRef.current);
    return !!isCreating && inputRef.current.focus();
  }, [isCreating]);

  return (
    <div className="token-creator-container">
      <div className={clsx(!isCreating && 'hidden')}>
        <input ref={inputRef} className="token-creator-input" placeholder="Name your token" />
        <button className="token-creator-submit" onClick={onCreate}>
          +
        </button>
      </div>
      <Button
        className={clsx('token-creator-create', isCreating && 'hidden')}
        href="/account"
        onClick={() => setIsCreating(true)}
        variant={ButtonVariant.TEXT}
      >
        + Create a new API Token
      </Button>
    </div>
  );
};

export default Tokens;
