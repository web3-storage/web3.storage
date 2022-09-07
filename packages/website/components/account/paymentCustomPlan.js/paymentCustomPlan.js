import { useState } from 'react';
import clsx from 'clsx';

import Button from '../../button/button.js';
import CustomStorageForm from '../../customStorageForm/customStorageForm';

const PaymentCustomPlan = props => {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <div className="custom-plan-cta">
      <div>
        <h4>Need more storage?</h4>
        <p>We can put together a custom plan for you based on your specific needs</p>
      </div>
      <Button
        variant="light"
        className=""
        onClick={() => {
          setShowContactForm(true);
        }}
      >
        Contact Us
      </Button>

      <div className={clsx('custom-plan-form', showContactForm ? 'show' : 'hide')}>
        <CustomStorageForm />
      </div>
    </div>
  );
};

export default PaymentCustomPlan;
