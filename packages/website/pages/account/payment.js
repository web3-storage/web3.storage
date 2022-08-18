/**
 * @fileoverview Account Payment Settings
 */

import { useState } from 'react';
import { Elements, CardElement, useStripe, useElements, ElementsConsumer } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import AccountPlansModal from '../../components/accountPlansModal/accountPlansModal.js';
import { plans } from '../../components/contexts/plansContext';
import Button from '../../components/button/button.js';
import AccountPageData from '../../content/pages/app/account.json';

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

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async event => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (cardElement) {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      console.log(paymentMethod);
      if (error) {
        console.log(error);
      }
    }
  };

  return (
    <form>
      <div className="billing-card card-transparent">
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
      <Button onClick={handleSubmit} disabled={!stripe}>
        Add Card
      </Button>
    </form>
  );
};

const PaymentSettingsPage = props => {
  const { dashboard } = AccountPageData.page_content;
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const stripePromise = loadStripe(props.stripeKey);

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
                  <Button variant="dark" onClick={() => setIsPaymentPlanModalOpen(true)}>
                    Change Plan
                  </Button>
                </div>
                <CurrentBillingPlanCard />
                <small>Billing Cycle: Aug 18 - Sept 18</small>
              </div>
              <div>
                <h4>Add A Payment Method</h4>
                <Elements stripe={stripePromise}>
                  <ElementsConsumer>
                    {({ stripe, elements }) => (
                      <CheckoutForm
                        // @ts-ignore
                        stripe={stripe}
                        elements={elements}
                      />
                    )}
                  </ElementsConsumer>
                </Elements>
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
