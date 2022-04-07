import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import countly from 'lib/countly';
import Button, { ButtonVariant } from 'components/button/button';
import { useTokens } from 'components/contexts/tokensContext';

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
  const { tokens, createToken, isCreating, getTokens } = useTokens();

  const onTokenCreate = useCallback(
    async e => {
      // Tracking
      countly.trackEvent(
        countly.events.TOKEN_CREATE,
        !tokens.length
          ? {
              ui: countly.ui.TOKENS_EMPTY,
              action: 'New API Token',
            }
          : {
              ui: countly.ui.NEW_TOKEN,
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
    <div className={clsx('token-creator-container', isCreating && 'isDisabled')}>
      {isCreating ? (
        content.loading_message
      ) : (
        <>
          <form className={clsx(!query.create && 'hidden', 'token-creator-input-container')} onSubmit={onTokenCreate}>
            <input
              ref={inputRef}
              required
              className="token-creator-input"
              placeholder={content.placeholder}
              onChange={handleInputValueChange}
              onBlur={() => {
                inputRef.current?.classList.add('unfocused');
              }}
            />
            <button className="token-creator-submit">{inputHasValue ? '→' : '+'}</button>
          </form>
          <Button
            className={clsx('token-creator-create', query.create && 'hidden')}
            href="/account"
            onClick={() => push('/tokens?create=true')}
            variant={ButtonVariant.TEXT}
          >
            {content.prompt}
          </Button>
        </>
      )}
    </div>
  );
};

export default TokenCreator;
