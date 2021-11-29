// ===================================================================== Imports
import IndexPageData from '../content/pages/index.json';
import Navigation from '../components/navigation/navigation.js';
import BlockBuilder from '../components/blockbuilder/blockbuilder.js';
// import countly from 'Lib/countly'
// ====================================================================== Params
/**
 * @returns {{ props: import('../components/types.js').LayoutProps}}
 */
export function getStaticProps() {
  return {
    props: {
      needsLoggedIn: false,
      navBgColor: 'bg-w3storage-red',
      footerBgColor: 'bg-w3storage-red',
      highlightMessage: `Looking to store NFTs? Check out <a class="underline" href="https://nft.storage">NFT.Storage</a>!</p>`,
    },
  };
}
// ===================================================================== Exports
export default function Home() {
  const sections = IndexPageData.page_content;
  return (
    <>
      <Navigation />
      <main className="page page-index">
        {sections.map((section, index) => (
          <BlockBuilder key={`section_${index}`} subsections={section} />
        ))}
      </main>
    </>
  );
}
