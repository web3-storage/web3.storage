import { useEffect } from 'react';
import kwesforms from 'kwesforms';

import Modal from 'modules/zero/components/modal/modal';
import CloseIcon from 'assets/icons/close';
import Button from 'components/button/button.js';
import GradientBackground from 'components/gradientbackground/gradientbackground';

const EnterpriseTierRequestModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    kwesforms.init();
  }, []);

  return (
    <div className="user-request-modal enterprise-tier-inquiry">
      <Modal
        className=""
        closeIcon={<CloseIcon className="file-uploader-close" />}
        modalState={[isOpen, onClose]}
        showCloseButton
      >
        <div className="user-request-modal__container">
          <GradientBackground variant="saturated-variant" />
          <h1 className="user-request-modal__heading">Enterprise Storage Inquiry</h1>
          <form
            method="POST"
            id="enterpriseKwesForm"
            className="kwes-form"
            action="https://kwesforms.com/api/foreign/forms/6M733IJbJvlIUBMRbSWB"
          >
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
              <Button className="bg-nslime" type="submit" id="create-new-key">
                Request
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default EnterpriseTierRequestModal;
