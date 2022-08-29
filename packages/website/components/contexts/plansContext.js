// temporary placeholder for stripe API data
export const plans = [
  {
    title: 'Free',
    description: 'The service you already know and love',
    price: '$0/mo',
    amount: '10GB',
    overage: '',
    current: false,
  },
  {
    title: 'Starter',
    description: 'For those that want to take advantage of more storage',
    price: '$10/mo',
    amount: '100GB',
    overage: '$4/GB',
    current: true,
  },
  {
    title: 'Enterprise',
    description: 'All the sauce, all the toppings.',
    price: '$50/mo',
    amount: '500GB',
    overage: '$2/GB',
    current: false,
  },
];
