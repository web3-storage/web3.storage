/**
 * @typedef {Object} BillingPlanCardsProps
 * @property {string} [className]
 * @property {any} [plans]
 */

/**
 *
 * @param {BillingPlanCardsProps} props
 * @returns
 */
const BillingPlanCards = ({ className = '', plans }) => {
  return (
    <div className="billing-plans">
      {plans.map(plan => (
        <div key={plan.title} className={`billing-card card-transparent ${plan.current ? 'current' : ''}`}>
          <div key={plan.title} className="billing-plan">
            <h4 className="billing-plan-title">{plan.title}</h4>
            <p className="billing-plan-desc">{plan.description}</p>
            <p className="billing-plan-limit">
              <span>Limit: {plan.amount}</span>
              <span>Overage: {plan.overage}</span>
            </p>
            <div className="billing-plan-amount">{plan.price}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BillingPlanCards;
