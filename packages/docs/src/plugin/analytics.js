import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'

import { trackPageView } from '../util/countly'

export default (function () {
  if (!ExecutionEnvironment.canUseDOM) {
    return null
  }

  return {
    onRouteUpdate ({ previousLocation, location }) {
      if (previousLocation.pathname === location.pathname) {
        return
      }

      trackPageView(location.pathname)
    }
  }
})()
