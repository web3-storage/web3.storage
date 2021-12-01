import React from 'react';
// import { withKnobs, text, boolean, number } from '@storybook/addon-knobs';

import Button from './button';

export default {
  title: 'Zero/Button'
};

export const Default = () => (
  <Button onClick={() => console.log('Button clicked')}>Button</Button>
);

export const Link = () => (
  <Button href="/">Link</Button>
);

export const ExternalLink = () => (
  <Button href="https://docs.web3.storage" openInNewWindow={true}>External Link</Button>
);
