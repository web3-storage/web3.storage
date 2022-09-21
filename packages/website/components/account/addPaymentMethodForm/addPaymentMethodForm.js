import { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

import { userBillingSettings } from '../../../lib/api';
import Button from '../../../components/button/button';

/**
 * @param {object} obj
 * @param {(v: boolean) => void} [obj.setHasPaymentMethods]
 * @param {(v: boolean) => void} [obj.setEditingPaymentMethod]
 * @param { string | null } [obj.currentPlan]
 * @returns
 */
const AddPaymentMethodForm = ({ setHasPaymentMethods, setEditingPaymentMethod, currentPlan }) => {
  const elements = useElements();
  const stripe = useStripe();

  const [paymentMethodError, setPaymentMethodError] = useState('');
  const handlePaymentMethodAdd = async event => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.warn('stripe or elements is not loaded, so handlePaymentMethodAdd cannot use it');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (cardElement) {
      try {
        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });
        if (error) throw new Error(error.message);
        if (!paymentMethod?.id) return;
        const currPricePlan = currentPlan ? { price: currentPlan } : null;
        await userBillingSettings(paymentMethod.id, currPricePlan);
        setHasPaymentMethods?.(true);
        setEditingPaymentMethod?.(false);
        setPaymentMethodError('');
      } catch (error) {
        let message;
        if (error instanceof Error) message = error.message;
        else message = String(error);
        setPaymentMethodError(message);
      }
    }
  };

  return (
    <form>
      <div className="billing-card card-transparent">
        <CardElement
          options={{
            style: {
              base: {
                iconColor: '#cebcf4',
                color: '#fff',
                '::placeholder': {
                  color: '#ddd',
                },
              },
            },
          }}
        />
      </div>
      <div className="billing-validation">{paymentMethodError}</div>
      <Button onClick={handlePaymentMethodAdd} variant="outline-light" disabled={!stripe}>
        Add Card
      </Button>
    </form>
  );
};

export default AddPaymentMethodForm;
