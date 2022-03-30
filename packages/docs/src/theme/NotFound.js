import React, { useEffect } from 'react'
import OriginalNotFound from '@theme-original/NotFound'
import { trackEvent, events } from '../util/countly'

function NotFound (props) {
  const { location } = props
  useEffect(() => {
    setTimeout(() => {
      trackEvent(events.NOT_FOUND, {
        path: location?.pathname ?? 'unknown',
        referrer: typeof window !== 'undefined' ? document.referrer : null
      })
    }, 200)
  }, [])
  return <OriginalNotFound {...props} />
}

export default NotFound
