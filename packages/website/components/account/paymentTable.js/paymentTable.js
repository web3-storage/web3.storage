import { useMemo } from 'react';

import Tooltip from '../../../modules/zero/components/tooltip/tooltip.js';
import InfoIcon from '../../../assets/icons/info';
import Button from '../../button/button.js';
import { formatAsStorageAmount, formatCurrency } from '../../../lib/utils.js';

const getAdditionalStoragePrice = price => (typeof price === 'number' ? `${formatCurrency(price / 100)} / GiB` : 'N/A');

/**
 * @typedef {import('../../../components/contexts/plansContext.js').Plan} Plan
 * @typedef {import('../../../components/contexts/plansContext.js').StorageSubscription} StorageSubscription
 * @typedef {import('../../../components/contexts/plansContext.js').StoragePrice} StoragePrice
 */

/**
 * @param {object} props
 * @param {Plan} [props.currentPlan]
 * @param {boolean} [props.disablePlanSwitching] - whether to disable plan switching e.g. hide 'select plan' buttons
 * @param {Plan[]} props.plans
 * @param {(isOpen: boolean) => void} props.setIsPaymentPlanModalOpen
 * @param {(plan?: Plan) => void} props.setPlanSelection
 */
const PaymentTable = ({
  plans: plansProp,
  currentPlan,
  setPlanSelection,
  setIsPaymentPlanModalOpen,
  disablePlanSwitching,
}) => {
  const plans = useMemo(() => {
    const isCurrentPlanStandard = currentPlan ? ['free', 'lite', 'pro'].includes(currentPlan?.id) : false;

    if (!isCurrentPlanStandard) {
      return [...(currentPlan ? [currentPlan] : []), ...plansProp.slice(1)];
    }

    return plansProp;
  }, [plansProp, currentPlan]);
  const shouldShowSelectPlanButtons = !disablePlanSwitching;
  return (
    <>
      {currentPlan && (
        <p className="billing-content-intro" data-testid="currentPlanIndicator">
          <span>
            Your current plan is: <strong data-testid="currentPlan.label">{currentPlan.label}</strong>
          </span>
        </p>
      )}

      <div>
        <div>
          <div
            className={`billing-plans-table ${currentPlan?.isPreferred && 'preferred'} ${
              !currentPlan?.tiers?.length ? 'no-tiers' : ''
            }`}
          >
            <div className="billing-play-key">
              <div></div>
              <div></div>
              <div>
                <p>Base Storage Capacity</p>
                <p>
                  Additional Storage{' '}
                  <Tooltip
                    content="This is a charge for storage use above your limit. Please refer to <a href='/terms' target='_blank'>Terms of Service</a> for more information."
                    element="span"
                  >
                    <InfoIcon />
                  </Tooltip>
                </p>
                <p>Bandwidth</p>
              </div>
            </div>
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`billing-card card-transparent ${currentPlan?.id === plan.id ? 'current' : ''}`}
              >
                <div className="billing-plan">
                  <h4 className="billing-plan-title">{plan.label}</h4>
                  <div>
                    <div className="billing-plan-amount">
                      {formatCurrency((plan?.tiers?.[0]?.flatAmount ?? 0) / 100, true)}/mo
                    </div>
                  </div>

                  {!currentPlan?.tiers?.length && plan.id === currentPlan?.id ? (
                    <div className="billing-plan-details">
                      <p className="preferred-desc">{currentPlan.description}</p>
                    </div>
                  ) : (
                    <div className="billing-plan-details">
                      <p>{formatAsStorageAmount(plan.tiers?.[0]?.upTo ?? 0)}</p>
                      <p>{getAdditionalStoragePrice(plan.tiers?.[1]?.unitAmount)}</p>
                      <p>
                        {plan.bandwidth ? `${formatAsStorageAmount(parseInt(plan.bandwidth, 10) ?? 0)} / month` : 'N/A'}
                      </p>
                    </div>
                  )}

                  {shouldShowSelectPlanButtons && currentPlan?.id !== plan.id && (
                    <Button
                      variant="light"
                      disabled={currentPlan?.isPreferred}
                      className=""
                      onClick={() => {
                        setPlanSelection(plans.find(p => p.id === plan.id));
                        setIsPaymentPlanModalOpen(true);
                      }}
                    >
                      Select Plan
                    </Button>
                  )}

                  {currentPlan?.id === plan.id && (
                    <Button variant="light" disabled={true} className="">
                      Current Plan
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {currentPlan?.isPreferred && <p className="preferred-ui-block"></p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentTable;
