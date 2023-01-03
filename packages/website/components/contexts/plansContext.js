/**
 * @typedef {'free'|'pro'|'lite'} StoragePrice
 */

/**
 * @typedef {object} StorageSubscription
 * @property {StoragePrice} price
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
 * @typedef {object} Plan
 * @property {StoragePrice|EarlyAdopterPlanId} id
 * @property {string} title
 * @property {string} description
 * @property {string} price
 * @property {string} baseStorage
 * @property {string} additionalStorage
 * @property {string} bandwidth
 * @property {string} blockLimit
 */

export const sharedPlans = [
  {
    id: /** @type {const} */ ('lite'),
    title: 'Lite',
    description: 'For those that want to take advantage of more storage',
    price: '$3/mo',
    baseStorage: '30GiB',
    additionalStorage: '$0.10 / GiB',
    bandwidth: '60GiB / month',
    blockLimit: '10,000 / GiB',
  },
  {
    id: /** @type {const} */ ('pro'),
    title: 'Expert',
    description: 'Our lowest price per GiB stored. For those with use cases that require scale.',
    price: '$10/mo',
    baseStorage: '120GiB',
    additionalStorage: '$0.08 / GiB',
    bandwidth: '240GiB / month',
    blockLimit: '10,000 / GiB',
  },
];

export const freePlan = {
  id: /** @type {const} */ ('free'),
  title: 'Free',
  description: 'You are currently on the free tier. You can use our service up to 5GiB/mo without being charged.',
  price: '$0/mo',
  baseStorage: '5GiB',
  additionalStorage: 'N/A',
  bandwidth: '10GiB / month',
  blockLimit: '2,500 / GiB',
};

export const earlyAdopterPlan = {
  id: /** @type {const} */ ('earlyAdopter'),
  title: 'Early Adopter',
  description:
    'As an early adopter we appreciate your support and can continue to use the storage you are already accustomed to.',
  price: '$0/mo',
  baseStorage: '25GiB',
  additionalStorage: 'NA',
  bandwidth: '10Gib / month',
  blockLimit: '2,500 / GiB',
};

export const plans = [freePlan, ...sharedPlans];
export const plansEarly = [earlyAdopterPlan, ...sharedPlans];
export const plansAll = [freePlan, earlyAdopterPlan, ...sharedPlans];

/**
 * Given a plan id, return the corresponding storage subscription object
 * that can be sent to /user/payment api (which doesn't have 'plans')
 * @param {Plan['id']} planId
 * @returns {StorageSubscription|EarlyAdopterStorageSubscription}
 */
export function planIdToStorageSubscription(planId) {
  if (planId === 'earlyAdopter') {
    return null;
  }
  return { price: planId };
}
