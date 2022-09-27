import { useState, useEffect } from 'react';

import { userBillingSettings } from '../lib/api';

export const usePayment = () => {
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);

  useEffect(() => {
    const getUserPaymentInfo = async () => {
      const userPlan = await userBillingSettings();
      console.log(userPlan);
      if (userPlan.paymentMethod) {
        await setHasPaymentMethod(true);
      }
      if (userPlan?.subscription?.storage?.price) {
        await setCurrentPlanId(userPlan?.subscription?.storage?.price);
      }
    };
    getUserPaymentInfo();
  }, []);

  return {
    hasPaymentMethod: hasPaymentMethod,
    currentPlanId: currentPlanId,
  };
};
