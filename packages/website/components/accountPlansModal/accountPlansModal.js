import { useCallback, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';

import Loading from '../../components/loading/loading.js';
import Button from '../../components/button/button.js';
import CurrentBillingPlanCard from '../../components/account/currentBillingPlanCard/currentBillingPlanCard.js';
import Modal from '../../modules/zero/components/modal/modal';
import CloseIcon from '../../assets/icons/close';
import AddPaymentMethodForm from '../../components/account/addPaymentMethodForm/addPaymentMethodForm.js';
import { isW3STermsOfServiceAgreement, tosAgreementVersions, userBillingSettings } from '../../lib/api';

/**
 *
 * @typedef {import('../../components/contexts/plansContext').Plan} Plan
 */

/**
 * @param {object} obj
 * @param {any} obj.isOpen
 * @param {any} obj.onClose
 * @param {import('components/contexts/plansContext.js').Plan} obj.planSelection
 * @param {import('components/contexts/plansContext.js').Plan[]} obj.planList
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
  const [consentedTosAgreement, setConsentedTosAgreement] = useState(
    /** @type {import('../../lib/api').W3STermsOfServiceAgreement|null} */ (null)
  );
  // onChange handler for checkbox for terms of service agreement
  const onTosAgreementCheckboxChange = useCallback(
    /**
     * When user clicks the tos agreement checkbox, update state indicating which agreement they consented to.
     * Checkbox specifies agreement in data-agreement attribute;
     * @param {import('react').ChangeEvent<HTMLInputElement>} event
     */
    event => {
      setHasAcceptedTerms(!hasAcceptedTerms);
      const probablyTosAgreement = event.target.dataset.agreement;
      if (event.target.checked) {
        if (isW3STermsOfServiceAgreement(probablyTosAgreement)) {
          setConsentedTosAgreement(probablyTosAgreement);
        } else {
          throw new Error(`unexpected agreement value for terms checkbox: ${probablyTosAgreement}`);
        }
      } else {
        setConsentedTosAgreement(null);
      }
    },
    [hasAcceptedTerms, setHasAcceptedTerms, setConsentedTosAgreement]
  );
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
              // agreement that this checkbox indicates consenting to
              data-agreement={tosAgreementVersions[1]}
              onChange={onTosAgreementCheckboxChange}
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
              if (!isW3STermsOfServiceAgreement(consentedTosAgreement)) {
                throw new Error('Change plan modal form submitted without required tos agreement');
              }
              if (typeof currentPlan === 'undefined') {
                throw new Error('Change plan modal form submitted without selected plan');
              }
              if (currentPlan.id !== 'free' && currentPlan.id !== 'pro' && currentPlan.id !== 'lite') {
                throw new Error('Unrecognized plan');
              }
              await userBillingSettings(consentedTosAgreement, savedPaymentMethod.id, {
                price: currentPlan.id,
              });
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
