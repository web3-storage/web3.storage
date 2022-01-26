// ===================================================================== Imports
import React, { useState, useEffect, useRef } from "react";

// ====================================================================== Params
/**
 * @param Boolean props.multiple
 * @param Boolean props.toggleOnLoad
 * @param {Array} props.sections
 */

// =============================================================================
function Accordion ({
  multiple,
  toggleOnLoad,
  children
}) {
  const [active, setActive] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const sections = useRef([]);
  const buttonMessage = expanded ? 'collapse all' : 'expand all';

  // ================================================================= Functions
  const setActiveSections = (id) => {
    if (multiple) {
      if (active.includes(id)) {
        setActive(active.filter((_id) => _id !== id));
      } else {
        setActive([...active, id]);
      }
    } else {
      if (active[0] === id) {
        setActive([]);
      } else {
        setActive([id]);
      }
    }
  }

  const reportUID = (id) => {
    sections.current.push(id)
  }

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        active: active,
        toggle: setActiveSections,
        toggleOnLoad: toggleOnLoad,
        reportUID: reportUID
      })
    }
    return child
  })

  const toggleExpanded = () => {
    if (expanded) {
      setActive([])
    } else {
      setActive(sections.current)
    }

    setExpanded(!expanded);
  }

  // ================================================================== Template
  return (
    <>
      <div className="accordion-control-bar">
        <button
          className="accordion-expand-all-toggle"
          onClick={toggleExpanded}>
          { buttonMessage }
        </button>
      </div>

      <div className="accordion">

        { childrenWithProps }

      </div>
    </>
  )
}

Accordion.defaultProps = {
  multiple: false
}

// ===================================================================== Export
export default Accordion
