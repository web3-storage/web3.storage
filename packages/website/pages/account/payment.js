/**
 * @fileoverview Account Payment Settings
 */

import { useState, useEffect } from 'react';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import Loading from '../../components/loading/loading.js';
import PaymentCustomPlan from '../../components/account/paymentCustomPlan.js/paymentCustomPlan.js';
import PaymentTable from '../../components/account/paymentTable.js/paymentTable.js';
import PaymentMethodCard from '../../components/account/paymentMethodCard/paymentMethodCard.js';
import AccountPlansModal from '../../components/accountPlansModal/accountPlansModal.js';
import AddPaymentMethodForm from '../../components/account/addPaymentMethodForm/addPaymentMethodForm.js';
import { plans, plansEarly } from '../../components/contexts/plansContext';
import { userBillingSettings } from '../../lib/api';

const PaymentSettingsPage = props => {
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const stripePromise = loadStripe(props.stripePublishableKey);
  const [hasPaymentMethods, setHasPaymentMethods] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(/** @type {Plan | null} */ (null));
  const [planSelection, setPlanSelection] = useState('');
  const [planList, setPlanList] = useState(/** @type {Plan[]}*/ (plans));
  const [savedPaymentMethod, setSavedPaymentMethod] = useState(/** @type {PaymentMethod} */ ({}));
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(false);
  const [loadingUserSettings, setLoadingUserSettings] = useState(true);

  /**
   * @typedef {Object} Plan
   * @property {string | null} id
   * @property {string} title
   * @property {string} description
   * @property {string} price
   * @property {string} base_storage
   * @property {string} additional_storage
   * @property {string} bandwidth
   * @property {string} block_limit
   * @property {string} car_size_limit
   * @property {boolean} pinning_api
   */

  /**
   * @typedef {Object} PaymentMethodCard
   * @property {string} brand
   * @property {string} country
   * @property {string} exp_month
   * @property {string} exp_year
   * @property {string} last4
   */

  /**
   * @typedef {Object} PaymentMethod
   * @property {string} id
   * @property {PaymentMethodCard} card
   */

  useEffect(() => {
    const getSavedCard = async () => {
      const card = await userBillingSettings();
      if (card) {
        setSavedPaymentMethod(card.paymentMethod);
      }
      return card;
    };
    getSavedCard();
  }, [hasPaymentMethods]);

  useEffect(() => {
    if (!currentPlan || currentPlan === null) {
      setPlanList(plansEarly);
    } else {
      setPlanList(plans);
    }
  }, [currentPlan]);

  useEffect(() => {
    if (savedPaymentMethod) {
      const getPlan = async () => {
        const userPlan = await userBillingSettings();
        setLoadingUserSettings(false);
        setCurrentPlan(
          planList.find(plan => {
            return plan.id === userPlan?.subscription?.storage?.price ?? null;
          }) || null
        );
      };
      getPlan();
    }
  }, [savedPaymentMethod, planList]);

  return (
    <>
      <>
        <div className="page-container billing-container">
          <div className="">
            <h1 className="table-heading">Payment</h1>
          </div>
          <div className="billing-content">
            {!currentPlan && !loadingUserSettings && (
              <div className="add-billing-cta">
                <p>
                  You don&apos;t have a payment method. Please add one to prevent storage issues beyond your plan limits
                  below.
                </p>
              </div>
            )}

            {loadingUserSettings ? (
              <Loading message="Fetching user info..." />
            ) : (
              <PaymentTable
                plans={planList}
                currentPlan={currentPlan}
                setPlanSelection={setPlanSelection}
                setIsPaymentPlanModalOpen={setIsPaymentPlanModalOpen}
              />
            )}

            <div className="billing-settings-layout">
              <div>
                <h4>Payment Methods</h4>
                {savedPaymentMethod && !editingPaymentMethod ? (
                  <>
                    <PaymentMethodCard
                      savedPaymentMethod={savedPaymentMethod}
                      setEditingPaymentMethod={setEditingPaymentMethod}
                    />
                  </>
                ) : (
                  <div className="add-payment-method-cta">
                    <Elements stripe={stripePromise}>
                      <ElementsConsumer>
                        {({ stripe, elements }) => {
                          return (
                            <AddPaymentMethodForm
                              setHasPaymentMethods={setHasPaymentMethods}
                              setEditingPaymentMethod={setEditingPaymentMethod}
                              currentPlan={currentPlan?.id}
                            />
                          );
                        }}
                      </ElementsConsumer>
                    </Elements>
                  </div>
                )}
              </div>

              <div className="payment-history-layout">
                <h4>Enterprise user?</h4>
                <PaymentCustomPlan />
              </div>
            </div>
          </div>
        </div>
        <AccountPlansModal
          isOpen={isPaymentPlanModalOpen}
          onClose={() => setIsPaymentPlanModalOpen(false)}
          planList={planList}
          planSelection={planSelection}
          setCurrentPlan={setCurrentPlan}
          savedPaymentMethod={savedPaymentMethod}
          stripePromise={stripePromise}
          setHasPaymentMethods={setHasPaymentMethods}
          setEditingPaymentMethod={setEditingPaymentMethod}
        />
      </>
    </>
  );
};

/**
 * @returns {{ props: import('components/types').PageAccountProps}}
 */
export function getStaticProps() {
  const STRIPE_PUBLISHABLE_KEY_ENVVAR_NAME = 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY';
  const stripePublishableKey = process.env[STRIPE_PUBLISHABLE_KEY_ENVVAR_NAME];
  if (!stripePublishableKey) {
    throw new Error(
      `account payment page requires truthy stripePublishableKey, but got ${stripePublishableKey}. Did you set env.${STRIPE_PUBLISHABLE_KEY_ENVVAR_NAME}?`
    );
  }
  return {
    props: {
      title: 'Payment',
      isRestricted: true,
      redirectTo: '/login/',
      stripePublishableKey,
    },
  };
}

export default PaymentSettingsPage;
