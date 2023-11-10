import * as React from 'react';

import { W3upLaunchContext } from './contexts/w3upLaunchContext';
export { W3upLaunchContext } from './contexts/w3upLaunchContext';
export * from '@web3-storage/w3up-launch';

export function useW3upLaunch(context = W3upLaunchContext) {
  return React.useContext(context);
}
