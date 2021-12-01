import clsx from 'clsx';
import { useCallback, useMemo } from 'react';

import Button, { ButtonVariant } from 'components/button/button';

type StorageManagerProps = {
  className?: string;
};

enum StorageTiers {
  TIER_1 = '0',
  TIER_2 = '1',
  TIER_3 = '2',
}

const StorageManager = ({ className }: StorageManagerProps) => {
  // TODO: Hook up storage tier & storage used to redux state
  const storageTier = 2; // No tier available?
  const usedStorage = 0; // in bytes

  const availableStorage = useMemo(
    () =>
      ({
        [StorageTiers.TIER_1]: '1TB',
        [StorageTiers.TIER_1]: '10TB',
        [StorageTiers.TIER_1]: '10TB+',
      }[storageTier]),
    [storageTier]
  );

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
        <div className="storage-manager-space">
          {/* Used storage in GB */}
          Storage: {usedStorage / 1073741824} GB of {availableStorage} used
        </div>
        <Button onClick={onSearchFiles} variant={ButtonVariant.TEXT}>
          Search my files ❯
        </Button>
      </div>
      <div className="storage-manager-meter"></div>
      <div className="storage-manager-info">
        Need More?
        <Button onClick={onMoreStorage} variant={ButtonVariant.TEXT}>
          Unlock more free storage ❯
        </Button>
      </div>
    </div>
  );
};

export default StorageManager;
