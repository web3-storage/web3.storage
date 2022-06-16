import { useState } from 'react';

import Modal from 'modules/zero/components/modal/modal';
import CloseIcon from 'assets/icons/close';
import Button from 'components/button/button.js';
import { createPinningServiceRequest } from 'lib/api';

const PinningRequestModal = ({ isOpen, onClose }) => {
  const [requesting, setRequesting] = useState(false);

  async function handleCreateUserRequest(e) {
    e.preventDefault();
    const data = new FormData(e.target);

    const reason = data.get('reason');
    const examples = data.get('examples');
    const profile = data.get('profile');

    if (reason && examples && profile) {
      setRequesting(true);
      try {
        await createPinningServiceRequest(reason, examples, profile);
      } finally {
        setRequesting(false);
        onClose();
      }
    }
  }

  return (
    <div className="user-request-modal">
      <Modal
        className=""
        closeIcon={<CloseIcon className="file-uploader-close" />}
        modalState={[isOpen, onClose]}
        showCloseButton
      >
        <div className="user-request-modal__container">
          <h1 className="user-request-modal__heading">Request API Pinning Access</h1>
          <form onSubmit={handleCreateUserRequest}>
            <div className="input-container">
              <label htmlFor="reason">Why you are looking for pinning service API access:</label>
              <textarea id="reason" name="reason" required />
            </div>
            <div className="input-container">
              <label htmlFor="examples">
                Please provide a sample of 5-10 CIDs of NFTs / metadata you are looking to pin:{' '}
              </label>
              <textarea id="examples" name="examples" required />
            </div>
            <div className="input-container">
              <label htmlFor="profile">Please provide a profile on a service (artist profile, collector, etc): </label>
              <textarea id="profile" name="profile" required />
            </div>

            <div className="input-container">
              <Button className="bg-nslime" type="submit" disabled={requesting}>
                {requesting ? 'Requesting...' : 'Request'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default PinningRequestModal;
