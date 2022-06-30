import clsx from 'clsx';
import filesz from 'filesize';
import { useCallback, useMemo, useEffect, useState, useRef } from 'react';

import LockIcon from 'assets/icons/lock';
import Button, { ButtonVariant } from 'components/button/button';
import { useUser } from 'components/contexts/userContext';
import { elementIsInViewport } from 'lib/utils';
import StorageLimitRequestModal from 'components/storageLimitRequestModal/storageLimitRequestModal';

// Raw TiB number of bytes, to be used in calculations
const tebibyte = 1099511627776;
const defaultStorageLimit = tebibyte;

/**
 * @typedef {Object} StorageManagerProps
 * @property {string} [className]
 * @property {any} [content]
 */

/**
 *
 * @param {StorageManagerProps} props
 * @returns
 */
const StorageManager = ({ className = '', content }) => {
  const {
    usedStorage,
    storageLimitBytes,
    isLoading
  } = useUser();
  const uploaded = useMemo(() => usedStorage?.uploaded || 0, [usedStorage]);
  const psaPinned = useMemo(() => usedStorage?.psaPinned || 0, [usedStorage]);
  const limit = useMemo(() => storageLimitBytes || defaultStorageLimit, [storageLimitBytes]);
  const [componentInViewport, setComponentInViewport] = useState(false);
  const storageManagerRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [isUserRequestModalOpen, setIsUserRequestModalOpen] = useState(false);

  const { maxSpaceLabel, unlockLabel, percentUploaded, percentPinned } = useMemo(
    () => ({
      maxSpaceLabel: `${Math.floor(limit / tebibyte)} ${content.max_space_tib_label}`,
      unlockLabel: content.unlock_label,
      percentUploaded: Math.min((uploaded / limit) * 100, 100),
      percentPinned: Math.min((psaPinned / limit) * 100, 100),
    }),
    [uploaded, psaPinned, limit, content]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const result = elementIsInViewport(storageManagerRef.current);
      setComponentInViewport(result);
    }, 1000);

    const scroll = () => {
      if (!componentInViewport) {
        const result = elementIsInViewport(storageManagerRef.current);
        if (componentInViewport !== result) {
          setComponentInViewport(result);
        }
      }
    };
    window.addEventListener('scroll', scroll);
    return () => {
      window.removeEventListener('scroll', scroll);
      clearTimeout(timeout);
    };
  }, [componentInViewport]);

  const onSearchFiles = useCallback(() => {
    const input = /** @type {HTMLInputElement} */ (document.querySelector('.search-input'));
    const container = /** @type {HTMLInputElement} */ (document.querySelector('.files-manager-container'));
    input.focus();
    container.scrollIntoView(true);
  }, []);

  const uploadedStorageBarStyles = {
    width: !componentInViewport || percentUploaded === 0 ? '0' : `calc( max(${percentUploaded}%, 0.25rem) + 2rem)`,
    left: `-2rem`,
    transition: `${percentUploaded * 25}ms ease-out`,
    backgroundPosition: !componentInViewport ? '50% 0' : `0% 0`,
  };

  const pinnedStorageBarStyles = {
    width: !componentInViewport || percentPinned === 0 ? '0' : `calc( max(${percentPinned}%, 0.25rem) + 2rem)`,
    left: `calc( max(${percentUploaded}%, 0.25rem) - 2rem)`,
    transition: `${percentPinned * 25}ms ease-out ${percentUploaded * 25}ms`,
    backgroundPosition: !componentInViewport ? '50% 0' : `0% 0`,
  };

  return (
    <div ref={storageManagerRef} className={clsx('section storage-manager-container', className)}>
      <div className="storage-manager-space">
        <div className="storage-manager-used">
          {isLoading ? (
            content.loading
          ) : (
            <>
              {/* Used storage in GB */}
              <h2 className="storage-heading">{content.heading}</h2>:{' '}
              <span className="storage-number">
                {filesz(uploaded + psaPinned, {
                  base: 2,
                  standard: 'iec',
                })}
              </span>
              &nbsp;of <span className="storage-number">{maxSpaceLabel}</span> used
            </>
          )}
        </div>
        <Button onClick={onSearchFiles} variant={ButtonVariant.TEXT}>
          {content.buttons.search}
        </Button>
      </div>
      <div className="storage-manager-meter-container">
        <div className="storage-manager-meter">
          {/* Mapping out tiers into labeled sections */}
          <div className="storage-manager-meter-pinned" style={pinnedStorageBarStyles} />
          <div className="storage-manager-meter-uploaded" style={uploadedStorageBarStyles} />
          <span className="storage-manager-meter-label">{maxSpaceLabel}</span>
        </div>
        {!!unlockLabel && (
          <Button variant={ButtonVariant.TEXT} onClick={() => setIsUserRequestModalOpen(true)}>
            <span>
              <LockIcon />
              {unlockLabel}
            </span>
          </Button>
        )}
      </div>
      <div className={clsx('storage-manager-legend', uploaded > 0 || psaPinned > 0 ? '' : 'no-margin')}>
        {uploaded > 0 ? (
          <div className="sml-uploaded">
            <span className="legend-label">{content.legend.uploaded}&nbsp;</span>
            {filesz(uploaded, {
              base: 2,
              standard: 'iec',
            })}
          </div>
        ) : null}
        {psaPinned > 0 ? (
          <div className="sml-pinned">
            <span className="legend-label">{content.legend.pinned}&nbsp;</span>
            {filesz(psaPinned, {
              base: 2,
              standard: 'iec',
            })}
          </div>
        ) : null}
      </div>
      <div className="storage-manager-info">
        {content.prompt}&nbsp;
        <button className="storage-manager__storage-request-button" onClick={() => setIsUserRequestModalOpen(true)}>
          {content.buttons.request}
        </button>
      </div>
      {isUserRequestModalOpen && (
        <StorageLimitRequestModal isOpen={isUserRequestModalOpen} onClose={() => setIsUserRequestModalOpen(false)} />
      )}
    </div>
  );
};

export default StorageManager;
