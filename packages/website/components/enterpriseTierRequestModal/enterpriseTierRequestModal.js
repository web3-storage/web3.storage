import { useCallback, useState } from 'react';

import Modal from 'modules/zero/components/modal/modal';
import CloseIcon from 'assets/icons/close';
import Button from 'components/button/button.js';
import { createEnterpriseTierInquiry } from 'lib/api';
import GradientBackground from 'components/gradientbackground/gradientbackground';

async function handleCreateUserRequest(e, setRequesting, onClose) {
  e.preventDefault();
  const data = new FormData(e.target);

  const authMethod = data.get('auth-method');
  const links = data.get('links');
  const dataVolume = data.get('data-volume');
  const dataReadTypeAndFrequency = data.get('data-read-type-and-frequency');
  const additionalInfo = data.get('additional-info');

  if (!(authMethod && links && dataVolume && dataReadTypeAndFrequency)) {
    throw new Error(
      `cannot build enterprise tier request because one of the required fields is falsy: ${!!authMethod} ${!!links} ${!!dataVolume} ${!!dataReadTypeAndFrequency}`
    );
  }

  setRequesting(true);
  try {
    await createEnterpriseTierInquiry(authMethod, links, dataVolume, dataReadTypeAndFrequency, additionalInfo);
  } finally {
    setRequesting(false);
    onClose();
  }
}

const UserRequestModal = ({ isOpen, onClose }) => {
  const [requesting, setRequesting] = useState(false);

  const handleCreateUserRequestCallback = useCallback(
    e => handleCreateUserRequest(e, setRequesting, onClose),
    [setRequesting, onClose]
  );

  return (
    <div className="user-request-modal">
      <Modal
        className=""
        closeIcon={<CloseIcon className="file-uploader-close" />}
        modalState={[isOpen, onClose]}
        showCloseButton
      >
        <div className="user-request-modal__container enterprise-tier-inquiry">
          <GradientBackground variant="saturated-variant" />
          <h1 className="user-request-modal__heading">Enterprise Storage Inquiry</h1>
          <form onSubmit={handleCreateUserRequestCallback}>
            <div className="input-container">
              <label htmlFor="auth-method">Please share your email address. </label>
              <textarea id="auth-method" name="auth-method" required rows={1} />
            </div>
            <div className="input-container">
              <label htmlFor="links">Please share links (Github, website, etc) for what you&apos;re building. </label>
              <textarea id="links" name="links" required rows={4} />
            </div>
            <div className="input-container">
              <label htmlFor="data-volume">
                Please provide a ballpark estimate for your data volume (both in aggregate and over a given month).{' '}
              </label>
              <textarea id="data-volume" name="data-volume" required rows={2} />
            </div>
            <div className="input-container">
              <label htmlFor="data-read-type-and-frequency">
                How do you plan on reading data uploaded to web3.storage (E.g., w3link gateway, other gateway, directly
                over bitswap, etc.)? How frequently do you plan on reading data?{' '}
              </label>
              <textarea id="data-read-type-and-frequency" name="data-read-type-and-frequency" required rows={2} />
            </div>
            <div className="input-container">
              <label htmlFor="additional-info">Is there any additional usage information we should know about? </label>
              <textarea id="additional-info" name="additional-info" required rows={4} />
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
