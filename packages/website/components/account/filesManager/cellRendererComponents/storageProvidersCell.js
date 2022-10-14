import { renderToString } from 'react-dom/server';

import Tooltip from 'ZeroComponents/tooltip/tooltip';

/**
 * @type {import('react').FC}
 * @param {object} props
 * @param {any[]} props.deals
 * @param {object} props.fileRowLabels
 * @returns
 */
function storageProvidersCellRenderer({ deals, fileRowLabels }) {
  const storageProviders = Array.isArray(deals)
    ? deals
        .filter(deal => !!deal.storageProvider)
        .map((deal, indx, deals) => (
          <span key={deal.dealId}>
            <a
              className="underline"
              href={`https://filfox.info/en/deal/${deal.dealId}`}
              target="_blank"
              rel="noreferrer"
            >
              {`${deal.storageProvider}`}
            </a>
            {indx !== deals.length - 1 && ', '}
          </span>
        ))
    : null;

  if (!storageProviders) {
    return null;
  }

  return (
    <span className="file-storage-providers">
      {!storageProviders.length ? (
        <>
          Queuing...
          <Tooltip position="right" content={fileRowLabels.storage_providers.tooltip.queuing} />
        </>
      ) : (
        <>
          Stored ({storageProviders.length})
          <Tooltip position="right" content={renderToString(<p>{storageProviders}</p>)} />
        </>
      )}
    </span>
  );
}

export default storageProvidersCellRenderer;
