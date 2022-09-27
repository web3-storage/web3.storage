import { useState, useEffect } from 'react';

import { userBillingSettings } from '../lib/api';
import { plansAll } from '../components/contexts/plansContext';

export const usePayment = () => {
  /**
   * @typedef {Object} Plan
   * @property {string | null} id
   * @property {string} title
   * @property {string} description
   * @property {string} price
   * @property {string} base_storage
   * @property {string} additional_storage
   * @property {string} bandwidth
   * @property {string} block_limit
   * @property {string} car_size_limit
   * @property {boolean} pinning_api
   */

  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(/** @type {Plan | null} */ (null));

  useEffect(() => {
    const getUserPaymentInfo = async () => {
      const userPlan = await userBillingSettings();
      console.log(userPlan);
      if (userPlan.paymentMethod) {
        await setHasPaymentMethod(true);
      }
      if (userPlan?.subscription?.storage?.price) {
        setCurrentPlan(
          plansAll.find(plan => {
            return plan.id === userPlan?.subscription?.storage?.price ?? null;
          }) || null
        );
      } else {
        setCurrentPlan(plansAll.find(plan => plan.id === 'earlyAdopter') || null);
      }
    };
    getUserPaymentInfo();
  }, [currentPlan]);

  return {
    hasPaymentMethod: hasPaymentMethod,
    currentPlan: currentPlan,
  };
};
