import clsx from 'clsx';
import filesz from 'filesize';
import { useCallback, useMemo, useEffect, useState, useRef } from 'react';

import LockIcon from 'assets/icons/lock';
import emailContent from '../../../content/file-a-request';
import Button, { ButtonVariant } from 'components/button/button';
import { useUser } from 'components/contexts/userContext';
import { elementIsInViewport } from 'lib/utils';

// Raw TiB number of bytes, to be used in calculations
const tebibyte = 1099511627776;
const defaultStorageLimit = tebibyte;

/**
 * @typedef {Object} StorageManagerProps
 * @property {string} [className]
 * @property {any} [content]
 */

const mailTo = `mailto:${emailContent.mail}?subject=${emailContent.subject}&body=${encodeURIComponent(
  emailContent.body.join('\n')
)}`;

/**
 *
 * @param {StorageManagerProps} props
 * @returns
 */
const StorageManager = ({ className = '', content }) => {
  const {
    storageData: { data, isLoading },
  } = useUser();
  const uploaded = useMemo(() => data?.usedStorage?.uploaded || 0, [data]);
  const pinned = useMemo(() => data?.usedStorage?.pinned || 0, [data]);
  const limit = useMemo(() => data?.storageLimitBytes || defaultStorageLimit, [data]);
  const [componentInViewport, setComponentInViewport] = useState(false);
  const storageManagerRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  const { maxSpaceLabel, unlockLabel, percentUploaded, percentPinned } = useMemo(
    () => ({
      maxSpaceLabel: `${Math.floor(limit / tebibyte)} ${content.max_space_tib_label}`,
      unlockLabel: content.unlock_label,
      percentUploaded: (uploaded / limit) * 100,
      percentPinned: (pinned / limit) * 100,
    }),
    [uploaded, pinned, limit, content]
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
    width: !componentInViewport ? '0' : `${Math.min(percentUploaded, 100)}%`,
    transition: `${percentUploaded * 25}ms ease-out`,
    backgroundPosition: !componentInViewport ? '50% 0' : `0% 0`,
  };

  const pinnedStorageBarStyles = {
    width: !componentInViewport ? '0' : `calc(${Math.min(percentPinned, 100)}% + 2rem)`,
    left: `calc(${percentUploaded}% - 2rem)`,
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
              <span className="storage-label">{content.heading}</span>:{' '}
              <span className="storage-number">
                {filesz(uploaded + pinned, {
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
          <Button variant={ButtonVariant.TEXT} href={mailTo}>
            <a href={mailTo} target="_blank" rel="noreferrer">
              <LockIcon />
              {unlockLabel}
            </a>
          </Button>
        )}
      </div>
      <div className={clsx('storage-manager-legend', uploaded > 0 || pinned > 0 ? '' : 'no-margin')}>
        {uploaded > 0 ? (
          <div className="sml-uploaded">
            <span className="legend-label">{content.legend.uploaded}&nbsp;</span>
            {filesz(uploaded, {
              base: 2,
              standard: 'iec',
            })}
          </div>
        ) : null}
        {pinned > 0 ? (
          <div className="sml-pinned">
            <span className="legend-label">{content.legend.pinned}&nbsp;</span>
            {filesz(pinned, {
              base: 2,
              standard: 'iec',
            })}
          </div>
        ) : null}
      </div>
      <div className="storage-manager-info">
        {content.prompt}&nbsp;
        <a href={mailTo} target="_blank" rel="noreferrer">
          {content.buttons.request}
        </a>
      </div>
    </div>
  );
};

export default StorageManager;
