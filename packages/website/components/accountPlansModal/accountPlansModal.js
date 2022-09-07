import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';

import Button from '../../components/button/button.js';
import CurrentBillingPlanCard from '../../components/account/currentBillingPlanCard/currentBillingPlanCard.js';
import Modal from '../../modules/zero/components/modal/modal';
import CloseIcon from '../../assets/icons/close';
import { plans } from '../contexts/plansContext';
import AddPaymentMethodForm from '../../components/account/addPaymentMethodForm/addPaymentMethodForm.js';

const AccountPlansModal = ({ isOpen, onClose, planSelection, setCurrentPlan, savedPaymentMethod, stripePromise }) => {
  // const [requesting, setRequesting] = useState(false);
  savedPaymentMethod = false;
  const currentPlan = plans.find(p => p.id === planSelection.id);
  return (
    <div className="account-plans-modal">
      <Modal
        className=""
        closeIcon={<CloseIcon className="file-uploader-close" />}
        modalState={[isOpen, onClose]}
        showCloseButton
      >
        <CurrentBillingPlanCard plan={currentPlan} />
        {!savedPaymentMethod && (
          <div className="add-payment-method-cta">
            Please add a payment method before confirming plan.
            <Elements stripe={stripePromise}>
              <ElementsConsumer>
                {({ stripe, elements }) => (
                  <AddPaymentMethodForm
                    // @ts-ignore
                    stripe={stripe}
                    elements={elements}
                  />
                )}
              </ElementsConsumer>
            </Elements>
          </div>
        )}

        <div className="account-plans-confirm">
          Confirm Your selection.
          <Button
            variant="light"
            // disabled={!savedPaymentMethod}
            onClick={() => {
              setCurrentPlan(currentPlan);
              onClose();
            }}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AccountPlansModal;
