// ===================================================================== Imports
import { useQuery } from 'react-query';
import clsx from 'clsx';

import { getVersion } from 'lib/api';
import { getStatusPageSummary } from 'lib/statuspage-api';
import GeneralPageData from '../../content/pages/general.json';
// ====================================================================== Params
/**
 * messageBanner Component
 *
 * @param {Object} props
 */

// ===================================================================== Exports
export default function MessageBanner() {
  const bannerPrompt = GeneralPageData.message_banner.content;
  const maintenceAlert = GeneralPageData.message_banner.maintenceAlert;
  let messageBannerWasClicked = false;
  let maintenanceMessage = '';
  let bannerContent = bannerPrompt;

  if (typeof window !== 'undefined') {
    const oldMessage = localStorage.getItem('web3StorageBannerMessage');
    const newMessage = bannerPrompt !== oldMessage;
    if (oldMessage) {
      messageBannerWasClicked = true;
    }
    if (newMessage) {
      messageBannerWasClicked = false;
    }
  }

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
    if (typeof window !== 'undefined') {
      localStorage.setItem('web3StorageBannerMessage', message);
    }
  };

  const showMessageBanner = !messageBannerWasClicked || maintenanceMessage;

  return (
    <section id="section_message-banner">
      {showMessageBanner && (
        <div className="grid-noGutter">
          <div className="col">
            <div className="message-banner-container">
              <div
                className={clsx('message-banner-content', maintenanceMessage ? 'banner-alert' : '')}
                dangerouslySetInnerHTML={{ __html: bannerContent }}
                onClick={() => messageBannerClick(bannerPrompt)}
                onKeyPress={() => messageBannerClick(bannerPrompt)}
                role="button"
                tabIndex="0"
              ></div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
