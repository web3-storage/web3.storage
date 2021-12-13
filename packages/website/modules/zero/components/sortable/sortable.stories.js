import React, { useCallback } from 'react'
import useState from 'storybook-addon-state'
import Sortable, { SortType, SortDirection } from 'ZeroComponents/sortable/sortable'

export default {
  title: 'Zero/Sortable'
}

export const Default = () => {
  const nameData = [
    { firstname: 'Janet', lastname: 'Cora' }, 
    { firstname: 'Henry', lastname: 'Peppermint' }, 
    { firstname: 'Bob', lastname: 'Ross' }, 
    { firstname: 'Biblo', lastname: 'Baggins' }, 
    { firstname: 'Charlie', lastname: 'Horse' }, 
    { firstname: 'Suzy', lastname: 'Chaucer' }
  ]

  const [names, setNames] = useState('namees', nameData)

  const customSort = useCallback((items, direction, key) => {
    if(direction === SortDirection.ASC) {
      items.push({firstname: 'Custom sort ASC'})
      return items
    } else if(direction === SortDirection.DESC) {
      items.push({firstname: 'Custom sort DESC'})
      return items
    }
  }, [])

  return (
    <>
      <div>
        {names && names.map((name, i) => <div key={`name-${i}`}>{name.firstname} {name.lastname}</div>)}
      </div>
      <br/>
      <Sortable
        items={names}
        options={ [
          { label: 'First Name', key: 'firstname' },
          { label: 'Last Name Descending', key: 'lastname', direction: SortDirection.DESC },
          { label: 'Numeric (Newer)', direction: SortDirection.DESC, compareFn: SortType.ALPHANUMERIC },
          { label: 'Numeric (Older)', direction: SortDirection.ASC, compareFn: SortType.ALPHANUMERIC },
          { label: 'Custom Ascending', direction: SortDirection.ASC, compareFn: customSort },
          { label: 'Custom Descending', direction: SortDirection.DESC, compareFn: customSort },
        ]}
        defaultIndex="3"
        onChange={(sortedItems) => {
          setNames(sortedItems)
        }}
      />
    </>
  )
}

