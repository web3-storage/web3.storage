import * as React from 'react';

/**
 * copy for banner message across top of some web3.storage pages when w3up ships
 */
export const W3upMigrationRecommendationCopy = () => {
  const createNewAccountHref = 'https://console.web3.storage/?intent=create-account';
  const learnWhatsNewHref = 'https://console.web3.storage/?intent=learn-new-web3storage-experience';
  return (
    <>
      This web3.storage product will sunset on January 9, 2024. We recommend migrating your usage of web3.storage to the
      new web3.storage. <a href={createNewAccountHref}>Click here to create a new account</a> and&nbsp;
      <a href={learnWhatsNewHref}>here to read about what’s awesome</a> about the new web3.storage experience.
    </>
  );
};

const prelaunchStartEnv = process.env.NEXT_PUBLIC_W3UP_PRELAUNCH_START;

export const w3upLaunchContextDefaults = {
  stages: {
    prelaunch: {
      start: prelaunchStartEnv ? new Date(Date.parse(prelaunchStartEnv)) : undefined,
    },
  },
};
