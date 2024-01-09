import * as React from 'react';

import { W3upLaunchContext } from './contexts/w3upLaunchContext';
export { W3upLaunchContext } from './contexts/w3upLaunchContext';
export * from '@web3-storage/w3up-launch';

export function useW3upLaunch(context = W3upLaunchContext) {
  return React.useContext(context);
}

/**
 * copy for banner message across top of some web3.storage pages when w3up ships
 * @param {object} props
 * @param {Date} props.sunsetStartDate
 */
export const W3upMigrationRecommendationCopy = ({ sunsetStartDate }) => {
  const createNewAccountHref = 'https://console.web3.storage/?intent=create-account';
  const learnWhatsNewHref = 'https://blog.web3.storage/posts/the-data-layer-is-here-with-the-new-web3-storage';
  const sunsetDateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' });
  return (
    <>
      This web3.storage product sunset for new uploads on {sunsetDateFormatter.format(sunsetStartDate)}. To continue
      uploading, migrate to the new web3.storage API.
      <br />
      <a href={createNewAccountHref}>Click here to create a new account</a> and&nbsp;
      <a href={learnWhatsNewHref}>here to read about what’s awesome</a> about the new web3.storage experience.
    </>
  );
};
