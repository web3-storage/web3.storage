import { useEffect, useState } from 'react';

import FAQPageData from '../content/pages/faq.json';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';
import { initFloaterAnimations } from '../lib/floater-animations.js';
import GeneralPageData from '../content/pages/general.json';
import AccordionBlock from '../components/accordionblock/accordionblock';
import Loading from '../components/loading/loading';

/**
 * @typedef {{
 *   id: string,
 *   heading: string,
 *   content: string,
 * }} FaqSection
 */

export default function Home() {
  const [faqSections, setFaqSections] = useState(/** @type {FaqSection[]|undefined} */ (undefined));
  /** @type [any, null | any] */
  const [propsToParseAsMarkdown, setPropsToParseAsMarkdown] = useState([]);
  const sections = FAQPageData.page_content;
  const animations = FAQPageData.floater_animations;
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_NETLIFY_CMS_ENDPOINT || 'https://blog.web3.storage'}/api/partials/faq/faq`)
      .then(async response => await response.text())
      .then(text => {
        const obj = JSON.parse(text);
        const faqs = obj.props.partial.meta['faq-list'].reduce((sections, faq) => {
          sections.push({
            id:
              'faq-' +
              faq.question
                .toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-'),
            heading: faq.question,
            content: faq.answer,
          });

          return sections;
        }, []);
        setFaqSections(faqs);
        setPropsToParseAsMarkdown(['content']);
      })
      .catch(e => {
        // Any error in fetching or handling the response from the CMS should result in displaying the default content.
        console.error('Error fetching FAQ: ', e);

        setFaqSections([
          {
            id: 'platform',
            heading: 'What is meant by the "web3.storage platform"?',
            content:
              "web3.storage is a suite of APIs and services that make it easy for developers and other users to interact with data in a way that is not tied to where the data is actually physically stored. It natively uses decentralized data and identity protocols like <a href='https://ipfs.io/' alt='IPFS' target='_blank'>IPFS</a>, <a href='https://filecoin.io/' alt='Filecoin' target='_blank'>Filecoin</a>, and <a href='https://ucan.xyz/' alt='UCAN' target='_blank'>UCAN</a> that enable verifiable, data- and user-centric application architectures and workflows. <br><br>At the core of the platform includes a hosted storage service which can be used to upload and persist data to make it continuously available. The platform also contains additional services like <a href='https://web3.storage/products/w3link/' alt='w3link' target='_blank'>w3link</a> and <a href='https://web3.storage/products/w3name' alt='w3name' target='_blank'>w3name</a> that make it easier to create seamless, delightful web experiences utilizing web3 protocols.",
          },
          {
            id: 'versus-traditional',
            heading: 'What advantages does web3.storage have over traditional hosted storage services?',
            content:
              "Because web3.storage uses decentralized data and identity protocols like <a href='https://ipfs.io/' alt='IPFS' target='_blank'>IPFS</a> and <a href='https://ucan.xyz/' alt='UCAN' target='_blank'>UCAN</a>, data and identity are referenced in an open way. Data is referenced using <a href='https://docs.ipfs.tech/concepts/content-addressing/' alt='Content addressing' target='_blank'>IPFS content identifiers</a> that are unique to the data, making your data completely portable - accessible from anywhere broadcasting data to the IPFS network, whether on a local or peer device, or uploaded to web3.storage itself. Data is backed up on <a href='https://filecoin.io/' alt='Filecoin' target='_blank'>Filecoin</a>, which gives <a href='https://filecoin.io/blog/posts/what-sets-us-apart-filecoin-s-proof-system/' alt='Filecoin proofs' target='_blank'>cryptographic proof</a> that your data is physically being stored without needing to trust web3.storage. <br><br>Authentication is associated with user <a href='https://w3c-ccg.github.io/did-primer/' alt='DID' target='_blank'>decentralized identifiers</a> (DIDs) that sign UCAN tokens that can be cryptographically verified by the web3.storage service, meaning that your identity is not determined by a central authentication server. And because any storage solution can utilize the same UCAN and IPFS content IDs, there is no lock-in to web3.storage’s service.",
          },
          {
            id: 'versus-pinning-services',
            heading: 'What advantages does web3.storage have over other IPFS hosted services?',
            content:
              "web3.storage runs on <a href='https://github.com/elastic-ipfs/' alt='Elastic IPFS' target='_blank'>Elastic IPFS</a>, an open-source, cloud-native, highly scalable implementation of IPFS. We wrote it as the solution to address increasing adoption of web3.storage, which previously used <a href='https://github.com/ipfs/kubo' alt='kubo' target='_blank'>kubo</a> and <a href='https://ipfscluster.io/' alt='IPFS Cluster' target='_blank'>IPFS Cluster</a>. As a result, web3.storage is designed to give strong performance and reliability regardless of how much data is being stored on it, meaning that you can rely on it as you and web3.storage grow. And all data is backed up in Filecoin storage deals, which gives <a href='https://filecoin.io/blog/posts/what-sets-us-apart-filecoin-s-proof-system/' alt='Filecoin proofs' target='_blank'>cryptographic proof</a> that your data is physically being stored without needing to trust web3.storage. <br><br>Further, the platform provides other best-in-class implementations of IPFS on performant infrastructure, from <a href='https://web3.storage/products/w3link/' alt='w3link' target='_blank'>w3link</a>, our IPFS HTTP gateway that can be up to 10x faster than other public gateways, to <a href='https://web3.storage/products/w3name' alt='w3name' target='_blank'>w3name</a>, a hosted service for dynamic data use cases.",
          },
          {
            id: 'pinning-api',
            heading:
              'How do I store data on web3.storage that is already available over the IPFS network without having to download and reupload it myself?',
            content:
              "Paid web3.storage plans give users access to our implementation of the <a href='https://ipfs.github.io/pinning-services-api-spec/' alt='Pinning Service API' target='_blank'>Pinning Service API</a>, which allows you to store data on web3.storage that is already available over the IPFS network.",
          },
          {
            id: 'service',
            heading: 'What is the relationship between NFT.Storage and web3.storage?',
            content:
              "web3.storage is a platform that enables developers, applications, and users to interact with data independently of where it is stored, using decentralized protocols like <a href='https://ipfs.io/' alt='IPFS' target='_blank'>IPFS</a> and <a href='https://ucan.xyz/' alt='UCAN' target='_blank'>UCAN</a>. This includes an easy-to-use, performant storage service that makes data available on IPFS and persists it on the Filecoin decentralized storage network. NFT.Storage is a service whose mission is to perpetually store all off-chain NFT data as a public good (so for free, forever). It currently runs on the web3.storage platform today, but has future plans to provide its services in a fully decentralized manner (run by a DAO with operations and governance instrumented on smart contracts).",
          },
          {
            id: 'how-to-delete',
            heading: 'How can I delete items from web3.storage?',
            content:
              "You can delete files listed in your account. Simply log-in to your account and use the file manager on the files page. It's currently not possible to delete files via the API or the client libraries.<br><br>However, once a file is uploaded to web3.storage, there cannot be a guarantee that all copies of the file are gone from the IPFS network. As soon as a file is uploaded, other IPFS nodes can access and store a copy of the data. The data only becomes unavailable when the last IPFS node has stopped pinning the file, and all copies are garbage collected. As a consequence you should only upload to web3.storage files that you know can be shared with anyone forever, or are securely encrypted.<br><br>We are in the process of rolling out a new client and service called w3up that programmatically allows you to unlink uploads from being associated with your account. The Alpha version CLI can be found <a href='https://github.com/nftstorage/w3up-cli' alt='w3up' target='_blank'>here</a> and the client <a href='https://github.com/nftstorage/w3up-client' alt='w3up' target='_blank'>here</a>. Later, the current Javascript client will use w3up and all existing uploads and accounts will be migrated to the new service.",
          },
          {
            id: 'using-api-directly',
            heading: "Can I use web3.storage, even if I don't want to use the Javascript or go client libraries?",
            content:
              "Yes, you can use the web3.storage APIs directly, but in that case you need to ensure that you provide the API with the right format. The API won't accept raw files above 100MB, so you'll need to package them as .CAR files and chunk them to the right size using CLI tools like <a href='https://github.com/web3-storage/ipfs-car' target='_blank'>ipfs-car</a> and <a href='https://github.com/nftstorage/carbites-cli' target='_blank'>carbites.</a>",
          },
          {
            id: 'editing-files',
            heading: 'How can I edit a file or add files to a folder?',
            content:
              "Since CIDs are immutable, it's not possible to edit files or add files to a folder. We recommend checking out w3name, our hosted <a href='https://docs.ipfs.io/concepts/ipns/' alt='IPNS' target='_blank'>IPNS</a> service, if you are interested in dynamic data.",
          },
          {
            id: 'uploading-without-account',
            heading:
              'How can my users upload files directly to web3.storage without them needing to create their own account?',
            content:
              "The current Javascript client and API requires you to provide the API token in your front-end, allowing anyone to upload files to your account and list already uploaded files. However, we are in the process of rolling out a new client and service called w3up that natively uses UCAN for authentication, meaning you can cryptographically delegate permission to other actors to directly upload to your account. The Alpha version CLI can be found <a href='https://github.com/nftstorage/w3up-cli' alt='w3up' target='_blank'>here</a> and the client <a href='https://github.com/nftstorage/w3up-client' alt='w3up' target='_blank'>here</a>. Later, the current Javascript client will use w3up and all existing uploads and accounts will be migrated to the new service.",
          },
        ]);
      });
  }, [sections]);

  useEffect(() => {
    let pageFloaters = {};
    initFloaterAnimations(animations).then(result => {
      pageFloaters = result;
    });
    return () => {
      if (pageFloaters.hasOwnProperty('destroy')) {
        pageFloaters.destroy();
      }
    };
  }, [animations]);

  return (
    <>
      <main className="page page-faq">
        {sections.map((section, index) => (
          <BlockBuilder id={`faq_section_${index + 1}`} key={`faq_section_${index + 1}`} subsections={section} />
        ))}
        {propsToParseAsMarkdown && (
          <div className="sectionals">
            <section id="faq_section-main" className="sectional">
              <div className="grid">
                <div className="col-12 column-1">
                  <div className="column-content">
                    {!faqSections && <Loading size="large" message="Fetching Latest FAQs..." />}
                    {faqSections && (
                      <AccordionBlock
                        block={{
                          multiple: true,
                          toggleOnLoad: false,
                          sections: faqSections,
                          markdown: propsToParseAsMarkdown || [],
                        }}
                      ></AccordionBlock>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}

export function getStaticProps() {
  const crumbs = GeneralPageData.breadcrumbs;
  return {
    props: {
      title: 'FAQ - Web3 Storage - Simple file storage with IPFS & Filecoin',
      description:
        'Frequently asked questions about web3.storage. Find out how the easiest way to store data on the decentralized web uses Filecoin and IPFS, or how it differs from other services.',
      breadcrumbs: [crumbs.index, crumbs.faq],
    },
  };
}
