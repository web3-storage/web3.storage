import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';

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
    paymentMethod: { id: pm_id },
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

/**
 * @param {object} obj
 * @param {any} obj.isOpen
 * @param {any} obj.onClose
 * @param {any} obj.planSelection
 * @param {any} obj.planList
 * @param {any} obj.stripePromise
 * @param {any} obj.setCurrentPlan
 * @param {any} obj.savedPaymentMethod
 * @param {(v: boolean) => void} obj.setHasPaymentMethods
 * @param {(v: boolean) => void} obj.setEditingPaymentMethod
 * @param {(v: boolean) => void} obj.setHasAcceptedTerms
 * @param {boolean} obj.hasAcceptedTerms
 */
const AccountPlansModal = ({
  isOpen,
  onClose,
  planSelection,
  planList,
  setCurrentPlan,
  savedPaymentMethod,
  setHasPaymentMethods,
  setEditingPaymentMethod,
  setHasAcceptedTerms,
  hasAcceptedTerms,
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
              <AddPaymentMethodForm
                setHasPaymentMethods={setHasPaymentMethods}
                setEditingPaymentMethod={setEditingPaymentMethod}
                currentPlan={currentPlan?.id}
              />
            </Elements>
          </div>
        )}

        <div className="billing-card card-transparent">
          <div className="billing-terms-toggle">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={hasAcceptedTerms}
              onChange={() => setHasAcceptedTerms(!hasAcceptedTerms)}
            />
            <label htmlFor="agreeTerms">
              I have read and agree to the{' '}
              <a href="/terms/" rel="noreferrer" target="_blank">
                web3.storage Terms of Service
              </a>
            </label>
          </div>
        </div>

        <div className="account-plans-confirm">
          <Button
            variant="light"
            disabled={!savedPaymentMethod || isCreatingSub || !hasAcceptedTerms}
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
