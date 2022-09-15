import { useState } from 'react';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';

import Loading from '../../components/loading/loading.js';
import Button from '../../components/button/button.js';
import CurrentBillingPlanCard from '../../components/account/currentBillingPlanCard/currentBillingPlanCard.js';
import Modal from '../../modules/zero/components/modal/modal';
import CloseIcon from '../../assets/icons/close';
import AddPaymentMethodForm from '../../components/account/addPaymentMethodForm/addPaymentMethodForm.js';
import { API, getToken } from '../../lib/api';

export async function putUserPayment(pm_id, plan_id) {
  const storage = plan_id ? { price: plan_id } : null;
  const paymentSettings = {
    method: { id: pm_id },
    subscription: { storage: storage },
  };
  const res = await fetch(API + '/user/payment', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
    body: JSON.stringify(paymentSettings),
  });
  if (!res.ok) {
    throw new Error(`failed to get storage info: ${await res.text()}`);
  }

  return res.json();
}

const AccountPlansModal = ({
  isOpen,
  onClose,
  planSelection,
  planList,
  setCurrentPlan,
  savedPaymentMethod,
  stripePromise,
}) => {
  const [isCreatingSub, setIsCreatingSub] = useState(false);
  const currentPlan = planList.find(p => p.id === planSelection.id);
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
          <Button
            variant="light"
            disabled={!savedPaymentMethod || isCreatingSub}
            onClick={async () => {
              setIsCreatingSub(true);
              await putUserPayment(savedPaymentMethod.id, currentPlan.id);
              await setCurrentPlan(currentPlan);
              setIsCreatingSub(false);
              onClose();
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
