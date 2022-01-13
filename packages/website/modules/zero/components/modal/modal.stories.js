import React, { useCallback, useState } from 'react';

import Modal from './modal';

export default {
  title: 'Zero/Modal'
};

export const Default = () => {
  const modalState = useState(false);
  const [, setModalState] = modalState;

  const openModal  = useCallback(() => setModalState(true), [])

  return (
    <>
      <button onClick={openModal}>Open Modal</button>

      <Modal
        modalState={modalState}
      >
        <div style={{
          width: 500,
          height: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
          }}
        >
          This is example modal content
        </div>
      </Modal>
    </>
  )
};

