import React, { createElement, useCallback } from 'react'
import useState from 'storybook-addon-state';
import Dropdown from 'ZeroComponents/dropdown/dropdown';

export default {
  title: 'Zero/Dropdown'
};

export const Default = () => {
  const [selectValue, setSelectValue] = useState('test')

  return (
    <>
      <Dropdown
        value="fourth"
        options={[
          { label: 'Option 1', value: 'first' },
          { label: 'Option 2', value: 'second' },
          { label: 'Option 3', value: 'third' },
          { label: 'Option 4', value: 'fourth' },
          { label: 'Option 5', value: 'fifth' },
          { label: 'Option 6', value: 'sixth' },
        ]}
        onChange={value => setSelectValue(value)}
      />
      <br/>
      <div>Selected: {selectValue}</div>
    </>
  )
};

