import { DocSearch } from '@docsearch/react';
import { useState, useEffect } from 'react';

export default function Search() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    mounted && (
      <DocSearch appId="9ARXAK1OFV" indexName="web3-storage-docusaurus" apiKey="358b95b4567a562349f2c806c152fada" />
    )
  );
}
