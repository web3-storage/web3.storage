import Button from '../../button/button.js';

const PaymentTable = ({ plans, currentPlan, setPlanSelection, setIsPaymentPlanModalOpen }) => {
  return (
    <>
      {currentPlan && (
        <p className="billing-content-intro">
          <span>
            Your current plan is: <strong>{currentPlan.title}</strong>
          </span>
          <small>Billing Cycle: Aug 18 - Sept 18</small>
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
                <p>CAR Size Limit</p>
                <p>Pinning API</p>
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
                    <p>{plan.car_size_limit}</p>
                    <p>{plan.pinning_api ? 'Available' : 'NA'}</p>
                  </div>

                  {currentPlan?.id !== plan.id && (
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

                  {currentPlan?.id === plan.id && (
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
