import { renderToString } from 'react-dom/server';

import Tooltip from 'ZeroComponents/tooltip/tooltip';

/**
 * @typedef {import('web3.storage').Deal} Deal
 */
/**
 * @type {import('react').FC}
 * @param {object} props
 * @param {Deal[]} props.deals list of deals associated with an upload
 * @param {string} props.tooltipText strings
 * @returns
 */
function StorageProvidersCellRenderer({ deals, tooltipText }) {
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
          <Tooltip position="right" content={tooltipText} />
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

export default StorageProvidersCellRenderer;
