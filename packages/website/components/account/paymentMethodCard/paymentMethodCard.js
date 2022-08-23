import { faCcVisa } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PaymentMethodCard = () => {
  // // mock stripe api data
  const card = {
    brand: 'visa',
    checks: {
      address_line1_check: null,
      address_postal_code_check: null,
      cvc_check: 'unchecked',
    },
    country: 'US',
    exp_month: 12,
    exp_year: 2023,
    fingerprint: 'Xt5EWLLDS7FJjR1c',
    funding: 'credit',
    generated_from: null,
    last4: '4242',
  };

  return (
    <>
      <div className="saved-card card-transparent">
        <span>
          <FontAwesomeIcon icon={faCcVisa} />
          .... .... .... {card.last4}
        </span>
        <span>
          Exp: {card.exp_month}/{card.exp_year}
        </span>
      </div>
    </>
  );
};

export default PaymentMethodCard;
