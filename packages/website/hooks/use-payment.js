import { useState, useEffect, useMemo } from 'react';

import { userBillingSettings } from '../lib/api';
import constants from '../lib/constants';
import { freePlan, plans } from '../components/contexts/plansContext';

/**
 * @typedef {import('../components/contexts/plansContext').Plan} Plan
 * @typedef {import('../components/contexts/plansContext').StorageSubscription} StorageSubscription
 */

export const usePayment = () => {
  /**
   * @typedef {object} PaymentSettings
   * @property {null|{id: string}} paymentMethod
   * @property {object} subscription
   * @property {StorageSubscription|null} subscription.storage
   */

  const [needsFetchPaymentSettings, setNeedsFetchPaymentSettings] = useState(true);
  const [, setIsFetchingPaymentSettings] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState(/** @type {undefined|PaymentSettings} */ (undefined));
  // subcomponents that save a new plan can set this, which will trigger a re-fetch but the
  // ui can optimistically show the new value while the refetch happens.
  const [optimisticCurrentPlan, setOptimisticCurrentPlan] = useState(/** @type {Plan|undefined} */ (undefined));

  // fetch payment settings whenever needed
  useEffect(() => {
    async function loadPaymentSettings() {
      if (!needsFetchPaymentSettings) {
        return;
      }
      setIsFetchingPaymentSettings(true);
      setNeedsFetchPaymentSettings(false);
      try {
        setPaymentSettings(await userBillingSettings(constants.TERMS_OF_SERVICE_VERSION));
        setOptimisticCurrentPlan(undefined); // no longer use previous optimistic value
      } finally {
        setIsFetchingPaymentSettings(false);
      }
    }
    loadPaymentSettings();
  }, [needsFetchPaymentSettings]);

  // whenever the optimisticCurrentPlan is set, enqueue a fetch of actual payment settings
  useEffect(() => {
    if (optimisticCurrentPlan) {
      setNeedsFetchPaymentSettings(true);
    }
  }, [optimisticCurrentPlan]);

  const currentPlan = useMemo(() => {
    if (typeof optimisticCurrentPlan !== 'undefined') {
      return optimisticCurrentPlan;
    }
    if (typeof paymentSettings === 'undefined') {
      // haven't fetched paymentSettings yet.
      return undefined;
    }
    const storageSubscription = paymentSettings.subscription.storage;
    if (!storageSubscription) {
      return freePlan;
    }
    const matchingStandardPlan = plans.find(plan => {
      return plan.id === storageSubscription.price;
    });

    if (!matchingStandardPlan && typeof storageSubscription.price !== 'string') {
      return storageSubscription.price;
    }

    return matchingStandardPlan;
  }, [paymentSettings, optimisticCurrentPlan]);

  const savedPaymentMethod = useMemo(() => {
    return paymentSettings?.paymentMethod;
  }, [paymentSettings]);

  return {
    savedPaymentMethod: savedPaymentMethod,
    currentPlan: currentPlan,
  };
};
