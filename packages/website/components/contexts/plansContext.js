export const sharedPlans = [
  {
    id: 'lite',
    title: 'Lite',
    description: 'For those that want to take advantage of more storage',
    price: '$3/mo',
    base_storage: '15GiB',
    additional_storage: '$0.20 / GiB',
    bandwidth: '30GiB / month',
    block_limit: '10,000 / GiB',
    car_size_limit: '5MiB',
    pinning_api: true,
    current: true,
  },
  {
    id: 'pro',
    title: 'Pro',
    description: 'All the sauce, all the toppings.',
    price: '$10/mo',
    base_storage: '60GiB',
    additional_storage: '$0.17 / GiB',
    bandwidth: '120GiB / month',
    block_limit: '10,000 / GiB',
    car_size_limit: '5MiB',
    pinning_api: true,
    current: false,
  },
];

export const freePlan = {
  id: 'free',
  title: 'Free',
  description: 'You are currently on the free tier. You can use our service up to 5GiB/mo without being charged.',
  price: '$0/mo',
  base_storage: '5GiB',
  additional_storage: 'NA',
  bandwidth: '10GiB / month',
  block_limit: '2,500 / GiB',
  car_size_limit: '5MiB',
  pinning_api: false,
  current: false,
};

export const earlyAdopterPlan = {
  id: 'free',
  title: 'Early Adopter',
  description:
    'As an early adopter we appreciate your support and can continue to use the storage you are already accustomed to.',
  price: '$0/mo',
  base_storage: '25GiB',
  additional_storage: 'NA',
  bandwidth: '10Gib / month',
  block_limit: '2,500 / GiB',
  car_size_limit: '5MiB',
  pinning_api: false,
  current: false,
};

export const plans = [freePlan, ...sharedPlans];
export const plansEarly = [earlyAdopterPlan, ...sharedPlans];
