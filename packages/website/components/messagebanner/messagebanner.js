// ===================================================================== Imports
import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import clsx from 'clsx';

import { getVersion } from 'lib/api';
import { getStatusPageSummary } from 'lib/statuspage-api';
import CloseIcon from '../../assets/icons/close.js';
import GeneralPageData from '../../content/pages/general.json';

// ===================================================================== Exports
export default function MessageBanner() {
  const [messageBannerWasClicked, setMessageBannerWasClicked] = useState(false);
  const bannerPrompt = GeneralPageData.message_banner.content;
  const maintenceAlert = GeneralPageData.message_banner.maintenceAlert;
  let link = GeneralPageData.message_banner.url;
  let maintenanceMessage = '';
  let bannerContent = bannerPrompt;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const oldMessage = localStorage.getItem('web3StorageBannerMessage');
      const oldDate = /** @type {string} */ (
        localStorage.getItem('web3StorageBannerClickDate') ? localStorage.getItem('web3StorageBannerClickDate') : '0'
      );
      const elapsedTime = Date.now() - parseInt(oldDate);

      if (bannerPrompt === oldMessage && elapsedTime < 604800000) {
        console.log('banner clicked');
        setMessageBannerWasClicked(false); // CHANGE BACK TO true
      }
    }
  }, [bannerPrompt]);

  const { data: statusPageData, error: statusPageError } = useQuery('get-statuspage-summary', () =>
    getStatusPageSummary()
  );

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
    // console.error(statusPageError);
  }
  if (apiVersionError) {
    // console.error(apiVersionError);
  }

  if (maintenanceMessage) {
    bannerContent = maintenanceMessage;
  }

  const messageBannerClick = message => {
    if (crypto.subtle) {
      const digest = async ({ algorithm = 'SHA-256', message }) =>
        Array.prototype.map
          .call(new Uint8Array(await crypto.subtle.digest(algorithm, new TextEncoder().encode(message))), x =>
            ('0' + x.toString(16)).slice(-2)
          )
          .join('');

      const hash = digest({ message: message });
      console.log(hash);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('web3StorageBannerMessage', message);
      localStorage.setItem('web3StorageBannerClickDate', Date.now().toString());
    }
    setMessageBannerWasClicked(false); // CHANGE BACK TO true
  };

  return (
    <section
      id="section_message-banner"
      className={clsx(!messageBannerWasClicked || maintenanceMessage ? 'show-message-banner' : '')}
    >
      <div className="grid-noGutter">
        <div className="col">
          <div className="message-banner-container">
            <a
              href={link}
              target="_blank"
              className={clsx(
                'message-banner-content',
                maintenanceMessage ? 'banner-alert' : '',
                'message-banner-transition'
              )}
              dangerouslySetInnerHTML={{ __html: bannerContent }}
              onClick={() => messageBannerClick(bannerPrompt)}
              onKeyPress={() => messageBannerClick(bannerPrompt)}
              rel="noreferrer"
            ></a>
          </div>
        </div>
      </div>

      <button
        className={clsx(
          'message-banner-close-button',
          'message-banner-transition',
          maintenanceMessage ? 'hide-banner-close' : ''
        )}
        onClick={() => messageBannerClick(bannerPrompt)}
        onKeyPress={() => messageBannerClick(bannerPrompt)}
      >
        <CloseIcon />
      </button>
    </section>
  );
}
