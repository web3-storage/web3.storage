import { plans } from '../../../components/contexts/plansContext';
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

export default CurrentBillingPlanCard;
