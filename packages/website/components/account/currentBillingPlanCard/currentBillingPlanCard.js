const CurrentBillingPlanCard = ({ plan }) => {
  return (
    <div className="billing-card card-transparent">
      {plan !== undefined && (
        <div key={plan.title} className="billing-plan">
          <div className="billing-plan-overview">
            <h4 className="billing-plan-title">{plan.title}</h4>
            <div className="billing-plan-amount">{plan.price}</div>
          </div>

          <p className="billing-plan-desc">{plan.description}</p>
          <p className="billing-plan-limit">
            {plan.id !== 'free' && (
              <span>
                <span>Base Storage Capacity:</span> <strong>{plan.baseStorage}</strong> for{' '}
                <strong>{plan.price}</strong>
              </span>
            )}
            <span>
              <span>Additional Storage:</span> <strong>{plan.additionalStorage.split(' ')[0]} per GiB</strong> after{' '}
              {plan.baseStorage.split(' ')[0]}
            </span>
            <span>
              <span>Bandwidth:</span> <strong>{plan.bandwidth}</strong>
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CurrentBillingPlanCard;
