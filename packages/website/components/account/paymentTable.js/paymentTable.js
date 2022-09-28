import Tooltip from '../../../modules/zero/components/tooltip/tooltip.js';
import InfoIcon from '../../../assets/icons/info';
import Button from '../../button/button.js';

const PaymentTable = ({ plans, currentPlan, setPlanSelection, setIsPaymentPlanModalOpen }) => {
  return (
    <>
      {currentPlan && (
        <p className="billing-content-intro" data-testid="currentPlanIndicator">
          <span>
            Your current plan is: <strong data-testid="currentPlan.title">{currentPlan.title}</strong>
          </span>
        </p>
      )}

      <div className="">
        <div>
          <div className="billing-plans-table">
            <div className="billing-play-key">
              <div></div>
              <div></div>
              <div>
                <p>Base Storage Capacity</p>
                <p>
                  Additional Storage{' '}
                  <Tooltip content="For Free users, this is a hard limit. For Lite and Pro users, this is a charge for storage use above your limit.">
                    <InfoIcon />
                  </Tooltip>
                </p>
                <p>Bandwidth</p>
                <p>
                  Block Limits{' '}
                  <Tooltip content="For Free users, this is a hard limit. For Lite and Pro users, this is a soft limit with overage fees. Please refer to <a href='/terms'>Terms of Service</a> for exact amounts.">
                    <InfoIcon />
                  </Tooltip>
                </p>
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
                    <p>{plan.base_storage}</p>
                    <p>{plan.additional_storage}</p>
                    <p>{plan.bandwidth}</p>
                    <p>{plan.block_limit}</p>
                  </div>

                  {currentPlan?.id !== plan.id && plan.id !== 'earlyAdopter' && (
                    <Button
                      variant="light"
                      className=""
                      onClick={() => {
                        setPlanSelection(plans.find(p => p.id === plan.id));
                        setIsPaymentPlanModalOpen(true);
                      }}
                    >
                      Select Plan
                    </Button>
                  )}

                  {(currentPlan?.id === plan.id ||
                    (currentPlan?.id === 'earlyAdopter' && plan.id === 'earlyAdopter')) && (
                    <Button variant="light" disabled={true} className="">
                      Current Plan
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentTable;
