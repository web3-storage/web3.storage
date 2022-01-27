// ===================================================================== Imports
import React, { useState, useEffect, useRef } from "react";
import clsx from 'clsx';

import ZeroAccordionHeader from 'ZeroComponents/accordion/accordionHeader';
import ZeroAccordionContent from 'ZeroComponents/accordion/accordionContent';

// ====================================================================== Params
/**
 * @param {any} props TODO: Define props
 * @callback props.toggle
 * @param Boolean props.toggleOnLoad
 */
// ================================================================== Functions
function Header ({}) {
  return null
}

// ====================================================================== Params
/**
 * @param {any} props TODO: Define props
 */
// ================================================================== Functions

function Content ({}) {
  return null
}

const generateUID = () => {
  const firstNum = (Math.random() * 46656) | 0
  const secondNum = (Math.random() * 46656) | 0
  const first = ("000" + firstNum.toString(36)).slice(-3)
  const second = ("000" + secondNum.toString(36)).slice(-3)
  return first + second
}

/**
 * User Info Hook
 *
 * @param { any } props TODO: Define props
 */
function AccordionSection({
  active,
  toggle,
  toggleOnLoad,
  reportUID,
  disabled,
  children
}) {
  const [uid, setUID] = useState(generateUID)
  const firstUpdate = useRef(true);
  const header = children.find(child => child.type === Header)
  const content = children.find(child => child.type === Content)
  const open = active.includes(uid)

  useEffect(() => {
    reportUID(uid)
  }, [uid])

  return (
    <div className={ clsx("accordion-section", open ? 'open': '') }>

      <ZeroAccordionHeader
        uid={uid}
        toggle={disabled ? () => { return null } : toggle}>

        {header ? header.props.children : null}

      </ZeroAccordionHeader>

      <ZeroAccordionContent
        uid={uid}
        toggle={toggle}
        open={open}
        toggleOnLoad={toggleOnLoad}>

        {content ? content.props.children : null}

      </ZeroAccordionContent>

    </div>
  )
}

AccordionSection.Header = Header

AccordionSection.Content = Content

AccordionSection.defaultProps = {
  disabled: false
}

// ===================================================================== Export
export default AccordionSection
