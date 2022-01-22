import Head from 'next/head';

// ====================================================================== Metadata
/**
 * @typedef {Object} MetadataProps
 * @property {string} [title] - The title of the page
 * @property {string} [description] - The description for this page
 */

/**
 * The metadata used for all pages
 *
 * @param {MetadataProps} props
 */
const Metadata = ({
  title = 'Web3 Storage - The simple file storage service for IPFS & Filecoin.',
  description = 'With Web3.Storage you get all the benefits of decentralized storage and content addressing with the frictionless experience you expect in a modern storage solution. It’s fast, open and it’s free.',
}) => (
  <Head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="image" content="/social-card-web3storage.jpg" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://web3.storage" />
    <meta property="og:image" content="/social-card-web3storage.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="/social-card-web3storage.jpg" />
    <meta name="twitter:site" content="@protocollabs" />
    <meta name="twitter:creator" content="@protocollabs" />
  </Head>
);

export default Metadata;
