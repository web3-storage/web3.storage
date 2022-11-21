import { BsPlus, BsArrowRight } from 'react-icons/bs';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import analytics, { saEvent } from 'lib/analytics';
import Button, { ButtonVariant } from 'components/button/button';
import { useTokens } from 'components/contexts/tokensContext';
import { useUser } from 'hooks/use-user';

/**
 * @typedef {Object} TokenCreatorProps
 * @property {object} [content]
 */

/**
 *
 * @param {TokenCreatorProps} props
 * @returns
 */
const TokenCreator = ({ content }) => {
  const inputRef = useRef(/** @type {HTMLInputElement|null} */ (null));
  const [inputHasValue, setInputHasValue] = useState(/** @type {boolean} */ (false));

  const { query, push, replace } = useRouter();
  const { tokens, createToken, isCreating, getTokens, hasError, errorMessage } = useTokens();

  const user = useUser();

  const onTokenCreate = useCallback(
    async e => {
      // Tracking
      saEvent(
        analytics.events.TOKEN_CREATE,
        !tokens.length
          ? {
              ui: analytics.ui.TOKENS_EMPTY,
              action: 'New API Token',
            }
          : {
              ui: analytics.ui.NEW_TOKEN,
              action: 'Create new token',
            }
      );

      e.preventDefault();

      if (!!inputRef.current?.value) {
        await createToken(inputRef.current?.value);
        await getTokens();
        push('/tokens');
      }
    },
    [push, tokens, getTokens, createToken]
  );

  useEffect(() => {
    const onAnimationEnd = () => {
      if (inputRef.current?.classList.contains('unfocused')) {
        delete query.create;

        replace(
          {
            query,
          },
          undefined,
          { shallow: true }
        );
      }

      inputRef.current?.classList.remove('unfocused');
      inputRef.current?.classList.remove('focused');
    };
    const input = inputRef.current;
    input?.addEventListener('animationend', onAnimationEnd);

    return () => {
      input?.removeEventListener('animationend', onAnimationEnd);
    };
  }, [replace, query]);

  useLayoutEffect(() => {
    if (!!query.create && !isCreating) {
      inputRef.current?.focus();
      inputRef.current?.classList.add('focused');
    }
  }, [query.create, isCreating]);

  const handleInputValueChange = () => {
    if (inputRef.current?.value !== '') {
      if (!inputHasValue) {
        setInputHasValue(true);
      }
    } else {
      if (inputHasValue) {
        setInputHasValue(false);
      }
    }
  };

  return (
    <div className={clsx('token-creator-container', isCreating && !hasError && 'isDisabled')}>
      {isCreating ? (
        <> {hasError ? <span>⚠ {errorMessage}</span> : content.loading_message} </>
      ) : (
        <>
          <form className={clsx(!query.create && 'hidden', 'token-creator-input-container')} onSubmit={onTokenCreate}>
            <input
              ref={inputRef}
              required
              className="token-creator-input"
              placeholder={content.placeholder}
              onChange={handleInputValueChange}
            />
            <button className="token-creator-submit">
              {inputHasValue ? <BsArrowRight></BsArrowRight> : <BsPlus></BsPlus>}
            </button>
          </form>
          {hasError ? (
            <>⚠ {errorMessage}</>
          ) : (
            <Button
              disabled={user?.info?.tags?.['HasAccountRestriction']}
              className={clsx('token-creator-create', query.create && 'hidden')}
              onClick={() => push('/tokens?create=true')}
              variant={ButtonVariant.TEXT}
              tooltip={
                user?.info?.tags?.['HasAccountRestriction']
                  ? 'You are unable to create API tokens when your account is blocked. Please contact support@web3.storage'
                  : ''
              }
            >
              {content.prompt}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default TokenCreator;
