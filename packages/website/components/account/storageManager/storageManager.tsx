import clsx from 'clsx';
import { useCallback, useMemo } from 'react';

import LockIcon from 'assets/icons/lock';
import emailContent from '../../../content/file-a-request';
import Button, { ButtonVariant } from 'components/button/button';

// Tiers available
enum StorageTiers {
  TIER_1 = '0',
  TIER_2 = '1',
  TIER_3 = '2',
}

// Raw TB number to be used in calculations
const terabyte = 1099511627776;

type StorageManagerProps = {
  className?: string;
  content?: object;
};

const mailTo = `mailto:${emailContent.mail}?subject=${emailContent.subject}&body=${encodeURIComponent(
  emailContent.body.join('\n')
)}`;

const StorageManager = ({ className = '', content }: StorageManagerProps) => {
  // TODO: Hook up storage tier & storage used to api
  const storageTier = StorageTiers.TIER_2; // No tier available?
  const usedStorage = terabyte * 8; // in bytes

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
          usedSpacePercentage: (usedStorage / terabyte) * 100,
        },
        [StorageTiers.TIER_2]: {
          maxSpaceLabel: content.tiers[1].max_space_label,
          unlockLabel: content.tiers[1].unlock_label,
          usedSpacePercentage: (usedStorage / (terabyte * 10)) * 100,
        },
        [StorageTiers.TIER_3]: {
          maxSpaceLabel: `${Math.floor(usedStorage / (terabyte * 10) + 1) + content.tiers[2].max_space_label}`,
          // every increment of 10 changes the amount of space used
          usedSpacePercentage: ((usedStorage % (terabyte * 10)) / (terabyte * 10)) * 100,
        },
      }[storageTier]),
    [storageTier, usedStorage, content.tiers]
  );

  const onSearchFiles = useCallback(() => {
    const input: HTMLInputElement = document.querySelector('.search-input')!;
    input.focus();
    input.scrollIntoView(true);
  }, []);

  return (
    <div className={clsx('section storage-manager-container', className)}>
      <div className="storage-manager-space">
        <div className="storage-manager-used">
          {/* Used storage in GB */}
          <span className="storage-label">{content.heading}</span>:{' '}
          <span className="storage-number">{usedStorage / terabyte}TB</span> of{' '}
          <span className="storage-number">{maxSpaceLabel}</span> used
        </div>
        <Button onClick={onSearchFiles} variant={ButtonVariant.TEXT}>
          {content.buttons.search}
          {'\u00A0\u00A0'}❯
        </Button>
      </div>
      <div className="storage-manager-meter-container">
        <div className="storage-manager-meter">
          {/* Mapping out tiers into labeled sections */}
          <div
            className="storage-manager-meter-used"
            style={{
              width: `${Math.min(usedSpacePercentage, 100)}%`,
            }}
          />
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
        {content.prompt}
        <Button variant={ButtonVariant.TEXT} href={mailTo}>
          <a href={mailTo} target="_blank" rel="noreferrer">
            {content.buttons.request}
          </a>
        </Button>
      </div>
    </div>
  );
};

export default StorageManager;
