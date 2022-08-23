const PaymentMethodCard = ({ card }) => {
  // // mock stripe api data
  const cardData = {
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
  if (!card) card = cardData;
  // const paymentMethods = {
  //   "data": [
  //     {
  //       "id": "pm_1LVBPy2eZvKYlo2CNCmrquct",
  //       "object": "payment_method",
  //       "card": {
  //         "brand": "visa",
  //         "checks": {
  //           "address_line1_check": null,
  //           "address_postal_code_check": null,
  //           "cvc_check": "unchecked"
  //         },
  //         "country": "US",
  //         "exp_month": 12,
  //         "exp_year": 2023,
  //         "fingerprint": "Xt5EWLLDS7FJjR1c",
  //         "funding": "credit",
  //         "generated_from": null,
  //         "last4": "4242",
  //         "networks": {
  //           "available": [
  //             "visa"
  //           ],
  //           "preferred": null
  //         },
  //         "wallet": null
  //       },
  //       "created": 1660124498,
  //       "customer": null,
  //       "livemode": false,
  //       "type": "card"
  //     },
  //     {
  //       "id": "pm_1LVBPy2eZvKYlo2CNCmrquct",
  //       "object": "payment_method",
  //       "card": {
  //         "brand": "visa",
  //         "checks": {
  //           "address_line1_check": null,
  //           "address_postal_code_check": null,
  //           "cvc_check": "unchecked"
  //         },
  //         "country": "US",
  //         "exp_month": 12,
  //         "exp_year": 2023,
  //         "fingerprint": "Xt5EWLLDS7FJjR1c",
  //         "funding": "credit",
  //         "generated_from": null,
  //         "last4": "4242",
  //         "networks": {
  //           "available": [
  //             "visa"
  //           ],
  //           "preferred": null
  //         },
  //         "wallet": null
  //       },
  //       "created": 1660124498,
  //       "customer": null,
  //       "livemode": false,
  //       "type": "card"
  //     },
  //   ]
  // };

  return (
    <>
      <div className="saved-card card-transparent">
        {card.brand}
        {card.last4}
        {card.exp_month}/{card.exp_year}
      </div>
    </>
  );
};

export default PaymentMethodCard;
