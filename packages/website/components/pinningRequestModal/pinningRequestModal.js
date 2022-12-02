import { useState } from 'react';

import Modal from 'modules/zero/components/modal/modal';
import Link from 'components/link/link';
import CloseIcon from 'assets/icons/close';
import Button from 'components/button/button.js';
import { createPinningServiceRequest } from 'lib/api';
import GradientBackground from 'components/gradientbackground/gradientbackground';

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
    <div className="user-request-modal kwes-form-web3-defaults">
      <Modal
        className=""
        closeIcon={<CloseIcon className="file-uploader-close" />}
        modalState={[isOpen, onClose]}
        showCloseButton
      >
        <div className="user-request-modal__container">
          <GradientBackground variant="saturated-variant" />
          <h1 className="user-request-modal__heading">Request Bulk Pinning API Access</h1>
          <p className="user-request-modal__description">
            web3.storage is capable of efficiently ingesting billions of records. Whether or not your data is already on
            IPFS, we have simple API for bulk data import. You do not need to request bulk API access if you are just
            looking to upload your data to web3.storage. Check out{' '}
            <Link href="/docs/how-tos/pinning-services-api/">the docs</Link> for more details.
          </p>
          <form onSubmit={handleCreateUserRequest}>
            <div className="input-container">
              <label htmlFor="reason">Why you are looking for pinning service API access:</label>
              <textarea id="reason" name="reason" required rows={4} />
            </div>
            <div className="input-container">
              <label htmlFor="examples">
                Please provide a sample of 5-10 CIDs of NFTs / metadata you are looking to pin:{' '}
              </label>
              <textarea id="examples" name="examples" required rows={5} />
            </div>
            <div className="input-container">
              <label htmlFor="profile">Please provide a description of your role (e.g., developer): </label>
              <textarea id="profile" name="profile" required rows={1} />
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
