import clsx from 'clsx';
import filesz from 'filesize';
import { useCallback, useMemo, useEffect, useState, useRef } from 'react';

import LockIcon from 'assets/icons/lock';
import emailContent from '../../../content/file-a-request';
import Button, { ButtonVariant } from 'components/button/button';
import { useUser } from 'components/contexts/userContext';
import { elementIsInViewport } from 'lib/utils';

// Tiers available
export const StorageTiers = {
  TIER_1: '0',
  TIER_2: '1',
  TIER_3: '2',
};

// Raw TiB number of bytes, to be used in calculations
const tebibyte = 1099511627776;

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
  const storageTier = StorageTiers.TIER_1; // No tier available?
  const {
    storageData: { data, isLoading },
  } = useUser();
  const uploaded = useMemo(() => data?.usedStorage.uploaded || 0, [data]);
  const pinned = useMemo(() => data?.usedStorage.pinned || 0, [data]);
  const usedStorage = uploaded + pinned;
  const [componentInViewport, setComponentInViewport] = useState(false);
  const storageManagerRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  const { maxSpaceLabel, unlockLabel, usedSpacePercentage } = useMemo(
    () =>
      // Storage information by tier
      ({
        [StorageTiers.TIER_1]: {
          maxSpaceLabel: content.tiers[0].max_space_label,
          unlockLabel: content.tiers[0].unlock_label,
          usedSpacePercentage: (usedStorage / tebibyte) * 100,
        },
        [StorageTiers.TIER_2]: {
          maxSpaceLabel: content.tiers[1].max_space_label,
          unlockLabel: content.tiers[1].unlock_label,
          usedSpacePercentage: (usedStorage / (tebibyte * 10)) * 100,
        },
        [StorageTiers.TIER_3]: {
          maxSpaceLabel: `${Math.floor(usedStorage / (tebibyte * 10) + 1) + content.tiers[2].max_space_label}`,
          // every increment of 10 changes the amount of space used
          usedSpacePercentage: ((usedStorage % (tebibyte * 10)) / (tebibyte * 10)) * 100,
        },
      }[storageTier]),
    [storageTier, usedStorage, content.tiers]
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

  const progressBarStyles = {
    width: !componentInViewport ? '0' : `${Math.min(usedSpacePercentage, 100)}%`,
    transition: `${usedSpacePercentage * 25}ms ease-out`,
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
                {filesz(usedStorage, {
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
          <div className="storage-manager-meter-used" style={progressBarStyles} />
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
