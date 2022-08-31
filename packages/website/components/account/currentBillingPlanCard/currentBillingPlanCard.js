const CurrentBillingPlanCard = ({ plan }) => {
  return (
    <div className="billing-card card-transparent">
      {plan !== undefined && (
        <div key={plan.title} className="billing-plan">
          <div className="billing-plan-overview">
            <h4 className="billing-plan-title">{plan.title}</h4>
            <div className="billing-plan-amount">{plan.price}</div>
          </div>

          {/* <p className="billing-plan-desc">{plan.description}</p> */}
          <p className="billing-plan-limit">
            <span>Limit: {plan.amount}</span>
            <span>Overage: {plan.overage}</span>
          </p>
          <div className="billing-plan-usage-container">
            <small>Billing Cycle: Aug 18 - Sept 18</small>

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

export default CurrentBillingPlanCard;
