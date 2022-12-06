import { formatAsStorageAmount, formatCurrency } from '../../../lib/utils';

const CurrentBillingPlanCard = ({ plan }) => {
  return (
    <div className="billing-card card-transparent">
      {plan !== undefined && (
        <div key={plan.title} className="billing-plan">
          <div className="billing-plan-overview">
            <h4 className="billing-plan-title">{plan.metadata['UI Label']}</h4>
            <div className="billing-plan-amount">{formatCurrency(plan.tiers[0]?.flat_amount / 100, true)}/mo</div>
          </div>

          <p className="billing-plan-desc">{plan.metadata['Description']}</p>
          <p className="billing-plan-limit">
            {plan.id !== 'free' && (
              <span>
                <span>Base Storage Capacity:</span> <strong>{formatAsStorageAmount(plan.tiers[0]?.up_to)}</strong> for{' '}
                <strong>{formatCurrency(plan.tiers[0]?.flat_amount / 100, true)}/mo</strong>
              </span>
            )}
            <span>
              <span>Additional Storage:</span>{' '}
              <strong>{formatCurrency(plan.tiers[1]?.unit_amount / 100)} per GiB</strong> after{' '}
              {formatAsStorageAmount(plan.tiers[0]?.up_to)}
            </span>
            <span>
              <span>Bandwidth:</span> <strong>{formatAsStorageAmount(plan.metadata['Bandwidth'])} / month</strong>
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CurrentBillingPlanCard;
