export const sharedPlans = [
  {
    id: 'lite',
    title: 'Lite',
    description: 'For those that want to take advantage of more storage',
    price: '$3/mo',
    baseStorage: '15GiB',
    additionalStorage: '$0.20 / GiB',
    bandwidth: '30GiB / month',
    blockLimit: '10,000 / GiB',
  },
  {
    // id: 'price_pro',
    id: 'pro',
    title: 'Expert',
    description: 'Our lowest price per GiB stored. For those with use cases that require scale.',
    price: '$10/mo',
    baseStorage: '60GiB',
    additionalStorage: '$0.17 / GiB',
    bandwidth: '120GiB / month',
    blockLimit: '10,000 / GiB',
  },
];

export const freePlan = {
  id: 'free',
  title: 'Free',
  description: 'You are currently on the free tier. You can use our service up to 5GiB/mo without being charged.',
  price: '$0/mo',
  baseStorage: '5GiB',
  additionalStorage: 'N/A',
  bandwidth: '10GiB / month',
  blockLimit: '2,500 / GiB',
};

export const earlyAdopterPlan = {
  id: 'earlyAdopter',
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
