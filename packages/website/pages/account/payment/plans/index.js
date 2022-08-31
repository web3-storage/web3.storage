/**
 * @fileoverview Account Payment Plans
 */

import { useState } from 'react';
import clsx from 'clsx';

import Button from '../../../../components/button/button.js';
import { plans } from '../../../../components/contexts/plansContext';
import CustomStorageForm from '../../../../components/customStorageForm/customStorageForm';
import Link from '../../../../components/link/link';

const Plans = props => {
  const [currentPlan, setCurrentPlan] = useState(plans.find(p => p.current));
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <div className="page-container billing-container">
      <Link href="/account/payment" className="app-back-link">
        Back to Billing Overview
      </Link>
      <h1 className="table-heading">Choose a Plan</h1>
      <div className="billing-content">
        <p className="billing-content-intro">
          <p>
            Your current plan is: <strong>Tier 1</strong>
          </p>
          <small>Billing Cycle: Aug 18 - Sept 18</small>
        </p>

        <div className="">
          <div>
            <div className="billing-plans-table">
              <div className="billing-play-key">
                <div></div>
                <div></div>
                <div>
                  <p>Storage Limit</p>
                  <p>Bandwidth</p>
                  <p>Overage Cost</p>
                </div>
              </div>
              {plans.map(plan => (
                <div
                  key={plan.title}
                  className={`billing-card card-transparent ${currentPlan?.id === plan.id ? 'current' : ''}`}
                >
                  <div key={plan.title} className="billing-plan">
                    {/* <div className="billing-plan-overview"> */}
                    <h4 className="billing-plan-title">{plan.title}</h4>
                    <div>
                      <div className="billing-plan-amount">{plan.price}</div>
                    </div>
                    {/* </div> */}

                    {/* <p className="billing-plan-desc">{plan.description}</p> */}
                    <div className="billing-plan-details">
                      <p>{plan.amount}</p>
                      <p>{plan.bandwidth}</p>
                      <p>{plan.overage}</p>
                    </div>

                    {currentPlan?.id !== plan.id && (
                      <Button variant="outline-light" className="" onClick={() => setCurrentPlan(plan)}>
                        Select Plan
                      </Button>
                    )}

                    {currentPlan?.id === plan.id && (
                      <div className="billing-plan-usage-container">
                        <small className="billing-label">Current Usage:</small>
                        <div className="billing-plan-usage">
                          <div className="billing-plan-meter">
                            <span className="billing-plan-meter-used"></span>
                          </div>
                          30GB
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* {tempCurrentPlan && (
                <Button variant="outline-light" className="" onClick={() => setCurrentPlan(plans.find(p => p.id === tempCurrentPlan))}>
                  Confirm Change
                </Button>
              )} */}
            </div>

            <div className="custom-plan-cta">
              <div>
                <h4>Need more storage?</h4>
                <p>We can put together a custom plan for you based on your specific needs</p>
              </div>
              <Button
                variant="light"
                className=""
                onClick={() => {
                  setShowContactForm(true);
                }}
              >
                Contact Us
              </Button>

              <div className={clsx('custom-plan-form', showContactForm ? 'show' : 'hide')}>
                <CustomStorageForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      title: '',
      isRestricted: true,
      redirectTo: '/login/',
      stripeKey: stripeKey ?? '',
    },
  };
}

export default Plans;
