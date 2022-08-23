/**
 * @fileoverview Account Payment Settings
 */

import { useState } from 'react';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import PaymentMethodCard from '../../components/account/paymentMethodCard/paymentMethodCard.js';
import AccountPlansModal from '../../components/accountPlansModal/accountPlansModal.js';
// import { plans } from '../../components/contexts/plansContext';
import AccountPageData from '../../content/pages/app/account.json';
// import PaymentHistoryTable from '../../components/account/paymentHistory.js/paymentHistory.js';
import AddPaymentMethodForm from '../../components/account/addPaymentMethodForm/addPaymentMethodForm.js';

// const currentPlan = plans.find(p => p.current);

// const CurrentBillingPlanCard = props => {
//   return (
//     <div className="billing-card card-transparent">
//       {currentPlan !== undefined && (
//         <div key={currentPlan.title} className="billing-plan">
//           <h4 className="billing-plan-title">{currentPlan.title}</h4>
//           <p className="billing-plan-desc">{currentPlan.description}</p>
//           <p className="billing-plan-limit">
//             <span>Limit: {currentPlan.amount}</span>
//             <span>Overage: {currentPlan.overage}</span>
//           </p>
//           <div className="billing-plan-amount">{currentPlan.price}</div>
//           <div className="billing-plan-usage-container">
//             <p className="billing-label">Current Usage:</p>
//             <div className="billing-plan-usage">
//               <div className="billing-plan-meter">
//                 <span className="billing-plan-meter-used"></span>
//               </div>
//               100GB
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

const PaymentSettingsPage = props => {
  const { dashboard } = AccountPageData.page_content;
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const stripePromise = loadStripe(props.stripeKey);
  // const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const savedPaymentMethods = [];
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
                      />
                    )}
                  </ElementsConsumer>
                </Elements>
              </div>
              <div>
                <h4>Saved Payment Methods</h4>
                {savedPaymentMethods.length ? (
                  savedPaymentMethods.map((pm, i) => {
                    return <PaymentMethodCard key={`card-${i}`} card={pm} />;
                  })
                ) : (
                  <p>No payment methods saved</p>
                )}
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
