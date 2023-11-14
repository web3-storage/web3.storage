import clsx from 'clsx';
import filesz from 'filesize';
import { useMemo, useEffect, useState, useRef } from 'react';

import { useUser } from 'components/contexts/userContext';
import { elementIsInViewport, formatAsStorageAmount } from 'lib/utils';
import { usePayment } from '../../../hooks/use-payment';
import Tooltip from 'ZeroComponents/tooltip/tooltip';
import InfoIcon from 'assets/icons/info';

// Raw TiB number of bytes, to be used in calculations
const tebibyte = 1099511627776;
const gibibyte = 1073741824;
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
    storageData: { data, isLoading },
  } = useUser();
  const { currentPlan } = usePayment();
  const uploaded = useMemo(() => data?.usedStorage?.uploaded || 0, [data]);
  const psaPinned = useMemo(() => data?.usedStorage?.psaPinned || 0, [data]);
  const limit = useMemo(() => {
    const byteConversion = currentPlan?.tiers?.[0].upTo ? gibibyte * currentPlan.tiers[0].upTo : defaultStorageLimit;
    return byteConversion;
  }, [currentPlan]);
  const [componentInViewport, setComponentInViewport] = useState(false);
  const storageManagerRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  const { percentUploaded, percentPinned } = useMemo(
    () => ({
      percentUploaded: Math.min((uploaded / limit) * 100, 100),
      percentPinned: Math.min((psaPinned / limit) * 100, 100),
    }),
    [uploaded, psaPinned, limit]
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

  // const onSearchFiles = useCallback(() => {
  //   const input = /** @type {HTMLInputElement} */ (document.querySelector('.search-input'));
  //   const container = /** @type {HTMLInputElement} */ (document.querySelector('.files-manager-container'));
  //   input.focus();
  //   container.scrollIntoView(true);
  // }, []);

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
      <h6>Your Plan: {currentPlan?.label}</h6>
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
              &nbsp;of{' '}
              <span className="storage-number">
                {currentPlan?.tiers?.[0].upTo ? formatAsStorageAmount(currentPlan?.tiers?.[0].upTo) : ''}
              </span>{' '}
              used
              <Tooltip content={content.tooltip_total}>
                <InfoIcon />
              </Tooltip>
            </>
          )}
        </div>
      </div>
      <div className="storage-manager-meter-container">
        <div className="storage-manager-meter">
          {/* Mapping out tiers into labeled sections */}
          <div className="storage-manager-meter-pinned" style={pinnedStorageBarStyles} />
          <div className="storage-manager-meter-uploaded" style={uploadedStorageBarStyles} />
        </div>
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
    </div>
  );
};

export default StorageManager;
