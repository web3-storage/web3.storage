import Modal from 'modules/zero/components/modal/modal';
import CloseIcon from 'assets/icons/close';
import CustomStorageForm from 'components/customStorageForm/customStorageForm.js';

const AccountCustomPlanModal = ({ isOpen, onClose }) => {
  return (
    <div className="account-plans-modal">
      <Modal
        className=""
        closeIcon={<CloseIcon className="file-uploader-close" />}
        modalState={[isOpen, onClose]}
        showCloseButton
      >
        <div className="">
          <CustomStorageForm onClose={onClose} />
        </div>
      </Modal>
    </div>
  );
};

export default AccountCustomPlanModal;
