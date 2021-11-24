import React from 'react';
// import { withKnobs, text, boolean, number } from '@storybook/addon-knobs';

import Button, { ButtonVariant } from './button';

export default {
  title: 'Web3.Storage/Button',
};

export const Dark = () => (
  <Button variant={ButtonVariant.DARK} onClick={() => console.log('Button clicked')}>Button</Button>
);

export const Light = () => (
  <Button variant={ButtonVariant.LIGHT} onClick={() => console.log('Button clicked')}>Button</Button>
);

export const Outlined = () => (
  <Button variant={ButtonVariant.OUTLINED} onClick={() => console.log('Button clicked')}>Button</Button>
);
