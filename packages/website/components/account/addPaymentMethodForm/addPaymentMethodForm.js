import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

import { API, getToken } from '../../../lib/api';
import Button from '../../../components/button/button';

export async function putPaymentMethod(pm_id) {
  const putBody = { method: { id: pm_id } };
  const res = await fetch(API + '/user/payment', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
    body: JSON.stringify(putBody),
  });
  if (!res.ok) {
    throw new Error(`failed to get storage info: ${await res.text()}`);
  }

  return res.json();
}

const AddPaymentMethodForm = ({ setHasPaymentMethods }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethodError, setPaymentMethodError] = useState('');

  const handlePaymentMethodAdd = async event => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
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
        await putPaymentMethod(paymentMethod.id);
        setHasPaymentMethods(true);
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
      <Button onClick={handlePaymentMethodAdd} disabled={!stripe}>
        Add Card
      </Button>
    </form>
  );
};

export default AddPaymentMethodForm;
