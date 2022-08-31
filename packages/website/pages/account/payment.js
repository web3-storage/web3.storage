/**
 * @fileoverview Account Payment Settings
 */

import { useState } from 'react';
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

const PaymentSettingsPage = props => {
  const router = useRouter();
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const stripePromise = loadStripe(props.stripeKey);
  const [hasPaymentMethods, setHasPaymentMethods] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(plans.find(p => p.current));
  const [onboardView, setOnboardView] = useState('paid');
  return (
    <>
      <>
        <div className="page-container billing-container">
          <div className="">
            <h1 className="table-heading">Payment</h1>
            <select onChange={e => setOnboardView(e.target.value)} className="state-changer" value={onboardView}>
              <option value="grandfathered">Grandfathered</option>
              <option value="free-new">Free (New)</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="billing-content">
            {onboardView !== 'paid' && (
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
                {onboardView === 'paid' ? (
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
                <div className="add-payment-method-cta">
                  <Elements stripe={stripePromise}>
                    <ElementsConsumer>
                      {({ stripe, elements }) => (
                        <AddPaymentMethodForm
                          // @ts-ignore
                          stripe={stripe}
                          elements={elements}
                          setHasPaymentMethods={setHasPaymentMethods}
                        />
                      )}
                    </ElementsConsumer>
                  </Elements>
                </div>

                {hasPaymentMethods && (
                  <div>
                    <h4>Saved Payment Methods</h4>
                    {hasPaymentMethods ? (
                      <PaymentMethodCard />
                    ) : (
                      <p className="payments-none">No payment methods saved</p>
                    )}
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
