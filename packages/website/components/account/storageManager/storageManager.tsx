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

const mailTo = `mailto:${emailContent.mail}?subject=${emailContent.subject}&body=${encodeURIComponent(
  emailContent.body.join('\n')
)}`;

const StorageManager = ({ className = '' }) => {
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
          maxSpaceLabel: '1 TB',
          unlockLabel: '1-10+ TB',
          usedSpacePercentage: (usedStorage / terabyte) * 100,
        },
        [StorageTiers.TIER_2]: {
          maxSpaceLabel: '10 TB',
          unlockLabel: '10+ TB',
          usedSpacePercentage: (usedStorage / (terabyte * 10)) * 100,
        },
        [StorageTiers.TIER_3]: {
          maxSpaceLabel: `${Math.floor(usedStorage / (terabyte * 10) + 1)}0+ TB`,
          // every increment of 10 changes the amount of space used
          usedSpacePercentage: ((usedStorage % (terabyte * 10)) / (terabyte * 10)) * 100,
        },
      }[storageTier]),
    [storageTier, usedStorage]
  );

  const onSearchFiles = useCallback(() => {
    window.alert('Search File');
  }, []);

  return (
    <div className={clsx('section storage-manager-container', className)}>
      <div className="storage-manager-space">
        <div className="storage-manager-used">
          {/* Used storage in GB */}
          Storage: {usedStorage / terabyte}TB of {maxSpaceLabel} used
        </div>
        <Button onClick={onSearchFiles} variant={ButtonVariant.TEXT}>
          Search my files{'\u00A0\u00A0'}❯
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
        Need more free storage?
        <Button variant={ButtonVariant.TEXT} href={mailTo}>
          <a href={mailTo} target="_blank" rel="noreferrer">
            Submit a request
          </a>
        </Button>
      </div>
    </div>
  );
};

export default StorageManager;
