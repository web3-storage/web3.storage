import React, { Children, useState, cloneElement } from 'react'
import clsx from 'clsx'

export default function Tabs(props) {
  const children = Children.toArray(props.children)
  const values = children.map(child => ({
    value: child.props.value,
    label: child.props.label,
  }))

  const tabRefs = []
  const initialValue = values.length > 0 ? values[0] : null
  const [selectedValue, setSelectedValue] = useState(initialValue);

  const handleTabChange = event => {
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