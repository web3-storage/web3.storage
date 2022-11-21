/** @constant */
export const events = {
  LINK_CLICK_BANNER_NFTSTORAGE: 'linkClickBannerNFTStorage',
  LINK_CLICK_NAVBAR: 'linkClickNavbar',
  LINK_CLICK_FOOTER: 'linkClickFooter',
  // Used for CTAs that are only linking to other pages/resources
  CTA_LINK_CLICK: 'ctaLinkClick',
  // Other custom action events
  LOGIN_CLICK: 'loginClick',
  LOGOUT_CLICK: 'logoutClick',
  FILE_UPLOAD_CLICK: 'fileUploadClick',
  FILE_DELETE_CLICK: 'fileDeleteClick',
  FILES_NAVIGATION_CLICK: 'filesNavigationClick',
  FILES_REFRESH: 'filesRefreshClick',
  TOKEN_CREATE: 'tokenCreate',
  TOKEN_COPY: 'tokenCopy',
  TOKEN_DELETE: 'tokenDelete',
  NOT_FOUND: 'notFound',
  FEEDBACK_HELPFUL: 'feedbackHelpful',
  FEEDBACK_IMPORTANT: 'feedbackImportant',
  FEEDBACK_GENERAL: 'feedbackGeneral',
};

/** @constant */
export const ui = {
  HOME_HERO: 'home/hero',
  HOME_GET_STARTED: 'home/get-started',
  NAVBAR: 'navbar',
  LOGIN: 'login',
  FILES: 'files',
  UPLOAD: 'upload',
  NEW_TOKEN: 'new-token',
  TOKENS: 'tokens',
  TOKENS_EMPTY: 'tokens/empty',
  PROFILE_GETTING_STARTED: 'profile/getting-started',
  PROFILE_API_TOKENS: 'profile/api-tokens',
};

export default {
  events,
  ui
};

export const saEvent = (eventName, metadata) => {

  // @ts-ignore
  if (window && window.sa_event) return window.sa_event(eventName, metadata);
};
