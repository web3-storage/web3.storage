import { useState } from 'react';

import Button from '../../button/button.js';
import AccountCustomPlanModal from '../accountCustomPlanModal/accountCustomPlanModal.js';

const PaymentCustomPlan = props => {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <>
      <div className="custom-plan-cta">
        <div>
          <p>We can put together a custom plan for you based on your specific needs</p>

          <Button
            variant="outline-light"
            className=""
            onClick={() => {
              setShowContactForm(true);
            }}
          >
            Contact Us
          </Button>
        </div>
      </div>
      <AccountCustomPlanModal isOpen={showContactForm} onClose={() => setShowContactForm(false)} />
    </>
  );
};

export default PaymentCustomPlan;
