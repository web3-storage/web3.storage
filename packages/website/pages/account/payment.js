/**
 * @fileoverview Account Payment Settings
 */

import { CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import Button from '../../components/button/button.js';
import AccountPageData from '../../content/pages/app/account.json';

const stripePromise = loadStripe('pk_test_QQ7rmXacxFCKeELa1ITqybmN');

const plans = [
  {
    title: 'Free',
    description: 'The service you already know and love',
    price: '$0/mo',
    amount: '10GB',
    overage: '',
    current: false,
  },
  {
    title: 'Starter',
    description: 'For those that want to take advantage of more storage',
    price: '$10/mo',
    amount: '100GB',
    overage: '$4/GB',
    current: true,
  },
  {
    title: 'Enterprise',
    description: 'All the sauce, all the toppings.',
    price: '$50/mo',
    amount: '500GB',
    overage: '$2/GB',
    current: false,
  },
];

const currentPlan = plans.find(p => p.current);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PaymentPlansCards = props => {
  return (
    <div className="billing-plans">
      {plans.map(plan => (
        <div key={plan.title} className="billing-plan">
          <h4 className="billing-plan-title">{plan.title}</h4>
          <p className="billing-plan-desc">{plan.description}</p>
          <div className="billing-plan-info">{plan.price}</div>
          <div className="billing-plan-amount">
            {plan.amount}
            <small className="billing-plan-overage">{plan.overage}</small>
          </div>
          <div className="billing-plan-usage">
            <div className="billing-plan-meter">
              <span className="billing-plan-meter-used"></span>
            </div>
            21.1/50GB
          </div>
        </div>
      ))}
    </div>
  );
};

const CurrentBillingPlanCard = props => {
  return (
    <div className="billing-card card-transparent">
      {currentPlan !== undefined && (
        <div key={currentPlan.title} className="billing-plan">
          <h4 className="billing-plan-title">{currentPlan.title}</h4>
          <p className="billing-plan-desc">{currentPlan.description}</p>
          <div className="billing-plan-info">{currentPlan.price}</div>
          <div className="billing-plan-amount">
            {currentPlan.amount}
            <small className="billing-plan-overage">{currentPlan.overage}</small>
          </div>
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
  return (
    <>
      <>
        <div className="page-container billing-container">
          <h1 className="table-heading">{dashboard.heading}</h1>
          <div className="billing-content">
            <div className="billing-settings-layout">
              <div>
                <h4>Your Current Plan</h4>
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
