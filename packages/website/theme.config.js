import Feedback from 'components/feedback/feedback';

const theme = {
  prevLinks: true,
  nextLinks: true,
  projectLink: '',
  projectLinkIcon: null,
  docsRepositoryBase: 'https://github.com/web3-storage/web3.storage/tree/main/packages/website/pages/docs',
  titleSuffix: '',
  search: false,
  customSearch: null,
  darkMode: false,
  footer: true,
  footerText: <Feedback></Feedback>,
  footerEditLink: 'Edit this page',
  logo: null,
  font: false,
  floatTOC: true,
  head: <title>Docs - Web3 Storage - Simple file storage with IPFS &amp; Filecoin</title>,
};

export default theme;
