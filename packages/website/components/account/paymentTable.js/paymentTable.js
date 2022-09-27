import { useMemo } from 'react';

import Tooltip from 'ZeroComponents/tooltip/tooltip.js';
import InfoIcon from '../../../assets/icons/info';
import Button from '../../button/button.js';
import { useUser } from '../../../components/contexts/userContext';

const PaymentTable = ({ plans, currentPlan, isEarlyAdopter, setPlanSelection, setIsPaymentPlanModalOpen }) => {
  const {
    storageData: { data },
  } = useUser();

  // Raw TiB number of bytes, to be used in calculations
  const tebibyte = 1099511627776;
  const defaultStorageLimit = tebibyte;
  const limit = useMemo(() => data?.storageLimitBytes || defaultStorageLimit, [data, defaultStorageLimit]);

  return (
    <>
      {currentPlan && (
        <p className="billing-content-intro">
          <span>
            Your current plan is: <strong>{currentPlan.title}</strong>
          </span>
        </p>
      )}

      <div>
        <div>
          <div className={`billing-plans-table ${isEarlyAdopter && 'early-adopter'}`}>
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
                className={`billing-card card-transparent ${
                  currentPlan?.id === plan.id || (isEarlyAdopter && plan.id === 'earlyAdopter') ? 'current' : ''
                }`}
              >
                <div key={plan.title} className="billing-plan">
                  <h4 className="billing-plan-title">{plan.title}</h4>
                  <div>
                    <div className="billing-plan-amount">{plan.price}</div>
                  </div>

                  {isEarlyAdopter && plan.id === 'earlyAdopter' ? (
                    <div className="billing-plan-details">
                      <p className="early-adopter-desc">
                        As an Early Adopter, you already get our lowest storage rate. Your current limit is{' '}
                        {`${Math.floor(limit / tebibyte)} TiB`}
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
                      disabled={isEarlyAdopter}
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
            {isEarlyAdopter && (
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
