import * as React from 'react';
import * as w3upLaunch from '@web3-storage/w3up-launch';

/**
 * @type {React.Context<import('@web3-storage/w3up-launch').W3upLaunch>}
 */
export const W3upLaunchContext = React.createContext(
  w3upLaunch.W3upLaunch.fromEnv({
    // pass these explicitly so nextjs bundling replaces the process.env vars
    NEXT_PUBLIC_W3UP_LAUNCH_LIMITED_AVAILABILITY_START: process.env.NEXT_PUBLIC_W3UP_LAUNCH_LIMITED_AVAILABILITY_START,
    NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_ANNOUNCEMENT_START: process.env.NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_ANNOUNCEMENT_START,
    NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_START: process.env.NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_START,
  })
);
