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

      <div>
        <div>
          <div className={`billing-plans-table ${currentPlan?.id === 'earlyAdopter' && 'early-adopter'}`}>
            <div className="billing-play-key">
              <div></div>
              <div></div>
              <div>
                <p>Base Storage Capacity</p>
                <p>
                  Additional Storage{' '}
                  <Tooltip content="This is a charge for storage use above your limit. Please refer to <a href='/terms' target='_blank'>Terms of Service</a> for more information.">
                    <InfoIcon />
                  </Tooltip>
                </p>
                <p>Bandwidth</p>
              </div>
            </div>
            {plans.map(plan => (
              <div
                key={plan.title}
                className={`billing-card card-transparent ${currentPlan?.id === plan.id ? 'current' : ''}`}
              >
                <div key={plan.title} className="billing-plan">
                  <h4 className="billing-plan-title">{plan.title}</h4>
                  <div>
                    <div className="billing-plan-amount">{plan.price}</div>
                  </div>

                  {currentPlan?.id === 'earlyAdopter' && plan.id === 'earlyAdopter' ? (
                    <div className="billing-plan-details">
                      <p className="early-adopter-desc">
                        As an Early Adopter, you already get our lowest storage rate.
                      </p>
                    </div>
                  ) : (
                    <div className="billing-plan-details">
                      <p>{plan.base_storage}</p>
                      <p>{plan.additional_storage}</p>
                      <p>{plan.bandwidth}</p>
                      <p>{plan.block_limit}</p>
                    </div>
                  )}

                  {currentPlan?.id !== plan.id && plan.id !== 'earlyAdopter' && (
                    <Button
                      variant="light"
                      disabled={currentPlan?.id === 'earlyAdopter'}
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
            {currentPlan?.id === 'earlyAdopter' && (
              <p className="early-adopter-ui-block">
                {/* As an Early Adopter, you already get our lowest storage rate.
                <small>
                  If you haven&apos;t already, please add a card to prevent storage issues beyond the amount you are
                  getting for free.
                </small> */}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentTable;
