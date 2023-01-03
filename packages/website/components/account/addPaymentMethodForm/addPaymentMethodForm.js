import { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

import Loading from '../../../components/loading/loading';
import { APIError, defaultErrorMessageForEndUser, saveDefaultPaymentMethod } from '../../../lib/api';
import Button from '../../../components/button/button';

/**
 * @typedef {import('../../contexts/plansContext').Plan} Plan
 */

/**
 * @param {object} obj
 * @param {(v: boolean) => void} [obj.setHasPaymentMethods]
 * @param {(v: boolean) => void} [obj.setEditingPaymentMethod]
 * @param {Plan['id']} [obj.currentPlan]
 * @returns
 */
const AddPaymentMethodForm = ({ setHasPaymentMethods, setEditingPaymentMethod, currentPlan }) => {
  const elements = useElements();
  const stripe = useStripe();
  const [isLoading, setIsLoading] = useState(false);

  const [paymentMethodError, setPaymentMethodError] = useState(/** @type {Error|null} */ (null));
  const handlePaymentMethodAdd = async event => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.warn('stripe or elements is not loaded, so handlePaymentMethodAdd cannot use it');
      return;
    }

    if (typeof currentPlan === 'undefined') {
      console.warn(
        'handlePaymentMethodAdd called when currentPlan is undefined, which should mean its still being fetched. This is unexpected, so the payment method will not be saved.'
      );
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (cardElement) {
      try {
        setIsLoading(true);
        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });
        if (error) throw new Error(error.message);
        if (!paymentMethod?.id) return;
        await saveDefaultPaymentMethod(paymentMethod.id);
        setHasPaymentMethods?.(true);
        setEditingPaymentMethod?.(false);
        setPaymentMethodError(null);
      } catch (error) {
        if (!(error instanceof APIError)) {
          console.warn('unexpected error adding payment method', error);
        }
        setPaymentMethodError(new Error(defaultErrorMessageForEndUser));
      } finally {
        setIsLoading(false);
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
      <div className="billing-validation">{paymentMethodError ? paymentMethodError.message : <></>}</div>
      <div className="billing-card-add-card-wrapper">
        <Button onClick={handlePaymentMethodAdd} variant="outline-light" disabled={!stripe}>
          Add Card
        </Button>
        {isLoading && <Loading size="medium" message="Adding card info..." />}
      </div>
    </form>
  );
};

export default AddPaymentMethodForm;
