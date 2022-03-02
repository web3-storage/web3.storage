/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect } from 'react'
import OriginalNotFound from '@theme-original/NotFound'
import { trackEvent, events } from '../util/countly'

function NotFound (props) {
  const { location } = props
  useEffect(() => {
    trackEvent(events.NOT_FOUND, {
      path: location?.pathname ?? 'unknown',
      referrer: typeof window !== 'undefined' ? document.referrer : null
    })
  })
  return <OriginalNotFound {...props} />
}

export default NotFound
