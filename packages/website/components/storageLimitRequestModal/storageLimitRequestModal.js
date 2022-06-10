import { useState } from 'react';

import Modal from 'modules/zero/components/modal/modal';
import CloseIcon from 'assets/icons/close';
import Button from 'components/button/button.js';
import { createUnlimitedStorageRequest } from 'lib/api';

const UserRequestModal = ({ isOpen, onClose }) => {
  const [requesting, setRequesting] = useState(false);

  async function handleCreateUserRequest(e) {
    e.preventDefault();
    const data = new FormData(e.target);

    const authMethod = data.get('auth-method');
    const links = data.get('links');
    const dataVolume = data.get('data-volume');

    if (authMethod && links && dataVolume) {
      setRequesting(true);
      try {
        await createUnlimitedStorageRequest(authMethod, links, dataVolume);
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
          <h1 className="user-request-modal__heading">Storage Limit Increase Request</h1>
          <form onSubmit={handleCreateUserRequest}>
            <div className="input-container">
              <label htmlFor="auth-method">
                Please share the user authentication method (Github, Email) associated with your account{' '}
              </label>
              <textarea id="auth-method" name="auth-method" required />
            </div>
            <div className="input-container">
              <label htmlFor="links">
                Please share links (Github, website, etc) for what you&apos;re building. This is to help ensure the
                service is not being used in violation of our terms of service.{' '}
              </label>
              <textarea id="links" name="links" required />
            </div>
            <div className="input-container">
              <label htmlFor="data-volume">
                Please provide a ballpark estimate for your data volume (both in aggregate and over a given week).
              </label>
              <textarea id="data-volume" name="data-volume" required />
            </div>

            <div className="input-container">
              <Button className="bg-nslime" type="submit" disabled={requesting} id="create-new-key">
                {requesting ? 'Requesting...' : 'Request'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default UserRequestModal;
