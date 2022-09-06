// @ts-nocheck
/**
 * @fileoverview Account Payment Settings
 */

import { useState, useEffect } from 'react';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/router.js';

import PaymentMethodCard from '../../components/account/paymentMethodCard/paymentMethodCard.js';
import AccountPlansModal from '../../components/accountPlansModal/accountPlansModal.js';
// import PaymentHistoryTable from '../../components/account/paymentHistory.js/paymentHistory.js';
import CurrentBillingPlanCard from '../../components/account/currentBillingPlanCard/currentBillingPlanCard.js';
import GrandfatheredBillingPlan from '../../components/account/grandfatheredBillingPlan/grandfatheredBillingPlan.js';
import AddPaymentMethodForm from '../../components/account/addPaymentMethodForm/addPaymentMethodForm.js';
import Button from '../../components/button/button.js';
import { plans } from '../../components/contexts/plansContext';
import { getSavedPaymentMethod } from '../../lib/api';

const PaymentSettingsPage = props => {
  const router = useRouter();
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const stripePromise = loadStripe(props.stripeKey);
  const [hasPaymentMethods, setHasPaymentMethods] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(plans.find(p => p.current));
  const [onboardView, setOnboardView] = useState('paid');
  const [savedPaymentMethod, setSavedPaymentMethod] = useState(/** @type {PaymentMethod} */ ({}));
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(false);

  /**
   * @typedef {Object} PaymentMethodCard
   * @property {string} @type
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
      const card = await getSavedPaymentMethod();
      if (card) {
        setSavedPaymentMethod(card.method);
      }
      console.log(card);
      return card;
    };
    getSavedCard();
  }, [hasPaymentMethods]);

  return (
    <>
      <>
        <div className="page-container billing-container">
          <div className="">
            <h1 className="table-heading">Payment</h1>
            <select
              onChange={e => {
                setOnboardView(e.target.value);
                console.log(e.target.value);
                if (e.target.value === 'free') {
                  const freePlan = plans.find(p => p.id === 'free');
                  setCurrentPlan(freePlan);
                }
                if (e.target.value === 'paid') {
                  const paidPlan = plans.find(p => p.id === 'tier1');
                  setCurrentPlan(paidPlan);
                }
              }}
              className="state-changer"
              value={onboardView}
            >
              <option value="grandfathered">Grandfathered</option>
              <option value="free">Free (New)</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="billing-content">
            {onboardView === 'grandfathered' && (
              <div className="add-billing-cta">
                <p>
                  You don&apos;t have a payment method. Please add one to prevent storage issues beyond your plan limits
                  below.
                </p>
              </div>
            )}

            <div className="billing-settings-layout">
              <div>
                <div className="billing-plan-header">
                  <h4>Your Current Plan</h4>
                  {/* {onboardView == 'paid' ? (
                    <Button variant="dark" onClick={() => setIsPaymentPlanModalOpen(true)}>
                      Change Plan
                    </Button>
                  ) : (
                    <Button
                      variant="dark"
                      disabled={true}
                      tooltip={'You need to add a payment method to change your plan'}
                      tooltipPos="left"
                    >
                      Upgrade Plan
                    </Button>
                  )} */}
                </div>
                {onboardView !== 'grandfathered' ? (
                  <CurrentBillingPlanCard plan={currentPlan} />
                ) : (
                  <GrandfatheredBillingPlan onboardView={onboardView} />
                )}

                {onboardView === 'paid' ? (
                  <Button variant="dark" onClick={() => router.push('/account/payment/plans')}>
                    Change Plan
                  </Button>
                ) : (
                  <Button
                    variant="dark"
                    disabled={true}
                    tooltip={'You need to add a payment method to change your plan'}
                  >
                    Upgrade Plan
                  </Button>
                )}
              </div>
              <div>
                <h4>Payment Methods</h4>

                {savedPaymentMethod && !editingPaymentMethod ? (
                  <>
                    <PaymentMethodCard savedPaymentMethod={savedPaymentMethod} />
                    <Button variant="outline-light" onClick={() => setEditingPaymentMethod(true)}>
                      Edit Payment Method
                    </Button>
                  </>
                ) : (
                  <div className="add-payment-method-cta">
                    <Elements stripe={stripePromise}>
                      <ElementsConsumer>
                        {({ stripe, elements }) => (
                          <AddPaymentMethodForm
                            // @ts-ignore
                            stripe={stripe}
                            elements={elements}
                            setHasPaymentMethods={setHasPaymentMethods}
                            setEditingPaymentMethod={setEditingPaymentMethod}
                          />
                        )}
                      </ElementsConsumer>
                    </Elements>
                  </div>
                )}
              </div>
            </div>

            {/* <div className="payment-history-layout">
              <h3>Payment History &amp; Invoices</h3>
              <PaymentHistoryTable />
            </div> */}
          </div>
        </div>
        <AccountPlansModal
          isOpen={isPaymentPlanModalOpen}
          onClose={() => setIsPaymentPlanModalOpen(false)}
          currentPlan={currentPlan}
          setCurrentPlan={setCurrentPlan}
        />
      </>
    </>
  );
};

/**
 * @returns {{ props: import('components/types').PageAccountProps}}
 */
export function getStaticProps() {
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_TEST_PK;
  if (!stripeKey) {
    console.warn(`account payment page missing required process.env.NEXT_PUBLIC_STRIPE_TEST_PK`);
  }
  return {
    props: {
      title: 'Payment',
      isRestricted: true,
      redirectTo: '/login/',
      stripeKey: stripeKey ?? '',
    },
  };
}

export default PaymentSettingsPage;
