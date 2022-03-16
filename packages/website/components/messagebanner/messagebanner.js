// ===================================================================== Imports
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from 'react-query';
import clsx from 'clsx';

import { getVersion } from 'lib/api';
import { getStatusPageSummary } from 'lib/statuspage-api';
import CloseIcon from '../../assets/icons/close.js';
import GeneralPageData from '../../content/pages/general.json';

// ===================================================================== Exports
export default function MessageBanner() {
  const marketingPrompt = GeneralPageData.message_banner.content;
  const maintenceAlert = GeneralPageData.message_banner.maintenceAlert;
  let link = GeneralPageData.message_banner.url;

  const [bannerHeight, setBannerHeight] = useState('unset');
  const [bannerContent, setBannerContent] = useState(marketingPrompt);
  const messageBannerRef = useRef(/** @type {any} */ (null));

  const { data: statusPageData, error: statusPageError } = useQuery('get-statuspage-summary', () =>
    getStatusPageSummary()
  );

  let maintenanceMessage = '';

  const scheduledMaintenances =
    statusPageData?.scheduled_maintenances.filter(
      (/** @type {{ status: string; }} */ maintenance) => maintenance.status !== 'completed'
    ) || [];

  const { data: apiVersionData, error: apiVersionError } = useQuery('get-version', () => getVersion(), {
    enabled: (statusPageData && scheduledMaintenances.length === 0) || statusPageError !== null,
  });

  if (scheduledMaintenances.length > 0) {
    maintenanceMessage = statusPageData.scheduled_maintenances[0].incident_updates[0].body;
  }

  if (apiVersionData && apiVersionData.mode !== 'rw' && !maintenanceMessage) {
    maintenanceMessage = maintenceAlert;
  }

  if (statusPageError) {
    console.error(statusPageError);
  }
  if (apiVersionError) {
    console.error(apiVersionError);
  }

  if (maintenanceMessage && bannerContent !== maintenanceMessage) {
    setBannerContent(maintenanceMessage);
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const oldMessage = localStorage.getItem('web3StorageBannerMessage');
      const oldDate = /** @type {string} */ (
        localStorage.getItem('web3StorageBannerClickDate') ? localStorage.getItem('web3StorageBannerClickDate') : '0'
      );
      const elapsedTime = Date.now() - parseInt(oldDate);

      if (bannerContent === oldMessage && elapsedTime < 604800000) {
        setBannerHeight('0px');
      } else {
        const resize = () => {
          if (messageBannerRef.current) {
            const height = messageBannerRef.current.clientHeight;
            setBannerHeight(height + 'px');
          }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
      }
    }
  }, [bannerContent, marketingPrompt]);

  const messageBannerClick = useCallback(
    message => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('web3StorageBannerMessage', message);
        localStorage.setItem('web3StorageBannerClickDate', Date.now().toString());
      }
      if (marketingPrompt === bannerContent) {
        setBannerHeight('0px');
      }
    },
    [marketingPrompt, bannerContent]
  );

  const CustomElement = marketingPrompt === bannerContent ? 'a' : 'div';

  return (
    <section id="section_message-banner" style={{ height: bannerHeight }}>
      <div ref={messageBannerRef} className={clsx('message-banner-wrapper', bannerHeight === '0px' ? 'mb-hidden' : '')}>
        <div className="grid-noGutter">
          <div className="col">
            <div className="message-banner-container">
              <CustomElement
                href={link}
                target="_blank"
                className={clsx(
                  'message-banner-content',
                  marketingPrompt !== bannerContent ? 'banner-alert' : '',
                  bannerContent.length > 120 ? 'mb-reduced-fontsize' : ''
                )}
                dangerouslySetInnerHTML={{ __html: bannerContent }}
                onClick={() => messageBannerClick(marketingPrompt)}
                onKeyPress={() => messageBannerClick(marketingPrompt)}
                rel="noreferrer"
              ></CustomElement>
            </div>
          </div>
        </div>

        <button
          className={clsx(
            'message-banner-close-button',
            marketingPrompt !== bannerContent || bannerHeight === '0px' ? 'hide-banner-close' : ''
          )}
          onClick={() => messageBannerClick(marketingPrompt)}
          onKeyPress={() => messageBannerClick(marketingPrompt)}
        >
          <CloseIcon />
        </button>
      </div>
    </section>
  );
}
