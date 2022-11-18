import HomepageComponent from '../page-components/homepage';

export default function Home() {
  return <HomepageComponent />;
}

export function getStaticProps() {
  return {
    props: {
      title: 'Web3 Storage - Simple file storage with IPFS & Filecoin',
    },
  };
}
