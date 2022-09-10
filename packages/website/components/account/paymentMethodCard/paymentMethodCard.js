import { faCcVisa } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Loading from '../../../components/loading/loading';
import Button from '../../../components/button/button';

const PaymentMethodCard = ({ savedPaymentMethod, setEditingPaymentMethod }) => {
  return (
    <>
      {savedPaymentMethod && savedPaymentMethod.card ? (
        <>
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
          <div className="payment-method-actions">
            <Button variant="outline-light" onClick={() => setEditingPaymentMethod(true)}>
              Edit Payment Method
            </Button>
            <Button variant="text" onClick={() => setEditingPaymentMethod(true)}>
              Remove Payment Method
            </Button>
          </div>
        </>
      ) : (
        <>
          <Loading size="medium" message="fetching saved payment method..." />
          <br />
        </>
      )}
    </>
  );
};

export default PaymentMethodCard;
