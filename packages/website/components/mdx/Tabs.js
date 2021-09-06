import React, { Children, useState, cloneElement } from 'react'
import clsx from 'clsx'

/**
 * @typedef {import('./TabItem').TabItemProps} TabItemProps
 * @typedef {import('react').FocusEvent<HTMLLIElement>} FocusEvent
 * @typedef {import('react').MouseEvent<HTMLLIElement>} MouseEvent
 * 
 * @param {object} props 
 * @param {React.Children} props.children
 * @param {string} [props.className]
 * @returns 
 */
export default function Tabs(props) {
  
  const children = /** @type {Array<React.ReactElement<TabItemProps>> } */ (Children.toArray(props.children))
  const values = children.map(child => ({
    value: child.props.value,
    label: child.props.label,
  }))

  /** @type {Array<HTMLLIElement|null>} */
  const tabRefs = []
  const initialValue = values.length > 0 ? values[0].value : null
  const [selectedValue, setSelectedValue] = useState(initialValue);

  /** @type {function(FocusEvent|MouseEvent):void} */
  const handleTabChange = (event) => {
    console.log(event)
    const selectedTab = event.currentTarget;
    const selectedTabIndex = tabRefs.indexOf(selectedTab);
    const selectedTabValue = values[selectedTabIndex].value;

    setSelectedValue(selectedTabValue);
  }

  return (
    <div className="tabs-container">
      <ul
        role="tablist"
        aria-orientation="horizontal"
        className={clsx('tags', props.className)}
       >
         {values.map(({ value, label }) => (
           <li 
             role="tab"
             key={value}
             ref={r => tabRefs.push(r)}
             onFocus={handleTabChange}
             onClick={handleTabChange}
             >
               { label ?? value }
             </li>
         ))}
       </ul>

       <div className="margin-vert--md">
          {children.map((tabItem, i) =>
            cloneElement(tabItem, {
              key: i,
              hidden: tabItem.props.value !== selectedValue,
            }),
          )}
        </div>
    </div>
  )
}