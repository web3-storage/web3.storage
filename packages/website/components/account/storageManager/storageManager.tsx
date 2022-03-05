import clsx from 'clsx';
import filesz from 'filesize';
import { useCallback, useMemo, useEffect, useState, useRef } from 'react';

import LockIcon from 'assets/icons/lock';
import emailContent from '../../../content/file-a-request';
import Button, { ButtonVariant } from 'components/button/button';
import { useUser } from 'components/contexts/userContext';
import { elementIsInViewport } from 'lib/utils';

// Tiers available
enum StorageTiers {
  TIER_1 = '0',
  TIER_2 = '1',
  TIER_3 = '2',
}

// Raw TiB number of bytes, to be used in calculations
const tebibyte = 1099511627776;

type StorageManagerProps = {
  className?: string;
  content?: any;
};

const mailTo = `mailto:${emailContent.mail}?subject=${emailContent.subject}&body=${encodeURIComponent(
  emailContent.body.join('\n')
)}`;

const StorageManager = ({ className = '', content }: StorageManagerProps) => {
  const storageTier = StorageTiers.TIER_1; // No tier available?
  const {
    storageData: { data, isLoading },
  } = useUser();
  const usedStorage = useMemo(() => data?.usedStorage || 0, [data]);
  const [componentInViewport, setComponentInViewport] = useState(false);
  const storageManagerRef = useRef<HTMLDivElement>(null);

  const { maxSpaceLabel, unlockLabel, usedSpacePercentage } = useMemo<{
    maxSpaceLabel: string;
    unlockLabel?: string;
    usedSpacePercentage: number;
  }>(
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
    const input: HTMLInputElement = document.querySelector('.search-input')!;
    const container: HTMLInputElement = document.querySelector('.files-manager-container')!;
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
