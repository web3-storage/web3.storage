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
  const messageBannerRef = useRef(/** @type {any} */ (null));
  const [bannerHeight, setBannerHeight] = useState('unset');
  const [bannerContent, setBannerContent] = useState({
    html: GeneralPageData.message_banner.content,
    url: GeneralPageData.message_banner.url,
  });

  const { data: statusPageData, error: statusPageError } = useQuery('get-statuspage-summary', () =>
    getStatusPageSummary()
  );
  const incidents = statusPageData?.incidents || [];
  const scheduledMaintenances = (statusPageData?.scheduled_maintenances || []).filter(
    (/** @type {{ status: string; }} */ maintenance) => maintenance.status !== 'completed'
  );
  const { data: apiVersionData, error: apiVersionError } = useQuery('get-version', () => getVersion(), {
    enabled: (statusPageData && scheduledMaintenances.length === 0) || statusPageError !== null,
  });

  if (statusPageError) {
    console.error(statusPageError);
  }
  if (apiVersionError) {
    console.error(apiVersionError);
  }

  if (incidents.length > 0) {
    if (bannerContent.html !== incidents[0].name) {
      setBannerContent({ html: incidents[0].name, url: incidents[0].shortlink });
    }
  } else if (scheduledMaintenances.length > 0) {
    if (bannerContent.html !== scheduledMaintenances[0].name) {
      setBannerContent({ html: scheduledMaintenances[0].name, url: scheduledMaintenances[0].shortlink });
    }
  }
  if (
    apiVersionData &&
    apiVersionData.mode === '--' &&
    (bannerContent.html === '' || bannerContent.html === undefined)
  ) {
    if (bannerContent.html !== GeneralPageData.message_banner.maintenceAlert) {
      setBannerContent({ html: GeneralPageData.message_banner.maintenceAlert, url: '' });
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const oldMessage = /** @type {string} */ (
        localStorage.getItem('web3StorageBannerMessage') ? localStorage.getItem('web3StorageBannerMessage') : ''
      );
      const oldDate = /** @type {string} */ (
        localStorage.getItem('web3StorageBannerClickDate') ? localStorage.getItem('web3StorageBannerClickDate') : '0'
      );
      const elapsedTime = Date.now() - parseInt(oldDate);

      if (bannerContent.html === oldMessage && elapsedTime < 604800000) {
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
  }, [bannerContent]);

  const messageBannerClick = useCallback(
    message => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('web3StorageBannerMessage', message);
        localStorage.setItem('web3StorageBannerClickDate', Date.now().toString());
      }
      if (message === bannerContent.html) {
        setBannerHeight('0px');
      }
    },
    [bannerContent]
  );

  return (
    <section
      id="section_message-banner"
      style={{ height: bannerHeight, display: !bannerContent.html.length ? 'none' : undefined }}
    >
      <div ref={messageBannerRef} className={clsx('message-banner-wrapper', bannerHeight === '0px' ? 'mb-hidden' : '')}>
        <div className="grid-noGutter">
          <div className="col">
            <div className="message-banner-container">
              <a
                href={bannerContent.url}
                target="_blank"
                className={clsx(
                  'message-banner-content',
                  marketingPrompt !== bannerContent.html ? 'banner-alert' : '',
                  bannerContent.html.length > 120 ? 'mb-reduced-fontsize' : '',
                  bannerContent.url === '' || bannerContent.url === undefined ? 'disabled' : ''
                )}
                dangerouslySetInnerHTML={{ __html: bannerContent.html }}
                onClick={() => messageBannerClick(marketingPrompt)}
                onKeyPress={() => messageBannerClick(marketingPrompt)}
                rel="noreferrer noopener"
              ></a>
            </div>
          </div>
        </div>

        <button
          className={clsx(
            'message-banner-close-button',
            marketingPrompt !== bannerContent.html || bannerHeight === '0px' ? 'hide-banner-close' : ''
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
