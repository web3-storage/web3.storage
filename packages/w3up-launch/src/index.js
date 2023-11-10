import * as React from 'react'

const sunsetStartEnv = process.env.NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_START ?? '2024-01-10T00:00:00Z'
const sunsetStartDate = new Date(Date.parse(sunsetStartEnv))

/**
 * If this isn't set, no announcements will appear
 */
const sunsetAnnouncementStartEnv = process.env.NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_ANNOUNCEMENT_START

/**
 * after this datetime, show announcements that web3.storage is sunset
 * and end-users should switch to w3up/console.web3.storage
 */
const sunsetAnnouncementStartDate = sunsetAnnouncementStartEnv
  ? new Date(Date.parse(sunsetAnnouncementStartEnv))
  : undefined

/**
 * Return whether sunset announcements related to w3up-launch should be shown.
 * An announcement date must be explicitly configured via env var, and now must be after that date.
 * @param {Date} at - time at which to return whether to show the announcement
 * @param {Date|undefined} [announcementStartDate] - when to begin showing announcements.
 * If not provided, always return false.
 */
export const shouldShowSunsetAnnouncement = (at = new Date(), announcementStartDate = sunsetAnnouncementStartDate) => {
  return announcementStartDate && at > announcementStartDate
}

/**
 * Return whether new user signups should be prevented.
 * start date is configured by NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_START
 */
export const shouldBlockNewUserSignupsBecauseProductSunset = (at = new Date(), start = sunsetStartDate) => {
  console.warn('shouldBlockNewUserSignupsBecauseProductSunset', { at, start })
  return start && at > start
}

/**
 * return whether the website should prevent allowing customers to switch their storage subscription plan.
 * @param {Date} at - time at which to return whether to show the announcement
 * @param {Date|undefined} [startDate] - when to begin preventing
 */
export const shouldPreventPlanSwitching = (at = new Date(), startDate = sunsetStartDate) => {
  return at > startDate;
};

export const w3upLaunchConfig = {
  type: 'W3upLaunchConfig',
  stages: {
    sunsetAnnouncement: {
      start: sunsetAnnouncementStartDate
    },
    sunset: {
      start: sunsetStartDate
    }
  },
  shouldShowSunsetAnnouncement: shouldShowSunsetAnnouncement(),
  shouldBlockNewUserSignupsBecauseProductSunset: shouldBlockNewUserSignupsBecauseProductSunset()
}

/**
 * copy for banner message across top of some web3.storage pages when w3up ships
 */
export const W3upMigrationRecommendationCopy = () => {
  const createNewAccountHref = 'https://console.web3.storage/?intent=create-account'
  const learnWhatsNewHref = 'https://console.web3.storage/?intent=learn-new-web3storage-experience'
  const sunsetDateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' })
  return (
    <>
      This web3.storage product will sunset on {sunsetDateFormatter.format(sunsetStartDate)}. We recommend migrating
      your usage of web3.storage to the new web3.storage.
      <br />
      <a href={createNewAccountHref}>Click here to create a new account</a> and&nbsp;
      <a href={learnWhatsNewHref}>here to read about what’s awesome</a> about the new web3.storage experience.
    </>
  )
}
