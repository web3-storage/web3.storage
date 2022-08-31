import { useState } from 'react';

import Button from '../../../components/button/button.js';

/**
 * @typedef {Object} BillingPlanCardsProps
 * @property {string} [className]
 * @property {any} [plans]
 * @property {any} [currentPlan]
 * @property {any} [setCurrentPlan]
 */

/**
 *
 * @param {BillingPlanCardsProps} props
 * @returns
 */
const BillingPlanCards = ({ className = '', plans, currentPlan, setCurrentPlan }) => {
  const [tempCurrentPlan, setTempCurrentPlan] = useState(null);
  return (
    <div className="billing-plans">
      {plans.map(plan => (
        <button
          key={plan.title}
          className={`billing-card card-transparent ${currentPlan.id === plan.id ? 'current' : ''} ${
            tempCurrentPlan === plan.id ? 'active' : ''
          }`}
          onClick={() => setTempCurrentPlan(plan.id)}
        >
          <div key={plan.title} className="billing-plan">
            {/* <div className="billing-plan-overview"> */}
            <h4 className="billing-plan-title">{plan.title}</h4>
            <div>
              <div className="billing-plan-amount">{plan.price}</div>
            </div>
            {/* </div> */}

            {/* <p className="billing-plan-desc">{plan.description}</p> */}
            <p className="billing-plan-limit">
              <span>{plan.amount}</span>
              <span>+{plan.overage}</span>
            </p>
          </div>
        </button>
      ))}

      {tempCurrentPlan && (
        <Button variant="dark" className="" onClick={() => setCurrentPlan(plans.find(p => p.id === tempCurrentPlan))}>
          Confirm Change
        </Button>
      )}
    </div>
  );
};

export default BillingPlanCards;
