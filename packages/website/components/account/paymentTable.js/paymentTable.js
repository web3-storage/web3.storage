import Button from '../../button/button.js';
import { plans } from '../../contexts/plansContext';

const PaymentTable = ({ setIsPaymentPlanModalOpen, currentPlan, setPlanSelection }) => {
  return (
    <>
      <p className="billing-content-intro">
        <p>
          Your current plan is: <strong>Lite</strong>
        </p>
        <small>Billing Cycle: Aug 18 - Sept 18</small>
      </p>

      <div className="">
        <div>
          <div className="billing-plans-table">
            <div className="billing-play-key">
              <div></div>
              <div></div>
              <div>
                <p>Storage Limit</p>
                <p>Bandwidth</p>
                <p>Overage Cost</p>
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
                    <p>{plan.amount}</p>
                    <p>{plan.bandwidth}</p>
                    <p>{plan.overage}</p>
                  </div>

                  {currentPlan?.id !== plan.id && (
                    <Button
                      variant="light"
                      className=""
                      onClick={() => {
                        setPlanSelection(plans.find(p => p.id === plan.id));
                        // setCurrentPlan(plans.find(p => p.id === plan.id));
                      }}
                    >
                      Select Plan
                    </Button>
                  )}

                  {currentPlan?.id === plan.id && (
                    <div className="billing-plan-usage-container">
                      <small className="billing-label">Current Usage:</small>
                      <div className="billing-plan-usage">
                        <div className="billing-plan-meter">
                          <span className="billing-plan-meter-used"></span>
                        </div>
                        30GB
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* {tempCurrentPlan && (
                <Button variant="outline-light" className="" onClick={() => setCurrentPlan(plans.find(p => p.id === tempCurrentPlan))}>
                  Confirm Change
                </Button>
              )} */}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentTable;
