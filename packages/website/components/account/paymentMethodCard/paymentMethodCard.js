import { faCcVisa } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PaymentMethodCard = () => {
  // // mock stripe api data
  const card = {
    brand: 'visa',
    country: 'US',
    exp_month: 12,
    exp_year: 2023,
    funding: 'credit',
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
