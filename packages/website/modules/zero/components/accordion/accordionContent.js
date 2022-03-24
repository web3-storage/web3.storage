// ===================================================================== Imports
import clsx from 'clsx';
import { useRef, useState, useEffect, useLayoutEffect } from 'react';

// ====================================================================== Params
/**
 * @param Boolean props.open
 * @callback props.toggle
 * @param String props.uid
 * @param Boolean props.toggleOnLoad
 */
// ====================================================================== Export
export default function AccordionContent({ open, toggle, uid, toggleOnLoad, children }) {
  const content = useRef(/** @type {any} */ (null))
  const firstUpdate = useRef(true)
  const [contentHeight, setContentHeight] = useState('0px')
  const [height, setHeight] = useState('unset')
  const [isMeasuring, setIsMeasuring] = useState(true)
  const measuring = isMeasuring ? "measuring-content" : ''

  // ================================================================= Functions
  useLayoutEffect(() => {
    setTimeout(() => {
      updateContentHeight(open)
      if (toggleOnLoad) { toggle(uid) }
    }, 500)
  }, [toggleOnLoad])

  useEffect(() => {
    const resize = () => { updateContentHeight(open) }
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [open])

  useEffect(() => {
    if (!firstUpdate.current) {
      const newHeight = open ? contentHeight : '0px'
      setHeight(newHeight)
    }
    firstUpdate.current = false
  }, [open])

  const updateContentHeight = (val) => {
    if (val) {
      setHeight('unset')
      const newContentHeight = content.current.clientHeight + 'px'
      setContentHeight(newContentHeight)
      setHeight(newContentHeight)
    } else {
      setHeight('unset')
      setIsMeasuring(true)
      setContentHeight(content.current.clientHeight + 'px')
      setIsMeasuring(false)
      setHeight('0px')
    }
  }

  // ======================================================== Template [Content]
  return (
    <div
      ref={content}
      className={ clsx("accordion-content", measuring) }
      style={{ height }}>

      {children ? children : ''}

    </div>
  )
}
