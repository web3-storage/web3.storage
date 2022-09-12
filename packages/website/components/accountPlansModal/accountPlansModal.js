import { useState } from 'react';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';

import Loading from '../../components/loading/loading.js';
import Button from '../../components/button/button.js';
import CurrentBillingPlanCard from '../../components/account/currentBillingPlanCard/currentBillingPlanCard.js';
import Modal from '../../modules/zero/components/modal/modal';
import CloseIcon from '../../assets/icons/close';
import AddPaymentMethodForm from '../../components/account/addPaymentMethodForm/addPaymentMethodForm.js';

const AccountPlansModal = ({
  isOpen,
  onClose,
  planSelection,
  planList,
  currentPlan,
  setCurrentPlan,
  savedPaymentMethod,
  stripePromise,
}) => {
  const [isCreatingSub, setIsCreatingSub] = useState(false);
  const chosenPlan = planList.find(p => p.id === planSelection.id);
  return (
    <div className="account-plans-modal">
      <Modal
        className=""
        closeIcon={<CloseIcon className="file-uploader-close" />}
        modalState={[isOpen, onClose]}
        showCloseButton
      >
        {currentPlan.id !== 'free' && chosenPlan.id === 'free' && (
          <div className="add-billing-cta">
            <p>
              You are attempting to downgrade to a lower tier. Please be aware that this could reduce or eliminate
              access to certain data services.
            </p>
          </div>
        )}
        <CurrentBillingPlanCard plan={chosenPlan} />
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
          <Button
            variant="light"
            disabled={!savedPaymentMethod || isCreatingSub}
            onClick={() => {
              setCurrentPlan(chosenPlan);
              setIsCreatingSub(true);
              setTimeout(() => {
                onClose();
                setIsCreatingSub(false);
              }, 5000);
            }}
          >
            Confirm
          </Button>
          {isCreatingSub && <Loading size="medium" message="Creating Subscription..." />}
        </div>
      </Modal>
    </div>
  );
};

export default AccountPlansModal;
