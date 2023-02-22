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
 * @property {number|null} flatAmount
 * @property {number|null} unitAmount
 * @property {number|null} upTo
 */

/**
 * @typedef {object} Plan
 * @property {string} id
 * @property {string} label
 * @property {boolean} isPreferred
 * @property {string|null} description
 * @property {string|null} bandwidth
 * @property {StripeTier[]} [tiers]
 */

export const sharedPlans = [
  {
    id: /** @type {const} */ ('lite'),
    description: 'For those that want to take advantage of more storage',
    label: 'Lite',
    bandwidth: '60',
    isPreferred: false,
    tiers: [
      {
        flatAmount: 300,
        unitAmount: 0,
        upTo: 30,
      },
      {
        flatAmount: null,
        unitAmount: 10,
        upTo: null,
      },
    ],
  },
  {
    id: /** @type {const} */ ('pro'),
    description: 'Our lowest price per GiB stored. For those with use cases that require scale.',
    label: 'Expert',
    bandwidth: '240',
    isPreferred: false,
    tiers: [
      {
        flatAmount: 1000,
        unitAmount: null,
        upTo: 120,
      },
      {
        flatAmount: null,
        unitAmount: 8,
        upTo: null,
      },
    ],
  },
];

export const freePlan = {
  id: /** @type {const} */ ('free'),
  description: 'You are currently on the free tier. You can use our service up to 5GiB/mo without being charged.',
  label: 'Free',
  bandwidth: '10',
  isPreferred: false,
  tiers: [
    {
      flatAmount: 0,
      unitAmount: 0,
      upTo: 5,
    },
  ],
};

export const earlyAdopterPlan = {
  id: /** @type {const} */ ('earlyAdopter'),
  isPreferred: true,
  bandwidth: null,
  description:
    'As an early adopter we appreciate your support and can continue to use the storage you are already accustomed to.',
  label: 'Early Adopter',
  tiers: [],
};

export const plans = [freePlan, ...sharedPlans];
export const plansEarly = [earlyAdopterPlan, ...sharedPlans];
export const plansAll = [freePlan, earlyAdopterPlan, ...sharedPlans];
