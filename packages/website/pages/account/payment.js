/**
 * @fileoverview Account Payment Settings
 */

import { parse as queryParse } from 'querystring';

import { useState, useEffect, useMemo } from 'react';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import Loading from '../../components/loading/loading.js';
import PaymentCustomPlan from '../../components/account/paymentCustomPlan.js/paymentCustomPlan.js';
import PaymentTable from '../../components/account/paymentTable.js/paymentTable.js';
import PaymentMethodCard from '../../components/account/paymentMethodCard/paymentMethodCard.js';
import AccountPlansModal from '../../components/accountPlansModal/accountPlansModal.js';
import AddPaymentMethodForm from '../../components/account/addPaymentMethodForm/addPaymentMethodForm.js';
import { plans, freePlan } from '../../components/contexts/plansContext';
import { userBillingSettings } from '../../lib/api';
import GeneralPageData from '../../content/pages/general.json';
import constants from '../../lib/constants.js';
import {
  W3upMigrationRecommendationCopy,
  shouldShowSunsetAnnouncement,
  shouldPreventPlanSwitching,
  useW3upLaunch,
} from '../../components/w3up-launch.js';
import * as PageBannerPortal from '../../components/page-banner/page-banner-portal.js';

/**
 * @typedef {import('../../components/contexts/plansContext').Plan} Plan
 * @typedef {import('../../components/contexts/plansContext').StorageSubscription} StorageSubscription
 * @typedef {import('../../components/contexts/plansContext').StoragePrice} StoragePrice
 */

/**
 * @typedef {object} PaymentSettings
 * @property {null|{id: string}} paymentMethod
 * @property {object} subscription
 * @property {StorageSubscription} subscription.storage
 */

/**
 * @typedef {Object} PaymentMethodCard
 * @property {string} brand
 * @property {string} country
 * @property {string} exp_month
 * @property {string} exp_year
 * @property {string} last4
 */

/**
 * @typedef {Object} PaymentMethod
 * @property {string} id
 * @property {PaymentMethodCard} card
 */

function removePlanQueryParam() {
  window.history.pushState({}, '', window.location.href.replace(/plan=[^&]+&?/, ''));
}

const PaymentSettingsPage = props => {
  const planQueryParam = queryParse(window.location.search.substring(1))?.plan;
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const stripePromise = loadStripe(props.stripePublishableKey);
  const [needsFetchPaymentSettings, setNeedsFetchPaymentSettings] = useState(true);
  const [, setIsFetchingPaymentSettings] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState(/** @type {undefined|PaymentSettings} */ (undefined));
  const [planSelection, setPlanSelection] = useState(/** @type {Plan|undefined} */ (undefined));
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(false);
  // subcomponents that save a new plan can set this, which will trigger a re-fetch but the
  // ui can optimistically show the new value while the refetch happens.
  const [optimisticCurrentPlan, setOptimisticCurrentPlan] = useState(/** @type {Plan|undefined} */ (undefined));
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  useEffect(() => {
    if (planQueryParam) {
      const desiredPlanFromQueryParam = plans.find(plan => plan.id === planQueryParam);
      if (desiredPlanFromQueryParam) {
        setPlanSelection(desiredPlanFromQueryParam);
        setIsPaymentPlanModalOpen(true);
      } else {
        removePlanQueryParam();
      }
    }
  }, [planQueryParam]);

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
    return typeof storageSubscription.price === 'string'
      ? plans.find(plan => {
          return plan.id === storageSubscription.price;
        })
      : storageSubscription.price;
  }, [paymentSettings, optimisticCurrentPlan]);
  const savedPaymentMethod = useMemo(() => {
    return paymentSettings?.paymentMethod;
  }, [paymentSettings]);
  const w3upLaunch = useW3upLaunch();
  return (
    <>
      {shouldShowSunsetAnnouncement(w3upLaunch) && (
        <PageBannerPortal.PageBanner>
          <W3upMigrationRecommendationCopy sunsetStartDate={w3upLaunch.sunsetStartDate} />
        </PageBannerPortal.PageBanner>
      )}
      <>
        <div className="page-container billing-container">
          <div className="">
            <h1 className="table-heading">Payment</h1>
          </div>
          <div className="billing-content">
            {currentPlan?.id === 'free' && !savedPaymentMethod && (
              <div className="add-billing-cta">
                <p>
                  You don&apos;t have a paid plan. Please add a credit/debit card and select a plan to prevent storage
                  issues beyond your plan limits below.
                </p>
              </div>
            )}

            {typeof paymentSettings === 'undefined' ? (
              <Loading message="Fetching user info..." />
            ) : (
              <PaymentTable
                plans={plans}
                currentPlan={currentPlan}
                setPlanSelection={setPlanSelection}
                setIsPaymentPlanModalOpen={setIsPaymentPlanModalOpen}
                disablePlanSwitching={shouldPreventPlanSwitching(w3upLaunch)}
              />
            )}

            <div className="billing-settings-layout">
              <div>
                <h4>Payment Methods</h4>
                {savedPaymentMethod && !editingPaymentMethod ? (
                  <>
                    <PaymentMethodCard
                      savedPaymentMethod={savedPaymentMethod}
                      setEditingPaymentMethod={setEditingPaymentMethod}
                    />
                  </>
                ) : (
                  <div className="add-payment-method-cta">
                    <Elements stripe={stripePromise}>
                      <ElementsConsumer>
                        {({ stripe, elements }) => {
                          return (
                            <AddPaymentMethodForm
                              setHasPaymentMethods={() => setNeedsFetchPaymentSettings(true)}
                              setEditingPaymentMethod={setEditingPaymentMethod}
                              currentPlan={currentPlan?.id}
                            />
                          );
                        }}
                      </ElementsConsumer>
                    </Elements>
                  </div>
                )}
              </div>

              <div className="payment-history-layout">
                <h4>Enterprise user?</h4>
                <PaymentCustomPlan />
              </div>
            </div>
          </div>
        </div>
        {planSelection && (
          <>
            <AccountPlansModal
              isOpen={isPaymentPlanModalOpen}
              onClose={() => {
                setIsPaymentPlanModalOpen(false);
                setHasAcceptedTerms(false);
                if (planQueryParam) {
                  removePlanQueryParam();
                }
              }}
              planList={plans}
              planSelection={planSelection}
              setCurrentPlan={setOptimisticCurrentPlan}
              savedPaymentMethod={savedPaymentMethod}
              stripePromise={stripePromise}
              setHasPaymentMethods={() => setNeedsFetchPaymentSettings(true)}
              setEditingPaymentMethod={setEditingPaymentMethod}
              setHasAcceptedTerms={setHasAcceptedTerms}
              hasAcceptedTerms={hasAcceptedTerms}
            />
          </>
        )}
      </>
    </>
  );
};

/**
 * @returns {{ props: import('components/types').PageAccountProps}}
 */
export function getStaticProps() {
  const crumbs = GeneralPageData.breadcrumbs;
  const STRIPE_PUBLISHABLE_KEY_ENVVAR_NAME = 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY';
  const stripePublishableKey = process.env[STRIPE_PUBLISHABLE_KEY_ENVVAR_NAME];
  if (!stripePublishableKey) {
    throw new Error(
      `account payment page requires truthy stripePublishableKey, but got ${stripePublishableKey}. Did you set env.${STRIPE_PUBLISHABLE_KEY_ENVVAR_NAME}?`
    );
  }
  return {
    props: {
      title: 'Payment',
      requiresAuth: true,
      stripePublishableKey,
      breadcrumbs: [crumbs.index, crumbs.payment],
    },
  };
}

export default PaymentSettingsPage;
