import BillingPlanCards from '../account/billingPlanCards/billingPlanCards.js';
import Modal from '../../modules/zero/components/modal/modal';
import CloseIcon from '../../assets/icons/close';
// import Button from '../button/button.js';
import GradientBackground from '../gradientbackground/gradientbackground';
import { plans } from '../contexts/plansContext';

const AccountPlansModal = ({ isOpen, onClose }) => {
  // const [requesting, setRequesting] = useState(false);
  return (
    <div className="account-plans-modal">
      <Modal
        className=""
        closeIcon={<CloseIcon className="file-uploader-close" />}
        modalState={[isOpen, onClose]}
        showCloseButton
      >
        <div className="background-view-wrapper">
          <GradientBackground variant="" />
        </div>
        <BillingPlanCards plans={plans} />
      </Modal>
    </div>
  );
};

export default AccountPlansModal;
