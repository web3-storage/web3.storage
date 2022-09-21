import Button from '../../button/button.js';

const PaymentTable = ({ plans, currentPlan, isEarlyAdopter, setPlanSelection, setIsPaymentPlanModalOpen }) => {
  return (
    <>
      {currentPlan && (
        <p className="billing-content-intro">
          <span>
            Your current plan is: <strong>{currentPlan.title}</strong>
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
                <p>Additional Storage</p>
                <p>Bandwidth</p>
                <p>Block Limits</p>
              </div>
            </div>
            {plans.map(plan => (
              <div
                key={plan.title}
                className={`billing-card card-transparent ${
                  currentPlan?.id === plan.id || (isEarlyAdopter && plan.id === 'earlyAdopter') ? 'current' : ''
                }`}
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

                  {(currentPlan?.id === plan.id || (isEarlyAdopter && plan.id === 'earlyAdopter')) && (
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
