import React, { useState } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';

import Modal from 'modules/zero/components/modal/modal';
import CloseIcon from 'assets/icons/close';

const searchClient = algoliasearch('9ARXAK1OFV', '358b95b4567a562349f2c806c152fada');

// const ALGOLIA_KEY = process.env.ALGOLIA_KEY || '358b95b4567a562349f2c806c152fada'
// const ALGOLIA_INDEX = process.env.ALGOLIA_INDEX || 'web3-storage-docusaurus'
// const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || '9ARXAK1OFV'

export default function Search() {
  const modalState = useState(false);

  const openModal = () => {
    modalState[1](true);
  };

  return (
    <>
      <button onClick={openModal}>search</button>
      <Modal className="search-modal" animation="ken" modalState={modalState} closeIcon={<CloseIcon />} showCloseButton>
        <InstantSearch indexName="web3-storage-docusaurus" searchClient={searchClient}>
          <SearchBox />
          <Hits />
        </InstantSearch>
      </Modal>
    </>
  );
}
