// ===================================================================== Imports
import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import clsx from 'clsx';

import { getVersion } from 'lib/api';
import { getStatusPageSummary } from 'lib/statuspage-api';
import CloseIcon from '../../assets/icons/close.js';
import GeneralPageData from '../../content/pages/general.json';

// ===================================================================== Exports
export default function MessageBanner() {
  const bannerPrompt = GeneralPageData.message_banner.content;
  const maintenceAlert = GeneralPageData.message_banner.maintenceAlert;
  let link = GeneralPageData.message_banner.url;

  const [messageBannerWasClicked, setMessageBannerWasClicked] = useState(false);
  const [wasPreviouslyClosed, setWasPreviouslyClosed] = useState(false);
  const [bannerHeight, setBannerHeight] = useState('unset');
  const [bannerContent, setBannerContent] = useState(bannerPrompt);
  const messageBannerRef = useRef(/** @type {any} */ (null));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const oldMessage = localStorage.getItem('web3StorageBannerMessage');
      const oldDate = /** @type {string} */ (
        localStorage.getItem('web3StorageBannerClickDate') ? localStorage.getItem('web3StorageBannerClickDate') : '0'
      );
      const elapsedTime = Date.now() - parseInt(oldDate);

      if (bannerPrompt === oldMessage && elapsedTime < 604800000) {
        setMessageBannerWasClicked(true);
        setWasPreviouslyClosed(true);
      }
    }
  }, [bannerPrompt]);

  const calculateBannerHeight = time => {
    if (messageBannerRef.current) {
      setBannerHeight('unset');
      setTimeout(() => {
        const height = messageBannerRef.current.clientHeight;
        setBannerHeight(height + 'px');
      }, time);
    }
  };

  useEffect(() => {
    calculateBannerHeight(1000);
    const resize = () => {
      calculateBannerHeight(100);
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [messageBannerRef]);

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

  const messageBannerClick = message => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('web3StorageBannerMessage', message);
      localStorage.setItem('web3StorageBannerClickDate', Date.now().toString());
    }
    setMessageBannerWasClicked(true);
  };

  const CustomElement = maintenanceMessage ? 'div' : 'a';

  return (
    <section
      id="section_message-banner"
      ref={messageBannerRef}
      style={{ height: !messageBannerWasClicked || maintenanceMessage ? bannerHeight : 0 }}
    >
      <div className="grid-noGutter">
        <div className="col">
          <div className="message-banner-container">
            <CustomElement
              href={link}
              target="_blank"
              className={clsx(
                'message-banner-content',
                maintenanceMessage ? 'banner-alert' : '',
                wasPreviouslyClosed && !maintenanceMessage ? 'mb-previously-closed' : '',
                bannerContent.length > 120 ? 'mb-reduced-fontsize' : ''
              )}
              style={{
                transform: `translateY(${messageBannerWasClicked && !maintenanceMessage ? '-' + bannerHeight : 0})`,
              }}
              dangerouslySetInnerHTML={{ __html: bannerContent }}
              onClick={() => messageBannerClick(bannerPrompt)}
              onKeyPress={() => messageBannerClick(bannerPrompt)}
              rel="noreferrer"
            ></CustomElement>
          </div>
        </div>
      </div>

      <button
        className={clsx(
          'message-banner-close-button',
          maintenanceMessage || messageBannerWasClicked ? 'hide-banner-close' : ''
        )}
        onClick={() => messageBannerClick(bannerPrompt)}
        onKeyPress={() => messageBannerClick(bannerPrompt)}
      >
        <CloseIcon />
      </button>
    </section>
  );
}
