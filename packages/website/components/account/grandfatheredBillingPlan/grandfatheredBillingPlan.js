const GrandfatheredBillingPlan = ({ onboardView }) => {
  let title = '',
    cost = '',
    desc = '',
    limit = '';
  switch (onboardView) {
    case 'grandfathered':
      title = 'Early Adopter';
      cost = '$0/mo';
      desc =
        'As an early adopter you have been grandfathered into the monthly storage you are already accustomed to using.';
      limit = '55GB';
      break;
    case 'free':
      title = 'Free';
      cost = '$0/mo';
      desc = 'You are currently on the free tier. You can use our service up to 5GB/mo without being charged.';
      limit = '5GB';
      break;
    default:
      break;
  }
  return (
    <div className="billing-card card-transparent">
      <div className="billing-plan">
        <div className="billing-plan-overview">
          <h4 className="billing-plan-title">{title}</h4>
          <div className="billing-plan-amount">{cost}</div>
        </div>
        <p className="billing-plan-desc">{desc}</p>
        <p className="billing-plan-limit">
          <span>
            Storage Limit: <strong>{limit} per month</strong>
          </span>
        </p>
        <div className="billing-plan-usage-container">
          <p className="billing-label">Current Usage:</p>
          <div className="billing-plan-usage">
            <div className="billing-plan-meter">
              <span className="billing-plan-meter-used"></span>
            </div>
            {limit}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrandfatheredBillingPlan;
