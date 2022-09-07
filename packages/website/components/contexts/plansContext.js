export const sharedPlans = [
  {
    id: 'lite',
    title: 'Lite',
    description: 'For those that want to take advantage of more storage',
    price: '$3/mo',
    amount: '15GB per month',
    bandwidth: '30GB per month',
    overage: '$0.20 / GB',
    current: true,
  },
  {
    id: 'pro',
    title: 'Pro',
    description: 'All the sauce, all the toppings.',
    price: '$10/mo',
    amount: '60GB per month',
    bandwidth: '120GB per month',
    overage: '$0.17 / GB',
    current: false,
  },
];

export const freePlan = {
  id: 'free',
  title: 'Free',
  description: 'You are currently on the free tier. You can use our service up to 5GB/mo without being charged.',
  price: '$0/mo',
  amount: '5GB per month',
  bandwidth: '10GB per month',
  overage: '$0.25 / GB',
  current: false,
};

export const earlyAdopterPlan = {
  id: 'free',
  title: 'Early Adopter',
  description:
    'As an early adopter we appreciate your support and can continue to use the storage you are already accustomed to.',
  price: '$0/mo',
  amount: '25GB per month',
  bandwidth: 'n/a',
  overage: 'n/a',
  current: false,
};

export const plans = [freePlan, ...sharedPlans];
export const plansEarly = [earlyAdopterPlan, ...sharedPlans];
