// ===================================================================== Imports
import React, { useState } from "react";
import ZeroAccordionHeader from 'ZeroComponents/accordion/accordionHeader';
import ZeroAccordionContent from 'ZeroComponents/accordion/accordionContent';
import clsx from 'clsx';

// ====================================================================== Params
/**
 * @param {Array} props.active
 * @param function props.toggle
 * @param Boolean props.toggleOnLoad
 */
// ================================================================== Functions
function Header () {
  return null
}

function Content () {
  return null
}

const generateUID = () => {
  var first = (Math.random() * 46656) | 0
  var second = (Math.random() * 46656) | 0
  first = ("000" + first.toString(36)).slice(-3)
  second = ("000" + second.toString(36)).slice(-3)
  return first + second
}

function AccordionSection({ active, toggle, toggleOnLoad, children }) {
  const [uid, setUID] = useState(generateUID)
  const header = children.find(child => child.type === Header)
  const content = children.find(child => child.type === Content)
  const open = Array.isArray(active) ? active.includes(uid) : active === uid

  return (
    <div className={ clsx("accordion-section", open ? 'open': '') }>

      <ZeroAccordionHeader
        uid={uid}
        toggle={toggle}>

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

// ===================================================================== Export
export default AccordionSection
