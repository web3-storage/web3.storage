import clsx from 'clsx';
import { useCallback, useMemo } from 'react';

import LockIcon from 'assets/icons/lock';
import Button, { ButtonVariant } from 'components/button/button';

type StorageManagerProps = {
  className?: string;
};

enum StorageTiers {
  TIER_1 = '0',
  TIER_2 = '1',
  TIER_3 = '2',
}

const terabyte = 1099511627776;

const tier1Width = '6.5rem';
const tier2Width = '7.1825rem';
const storageInfo: {
  [key in StorageTiers]: {
    usageLabel: string;
    meterLabel: string;
    usageLimitInTB: number;
    maxWidth: string;
  };
} = {
  [StorageTiers.TIER_1]: {
    usageLabel: '1 TB',
    meterLabel: '<1 TB',
    usageLimitInTB: terabyte,
    maxWidth: tier1Width,
  },
  [StorageTiers.TIER_2]: {
    usageLabel: '10 TB',
    meterLabel: '1-10 TB',
    usageLimitInTB: terabyte * 10,
    maxWidth: tier2Width,
  },
  [StorageTiers.TIER_3]: {
    usageLabel: '10 TB+',
    meterLabel: '10TB+',
    usageLimitInTB: terabyte * 20,
    maxWidth: `calc(100% - (${tier1Width} + ${tier2Width}))`,
  },
};

const StorageManager = ({ className }: StorageManagerProps) => {
  // TODO: Hook up storage tier & storage used to redux state
  const storageTier = StorageTiers.TIER_2; // No tier available?
  const usedStorage = terabyte * 4; // in bytes

  const { usageLabel } = useMemo(() => storageInfo[storageTier], [storageTier]);

  // Tiered width calculation so bar fills proportionally to tier's allocation & user access level
  const calculatedWidth = useMemo(() => {
    // Determine usage relative to tier
    let storageLeft = usedStorage;

    const widths: string[] = [];
    Object.keys(storageInfo)
      // Filter out anything above the current tier if applicable
      .filter(key => key <= storageTier)
      // Mapping leftover results to storageInfo object
      .map(key => storageInfo[key])
      // Calculating width based off of storage used relative to each tier
      .forEach(({ usageLimitInTB, maxWidth }, index, currentArray) => {
        if (storageLeft > 0) {
          // Base starting point is the accumalation of all previous tier's usageLimitInTB
          const baseTBStart =
            index > 0
              ? // slicing all items up to the current index and combining usage limits to determine a start
                currentArray
                  .slice(0, index)
                  .reduce((acc, { usageLimitInTB: prevTierLimit }) => (acc += prevTierLimit) && acc, 0)
              : 0;

          widths.push(`calc(${Math.min((baseTBStart + storageLeft) / usageLimitInTB, 1)} * ${maxWidth})`);
          storageLeft -= usageLimitInTB;
        }
      });

    return `calc(${widths.join(' + ')})`;
  }, [usedStorage, storageTier]);

  const onSearchFiles = useCallback(() => {
    window.alert('Search File');
  }, []);

  const onMoreStorage = useCallback(() => {
    window.alert('Request more storage');
  }, []);

  return (
    <div className={clsx('section storage-manager-container', className)}>
      <div className="storage-manager-space">
        <div className="storage-manager-used">
          {/* Used storage in GB */}
          Storage: {usedStorage / 1073741824} GB of {usageLabel} used
        </div>
        <Button onClick={onSearchFiles} variant={ButtonVariant.TEXT}>
          Search my files{'\u00A0\u00A0'}❯
        </Button>
      </div>
      <div className="storage-manager-meter">
        {/* Mapping out tiers into labeled sections */}
        {Object.values(StorageTiers).map((tier, currentIndex, arr) => {
          const activeTierIndex = arr.indexOf(storageTier);
          const locked = currentIndex > activeTierIndex;
          const { meterLabel, maxWidth } = storageInfo[tier];
          return (
            <div
              key={tier}
              style={{ width: maxWidth }}
              className={clsx('storage-manager-meter-tier', locked && 'locked')}
            >
              <span>{meterLabel}</span>
              {locked && <LockIcon />}
            </div>
          );
        })}

        <div
          className="storage-manager-meter-used"
          style={{
            width: calculatedWidth,
          }}
        />
      </div>
      <div className="storage-manager-info">
        Need More?
        <Button onClick={onMoreStorage} variant={ButtonVariant.TEXT}>
          Unlock more free storage{'\u00A0\u00A0'}❯
        </Button>
      </div>
    </div>
  );
};

export default StorageManager;
