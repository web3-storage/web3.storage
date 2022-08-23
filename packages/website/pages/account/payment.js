/**
 * @fileoverview Account Payment Settings
 */

import { useState } from 'react';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import PaymentMethodCard from '../../components/account/paymentMethodCard/paymentMethodCard.js';
import AccountPlansModal from '../../components/accountPlansModal/accountPlansModal.js';
import AccountPageData from '../../content/pages/app/account.json';
// import PaymentHistoryTable from '../../components/account/paymentHistory.js/paymentHistory.js';
// import CurrentBillingPlanCard from '../../components/account/currentBillingPlanCard/currentBillingPlanCard.js';
import AddPaymentMethodForm from '../../components/account/addPaymentMethodForm/addPaymentMethodForm.js';

const PaymentSettingsPage = props => {
  const { dashboard } = AccountPageData.page_content;
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const stripePromise = loadStripe(props.stripeKey);
  const [hasPaymentMethods, setHasPaymentMethods] = useState(false);
  return (
    <>
      <>
        <div className="page-container billing-container">
          <h1 className="table-heading">{dashboard.heading}</h1>
          <div className="billing-content">
            <div className="billing-settings-layout">
              {/* <div>
                <div className="billing-plan-header">
                  <h4>Your Current Plan</h4>
                  <Button variant="dark" onClick={() => setIsPaymentPlanModalOpen(true)}>
                    Change Plan
                  </Button>
                </div>
                <CurrentBillingPlanCard />
                <small>Billing Cycle: Aug 18 - Sept 18</small>
              </div> */}
              <div>
                <h4>Add A Payment Method</h4>
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
              <div>
                <h4>Saved Payment Methods</h4>
                {hasPaymentMethods ? <PaymentMethodCard /> : <p className="payments-none">No payment methods saved</p>}
              </div>
            </div>

            {/* <div className="payment-history-layout">
              <h3>Payment History &amp; Invoices</h3>
              <PaymentHistoryTable />
            </div> */}
          </div>
        </div>
        <AccountPlansModal isOpen={isPaymentPlanModalOpen} onClose={() => setIsPaymentPlanModalOpen(false)} />
      </>
    </>
  );
};

/**
 * @returns {{ props: import('components/types').PageAccountProps}}
 */
export function getStaticProps() {
  return {
    props: {
      title: AccountPageData.seo.title,
      isRestricted: true,
      redirectTo: '/login/',
      stripeKey: process.env.STRIPE_TEST_PK,
    },
  };
}

export default PaymentSettingsPage;
