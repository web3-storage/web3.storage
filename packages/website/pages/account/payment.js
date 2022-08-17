/**
 * @fileoverview Account Payment Settings
 */

import { useState } from 'react';
import { CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import AccountPlansModal from '../../components/accountPlansModal/accountPlansModal.js';
import { plans } from '../../components/contexts/plansContext';
import Button from '../../components/button/button.js';
import AccountPageData from '../../content/pages/app/account.json';

const stripePromise = loadStripe(
  'pk_test_51LW5iZIfErzTm2rEq2poZhHidav6vMKnpywbLgfM7YtRpWUO1QyQjyoG4h5nO0wzzoLyqOocDb6h8fFcqw4RItB700OjnutXXx'
);

const currentPlan = plans.find(p => p.current);

const CurrentBillingPlanCard = props => {
  return (
    <div className="billing-card card-transparent">
      {currentPlan !== undefined && (
        <div key={currentPlan.title} className="billing-plan">
          <h4 className="billing-plan-title">{currentPlan.title}</h4>
          <p className="billing-plan-desc">{currentPlan.description}</p>
          <p className="billing-plan-limit">
            <span>Limit: {currentPlan.amount}</span>
            <span>Overage: {currentPlan.overage}</span>
          </p>
          <div className="billing-plan-amount">{currentPlan.price}</div>
          <div className="billing-plan-usage-container">
            <p className="billing-label">Current Usage:</p>
            <div className="billing-plan-usage">
              <div className="billing-plan-meter">
                <span className="billing-plan-meter-used"></span>
              </div>
              100GB
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentHistoryTable = props => {
  const date = new Date();
  return (
    <div className="billing-card card-transparent">
      <div className="payment-history-table">
        <div className="payment-history-table-header">
          <span>Date</span>
          <span>Details</span>
          <span>Amount</span>
          <span>Download</span>
        </div>
        <div className="payment-history-table-body">
          {Array.from([5, 4, 3, 2, 1]).map((_, i) => (
            <div key={`payment-${i}`} className="payment-history-table-row">
              <span>{new Date(date.setMonth(date.getMonth() - 1)).toLocaleDateString()}</span>
              <span>Starter Plan Subscription</span>
              <span>$100</span>
              <span>Invoice-00{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PaymentSettingsPage = props => {
  const { dashboard } = AccountPageData.page_content;
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);

  return (
    <>
      <>
        <div className="page-container billing-container">
          <h1 className="table-heading">{dashboard.heading}</h1>
          <div className="billing-content">
            <div className="billing-settings-layout">
              <div>
                <div className="billing-plan-header">
                  <h4>Your Current Plan</h4>
                  <Button variant="text" onClick={() => setIsPaymentPlanModalOpen(true)}>
                    Change Plan
                  </Button>
                </div>
                <CurrentBillingPlanCard />
              </div>
              <div>
                <h4>Add A Payment Method</h4>
                <div className="billing-card card-transparent">
                  <Elements stripe={stripePromise}>
                    <div className="mb-5">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              iconColor: '#cebcf4',
                              color: '#fff',
                              '::placeholder': {
                                color: '#ddd',
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </Elements>
                </div>
                <Button>Add Card</Button>
              </div>
            </div>

            <div className="payment-history-layout">
              <h3>Payment History &amp; Invoices</h3>
              <PaymentHistoryTable />
            </div>
          </div>
        </div>
        <AccountPlansModal isOpen={isPaymentPlanModalOpen} onClose={() => setIsPaymentPlanModalOpen(false)} />
      </>
    </>
  );
};

/**
 * @returns {{ props: import('components/types').PageProps}}
 */
export function getStaticProps() {
  return {
    props: {
      title: AccountPageData.seo.title,
      isRestricted: true,
      redirectTo: '/login/',
    },
  };
}

export default PaymentSettingsPage;
