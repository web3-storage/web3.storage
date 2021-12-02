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

const storageInfo: {
  [key in StorageTiers]: {
    usageLabel: string;
    meterLabel: string;
  };
} = {
  [StorageTiers.TIER_1]: {
    usageLabel: '1 TB',
    meterLabel: '<1 TB',
  },
  [StorageTiers.TIER_2]: {
    usageLabel: '10 TB',
    meterLabel: '1-10 TB',
  },
  [StorageTiers.TIER_3]: {
    usageLabel: '10 TB+',
    meterLabel: '10TB+',
  },
};

const StorageManager = ({ className }: StorageManagerProps) => {
  // TODO: Hook up storage tier & storage used to redux state
  const storageTier = StorageTiers.TIER_1; // No tier available?
  const usedStorage = 1099511627776; // in bytes

  const { usageLabel } = useMemo(() => storageInfo[storageTier], [storageTier]);

  const onSearchFiles = useCallback(() => {
    window.alert('Search File');
  }, []);

  const onMoreStorage = useCallback(() => {
    window.alert('Request more storage');
  }, []);

  // 9 rem height
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
          const { meterLabel } = storageInfo[tier];
          return (
            <div
              key={tier}
              className={clsx('storage-manager-meter-tier', `storage-manager-meter-tier-${tier}`, locked && 'locked')}
            >
              <span>{meterLabel}</span>
              {locked && <LockIcon />}
            </div>
          );
        })}

        <div
          className="storage-manager-meter-used"
          style={{
            // TODO: Better width determination
            width: `${(usedStorage / (terabyte * 11)) * 100}%`,
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
