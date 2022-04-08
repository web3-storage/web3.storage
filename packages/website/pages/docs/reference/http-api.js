export default function Home() {
  return <main className="page-http-api">http api page goes here</main>;
}

export function getStaticProps() {
  return {
    props: {
      title: '404 - Web3 Storage - Simple file storage with IPFS & Filecoin',
    },
  };
}
