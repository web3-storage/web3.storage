const debug = process.env.NODE_ENV !== 'production'

export const events = {
  FEEDBACK_HELPFUL: 'feedbackHelpful',
  FEEDBACK_IMPORTANT: 'feedbackImportant',
  FEEDBACK_GENERAL: 'feedbackGeneral',
  LINK_CLICK_HOME_LOGO: 'linkClickHomeLogo',
  LINK_CLICK_SIDEBAR: 'linkClickSidebar',
  LINK_CLICK_NAVBAR: 'linkClickNavbar',
  LINK_CLICK_FOOTER: 'linkClickFooter',
  NOT_FOUND: 'notFound',
}

let ready = false
export function init () {
  if (ready || typeof window === 'undefined' || typeof Countly == 'undefined') {
    return
  }

  // Track built-in docusaurus links
  document.addEventListener('click', ({ target }) => {
    if (!target.tagName) {
      return
    }

    // Sometimes the click event is delivered to the child of the <a> tag,
    // so if the target isn't an <a>, we check if it's parent is
    if (target.tagName.toLowerCase() !== 'a') {
      if (target.parentElement && 
          target.parentElement.tagName && 
          target.parentElement.tagName.toLowerCase() === 'a') {
        target = target.parentElement
      } else {
        return
      }
    }

    let event
    if (target.classList.contains('menu__link')) {
      event = events.LINK_CLICK_SIDEBAR
    } else if (target.classList.contains('navbar__link')) {
      event = events.LINK_CLICK_NAVBAR
    } else if (target.classList.contains('navbar__brand')) {
      event = events.LINK_CLICK_HOME_LOGO
    } else if (target.classList.contains('footer__link-item')) {
      event = events.LINK_CLICK_FOOTER
    } 

    if (event) {
      trackEvent(event, {
        path: location.pathname,
        href: target.href,
        link: target.pathname + (target.pathname.endsWith('/') ? '' : '/') + target.hash,
        text: target.innerText,
      })
    }
    
  })

  ready = true
  console.log('[countly] initialized')
  return ready
}


/*
  Track an event to countly with the provided data
*/
export function trackEvent (event, data = {}) {
  if (!ready) {
    if (!init()) {
      return
    }
  }

  if (typeof window === 'undefined' || typeof Countly === 'undefined') {
    return
  }
                
  debug && console.info('[countly]', 'trackEvent()', event, data)
  Countly.add_event({
    key: event,
    segmentation: data
  })
}

/*
  Track page view to countly. Default to window.location.pathname
*/
export function trackPageView (path) {
  if (!ready) {
    if (!init()) {
      return
    }
  }

  if (typeof window === 'undefined' || typeof Countly === 'undefined') {
    return
  }

  debug && console.info('[countly]', 'trackPageView()', path)
  Countly.track_pageview(path)
}

export default {
  events,
  trackEvent,
  trackPageView,
}