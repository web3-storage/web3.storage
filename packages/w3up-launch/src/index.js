export const DEFAULT_SUNSET_START_DATE = new Date(Date.parse('2024-01-10T00:00:00Z'))

/**
 * @typedef {object} W3upLaunchEnv
 * @property {string|undefined} [NEXT_PUBLIC_W3UP_LAUNCH_LIMITED_AVAILABILITY_START] - when limited availability starts, e.g. no new user signups, cant change plan
 * @property {string|undefined} [NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_ANNOUNCEMENT_START] - when announcement starts
 * @property {string|undefined} [NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_START] - when the product is actually sunset (after announcement)
 */

export class W3upLaunch {
  /**
   * @param {W3upLaunchEnv} env
   */
  static fromEnv (env) {
    const limitedAvailabilityStartEnv = env.NEXT_PUBLIC_W3UP_LAUNCH_LIMITED_AVAILABILITY_START
    const limitedAvailabilityStartDate = limitedAvailabilityStartEnv ? new Date(Date.parse(limitedAvailabilityStartEnv)) : undefined

    const sunsetStartEnv = env.NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_START
    const sunsetStartDate = sunsetStartEnv ? new Date(Date.parse(sunsetStartEnv)) : undefined

    const sunsetAnnouncementStartEnv = env.NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_ANNOUNCEMENT_START
    const sunsetAnnouncementStartDate = sunsetAnnouncementStartEnv ? new Date(Date.parse(sunsetAnnouncementStartEnv)) : limitedAvailabilityStartDate

    const preventUserRegistrationStartDate = limitedAvailabilityStartDate
    const preventPlanSwitchingStartDate = limitedAvailabilityStartDate
    return new W3upLaunch({
      sunsetStartDate,
      sunsetAnnouncementStartDate,
      preventUserRegistrationStartDate,
      preventPlanSwitchingStartDate
    })
  }

  constructor ({ sunsetStartDate = DEFAULT_SUNSET_START_DATE, sunsetAnnouncementStartDate, preventUserRegistrationStartDate, preventPlanSwitchingStartDate }) {
    /** @type {Date} */
    this.sunsetStartDate = sunsetStartDate
    /** @type {Date|undefined} */
    this.sunsetAnnouncementStartDate = sunsetAnnouncementStartDate
    /** @type {Date|undefined} */
    this.preventUserRegistrationStartDate = preventUserRegistrationStartDate
    /** @type {Date|undefined} */
    this.preventPlanSwitchingStartDate = preventPlanSwitchingStartDate
  }
}

/**
 * Return whether sunset announcements related to w3up-launch should be shown.
 * An announcement date must be explicitly configured via env var, and now must be after that date.
 * @param {Date} at - time at which to return whether to show the announcement
 * @param {W3upLaunch} launch - configuration about the launch
 */
export const shouldShowSunsetAnnouncement = (launch, at = new Date()) => {
  return launch.sunsetAnnouncementStartDate && at > launch.sunsetAnnouncementStartDate
}

/**
 * Return whether new user signups should be prevented.
 * start date is configured by NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_START
 * @param {W3upLaunch} launch - configuration about the launch
 * @param {Date} at - time at which to return whether to show the announcement
 */
export const shouldBlockNewUserSignupsBecauseProductSunset = (launch, at = new Date()) => {
  return launch.preventUserRegistrationStartDate && at > launch.preventUserRegistrationStartDate
}

/**
 * return whether the website should prevent allowing customers to switch their storage subscription plan.
 * @param {W3upLaunch} launch - configuration about the launch
 * @param {Date} at - time at which to return whether to show the announcement
 */
export const shouldPreventPlanSwitching = (launch, at = new Date()) => {
  return launch.preventPlanSwitchingStartDate && at > launch.preventPlanSwitchingStartDate
}

/**
 * @param {W3upLaunch} launch
 */
export const createW3upLaunchConfig = (launch) => {
  return {
    type: 'W3upLaunchConfig',
    stages: {
      preventUserRegistration: {
        start: launch.preventUserRegistrationStartDate
      },
      preventPlanSwitching: {
        start: launch.preventPlanSwitchingStartDate
      },
      sunsetAnnouncement: {
        start: launch.sunsetAnnouncementStartDate
      },
      sunset: {
        start: launch.sunsetStartDate
      }
    },
    shouldShowSunsetAnnouncement: shouldShowSunsetAnnouncement(launch),
    shouldBlockNewUserSignupsBecauseProductSunset: shouldBlockNewUserSignupsBecauseProductSunset(launch),
    shouldPreventPlanSwitching: shouldPreventPlanSwitching(launch)
  }
}
