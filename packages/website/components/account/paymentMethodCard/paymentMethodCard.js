import { faCcVisa } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PaymentMethodCard = ({ savedPaymentMethod }) => {
  return (
    <>
      {savedPaymentMethod && savedPaymentMethod.card ? (
        <div className="saved-card card-transparent">
          <FontAwesomeIcon icon={faCcVisa} />
          <div>
            <span className="card-label">Card ending in:</span>
            <div className="card-number">
              <span>....</span>
              <span>....</span>
              <span>....</span>
              <span>{savedPaymentMethod.card.last4}</span>
            </div>
          </div>
          <span>
            <span className="card-label">Expires:</span>
            {savedPaymentMethod.card.exp_month}/{savedPaymentMethod.card.exp_year}
          </span>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

export default PaymentMethodCard;
