/**
 * @typedef {'free'|'pro'|'lite'} StoragePrice
 */

/**
 * @typedef {object} StorageSubscription
 * @property {StoragePrice|Plan} price
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

export const freePlan = {
  id: /** @type {const} */ ('free'),
  description: 'You are currently on the free tier. You can use our service up to 5GiB without being charged.',
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

export const plans = [
  freePlan,
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
