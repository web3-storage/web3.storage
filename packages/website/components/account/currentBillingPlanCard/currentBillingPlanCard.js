import { formatAsStorageAmount, formatCurrency } from '../../../lib/utils';

const CurrentBillingPlanCard = ({ plan }) => {
  return (
    <div className="billing-card card-transparent">
      {plan !== undefined && (
        <div key={plan.title} className="billing-plan">
          <div className="billing-plan-overview">
            <h4 className="billing-plan-title">{plan.label}</h4>
            <div className="billing-plan-amount">{formatCurrency(plan.tiers[0]?.flatAmount / 100, true)}/mo</div>
          </div>

          <p className="billing-plan-desc">{plan.description}</p>
          <p className="billing-plan-limit">
            {plan.id !== 'free' && (
              <span>
                <span>Base Storage Capacity:</span> <strong>{formatAsStorageAmount(plan.tiers[0]?.upTo)}</strong> for{' '}
                <strong>{formatCurrency(plan.tiers[0]?.flatAmount / 100, true)}/mo</strong>
              </span>
            )}
            <span>
              <span>Additional Storage:</span>{' '}
              <strong>{formatCurrency(plan.tiers[1]?.unitAmount / 100)} per GiB</strong> after{' '}
              {formatAsStorageAmount(plan.tiers[0]?.upTo)}
            </span>
            <span>
              <span>Bandwidth:</span> <strong>{formatAsStorageAmount(plan.bandwidth)} / month</strong>
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CurrentBillingPlanCard;
