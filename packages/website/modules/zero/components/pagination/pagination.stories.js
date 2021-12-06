import React, { useCallback } from 'react'
import useState from 'storybook-addon-state'
import Button from 'ZeroComponents/button/button'
import Dropdown from 'ZeroComponents/dropdown/dropdown'
import Pagination from 'ZeroComponents/pagination/pagination'
import Sortable, { SortType, SortDirection } from 'ZeroComponents/sortable/sortable'

export default {
  title: 'Zero/Pagination'
}

const data = [
  { firstname: 'Janet', lastname: 'Cora' }, 
  { firstname: 'Henry', lastname: 'Peppermint' }, 
  { firstname: 'Bob', lastname: 'Ross' }, 
  { firstname: 'Biblo', lastname: 'Baggins' }, 
  { firstname: 'Charlie', lastname: 'Horse' }, 
  { firstname: 'Suzy', lastname: 'Chaucer' },
  { firstname: 'Jenny', lastname: 'Brown' },
  { firstname: 'Perry', lastname: 'Green' },
  { firstname: 'Chaucer', lastname: 'White' },
  { firstname: 'Paula', lastname: 'Poster' },
  { firstname: 'Irene', lastname: 'Childe' },
  { firstname: 'Yvon', lastname: 'Langley' },
  { firstname: 'Palace', lastname: 'Lockly' },
  { firstname: 'Uranda', lastname: 'Price' },
  { firstname: 'Emily', lastname: 'Saint' },
  { firstname: 'Pason', lastname: 'Pumpkin' },
  { firstname: 'Dawson', lastname: 'Flannel' },
  { firstname: 'Kevin', lastname: 'Jeptember' },
  { firstname: 'Jesse', lastname: 'August' },
]

export const Default = () => {
  const [paginatedNames, setPaginatedNames] = useState(data)

  return(
    <div style={{ display: 'flex', gap: '10rem' }}>
      <div>
        {paginatedNames && paginatedNames.map((name, i) => <Button key={`btn-${i}`}>{name.firstname} {name.lastname}</Button>)}
      </div>
      
      <Pagination
        items={data}
        itemsPerPage={2}
        visiblePages={2}
        defaultPage={5}
        onChange={(items) => setPaginatedNames(items)}
      />
    </div>
  )
}

export const ResultsPerPage = () => {
  const [paginatedNames, setPaginatedNames] = useState('paginatedNames', data)
  const [itemsPerPage, setItemsPerPage] = useState('itemsPerPage', 2)

  return (
    <div style={{ display: 'flex', gap: '10rem' }}>
      <div>
        {paginatedNames && paginatedNames.map((name, i) => <Button key={`btn-${i}`}>{name.firstname} {name.lastname}</Button>)}
      </div>

      <div>
        <Pagination
          items={data}
          itemsPerPage={itemsPerPage}
          visiblePages={2}
          defaultPage={5}
          onChange={(items) => setPaginatedNames(items)}
        />
          <br/>
        <Dropdown
          value={itemsPerPage}
          options={[
            { label: 'View 2 Results', value: '2' },
            { label: 'View 3 Results', value: '3' },
            { label: 'View 4 Results', value: '4' },
            { label: 'View 10 Results', value: '10' },
            { label: 'View 20 Results', value: '20' },
            { label: 'View 50 Results', value: '50' },
            { label: 'View 100 Results', value: '100' },
          ]}
          onChange={value => setItemsPerPage(value)}
        />
      </div>
    </div>
  )
}

export const Sorted = () => {
  const [names, setNames] = useState('names', data)
  const [paginatedNames, setPaginatedNames] = useState('paginatedNames', names)
  const [itemsPerPage, setItemsPerPage] = useState('itemsPerPage', 2)

  const handleSort = useCallback((sortedItems) => setNames(sortedItems), [])
 
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
    <div style={{ display: 'flex', gap: '10rem' }}>
      <div>
        {paginatedNames && paginatedNames.map((name, i) => <Button key={`btn-${i}`}>{name.firstname} {name.lastname}</Button>)}
      </div>

      <div>
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
          defaultIndex={2}
          onChange={handleSort}
        />
        <br/>
        <Pagination
          items={names}
          itemsPerPage={itemsPerPage}
          visiblePages={2}
          defaultPage={5}
          onChange={(items) => setPaginatedNames(items)}
        />
         <br/>
        <Dropdown
          value={itemsPerPage}
          options={[
            { label: 'View 2 Results', value: '2' },
            { label: 'View 3 Results', value: '3' },
            { label: 'View 4 Results', value: '4' },
            { label: 'View 10 Results', value: '10' },
            { label: 'View 20 Results', value: '20' },
            { label: 'View 50 Results', value: '50' },
            { label: 'View 100 Results', value: '100' },
          ]}
          onChange={value => setItemsPerPage(value)}
        />
      </div>
    </div>
  )
}
