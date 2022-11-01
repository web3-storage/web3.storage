import { useState, useEffect } from 'react';

import Link from 'components/link/link';
import Modal from 'modules/zero/components/modal/modal';
import CloseIcon from 'assets/icons/close';
import Button from 'components/button/button.js';
import GradientBackground from '../../gradientbackground/gradientbackground.js';

const AccountBlockedModal = ({ hasAccountRestriction }) => {
  const modalState = useState(false);

  useEffect(() => {
    if (hasAccountRestriction && !sessionStorage.hasSeenAccountBlockedModal) {
      modalState[1](true);
      sessionStorage.hasSeenAccountBlockedModal = true;
    }
  }, [hasAccountRestriction, modalState]);

  return modalState[0] ? (
    <div className="account-blocked-modal">
      <Modal
        className=""
        closeIcon={<CloseIcon className="file-uploader-close" />}
        modalState={modalState}
        showCloseButton
      >
        <div className="background-view-wrapper">
          <GradientBackground variant="upload-cta-gradient" />
        </div>
        <div className="account-blocked-container">
          <p className="content">
            You may have been temporarily blocked from uploading new files. You may, however, continue to view and take
            actions on existing uploads. If you feel this was a mistake please contact{' '}
            <Link href="mailto:support@web3.storage.com">support@web3.storage.com</Link>
          </p>

          <Button onClick={() => modalState[1](false)} className="confirm">
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  ) : null;
};

export default AccountBlockedModal;
