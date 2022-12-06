/**
 * @typedef {'free'|'pro'|'lite'} StoragePrice
 */

/**
 * @typedef {object} StorageSubscription
 * @property {StoragePrice|Plan} price
 */

/**
 * @typedef {null} EarlyAdopterStorageSubscription
 * When api's /user/payment .subscription.storage is null, there is no storage subscription.
 * And that is what we sometimes render as 'Early Adopter'
 */

/**
 * @typedef {'earlyAdopter'} EarlyAdopterPlanId
 */

/**
 * @typedef {object} StripeTier
 * @property {number|null} flat_amount
 * @property {number|null} unit_amount
 * @property {number|null} up_to
 */

/**
 * @typedef {object} Plan
 * @property {string} id
 * @property {import("@stripe/stripe-js").Metadata} metadata
 * @property {StripeTier[]} [tiers]
 */

export const sharedPlans = [
  {
    id: /** @type {const} */ ('lite'),
    metadata: {
      Description: 'For those that want to take advantage of more storage',
      'UI Label': 'Lite',
      Bandwidth: '60',
    },
    tiers: [
      {
        flat_amount: 300,
        unit_amount: 0,
        up_to: 15,
      },
      {
        flat_amount: null,
        unit_amount: 20,
        up_to: null,
      },
    ],
  },
  {
    id: /** @type {const} */ ('pro'),
    metadata: {
      Description: 'Our lowest price per GiB stored. For those with use cases that require scale.',
      'UI Label': 'Expert',
      Bandwidth: '24',
    },
    tiers: [
      {
        flat_amount: 1000,
        unit_amount: null,
        up_to: 60,
      },
      {
        flat_amount: null,
        unit_amount: 20,
        up_to: null,
      },
    ],
  },
];

export const freePlan = {
  id: /** @type {const} */ ('free'),
  metadata: {
    Description: 'You are currently on the free tier. You can use our service up to 5GiB/mo without being charged.',
    'UI Label': 'Free',
    Bandwidth: '10',
  },
  tiers: [
    {
      flat_amount: 0,
      unit_amount: 0,
      up_to: 5,
    },
    {
      flat_amount: 0,
      unit_amount: 20,
      up_to: null,
    },
  ],
};

export const earlyAdopterPlan = {
  id: /** @type {const} */ ('earlyAdopter'),
  metadata: {
    Description:
      'As an early adopter we appreciate your support and can continue to use the storage you are already accustomed to.',
    'UI Label': 'Early Adopter',
  },
  tiers: [],
};

export const plans = [freePlan, ...sharedPlans];
export const plansEarly = [earlyAdopterPlan, ...sharedPlans];
export const plansAll = [freePlan, earlyAdopterPlan, ...sharedPlans];
