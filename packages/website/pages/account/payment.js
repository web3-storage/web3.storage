/**
 * @fileoverview Account Payment Settings
 */

import { useEffect, useState } from 'react';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import Button from '../../components/button/button.js';
import PaymentMethodCard from '../../components/account/paymentMethodCard/paymentMethodCard.js';
import AccountPlansModal from '../../components/accountPlansModal/accountPlansModal.js';
// import { plans } from '../../components/contexts/plansContext';
import AccountPageData from '../../content/pages/app/account.json';
// import PaymentHistoryTable from '../../components/account/paymentHistory.js/paymentHistory.js';
import AddPaymentMethodForm from '../../components/account/addPaymentMethodForm/addPaymentMethodForm.js';
import { getSavedPaymentMethod } from '../../lib/api';

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
  const stripePromise = loadStripe(props.stripePublishableKey);
  const [hasPaymentMethods, setHasPaymentMethods] = useState(false);
  const [savedPaymentMethod, setSavedPaymentMethod] = useState(/** @type {PaymentMethod} */ ({}));
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(false);

  /**
   * @typedef {Object} PaymentMethodCard
   * @property {string} type
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
      <div className="page-container billing-container">
        <h1 className="table-heading">{dashboard.heading}</h1>
        <div className="billing-content">
          <div className="billing-settings-layout">
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
        </div>
        <AccountPlansModal isOpen={isPaymentPlanModalOpen} onClose={() => setIsPaymentPlanModalOpen(false)} />
      </div>
    </>
  );
};

/**
 * @returns {{ props: import('components/types').PageAccountProps}}
 */
export function getStaticProps() {
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!stripePublishableKey) {
    console.warn(`account payment page missing required process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`);
  }
  return {
    props: {
      title: AccountPageData.seo.title,
      isRestricted: true,
      redirectTo: '/login/',
      stripePublishableKey: stripePublishableKey ?? '',
    },
  };
}

export default PaymentSettingsPage;
