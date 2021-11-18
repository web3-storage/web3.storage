import React from 'react';
// import { withKnobs, text, boolean, number } from '@storybook/addon-knobs';

import Button from './button';

export default {
  title: 'Zero/Button',
  // component: Button,
};

export const Dark = () => (
  <Button
    href="https://docs.web3.storage"
    variant="dark"
  >
    Dark Button
  </Button>
);

export const Light = () => (
  <Button
    href="https://docs.web3.storage"
    variant="light"
  >
    Light Button
  </Button>
);

export const Outlined = () => (
  <Button
    href="https://docs.web3.storage"
    variant="outlined"
  >
    Outlined Button
  </Button>
);
