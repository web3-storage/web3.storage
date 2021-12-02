
import React, { useCallback, useState } from "react";
import Button from 'ZeroComponents/button/button';
import Sortable, { SortType, SortDirection } from 'ZeroComponents/sortable/sortable';
import Pagination from 'ZeroComponents/pagination/pagination';


export default function Test() {
  // const data = ['Janet', 'Henry', 'Bob Ross', 'Biblo Baggins', 'Charlie Horse', 'Suzy', 'Chaucer'];
  const data = [
    { firstname: 'Janet', lastname: 'Cora' }, 
    { firstname: 'Henry', lastname: 'Peppermint' }, 
    { firstname: 'Bob', lastname: 'Ross' }, 
    { firstname: 'Biblo', lastname: 'Baggins' }, 
    { firstname: 'Charlie', lastname: 'Horse' }, 
    { firstname: 'Suzy', lastname: 'Chaucer' }
  ]

  const [names, setNames] = useState(data);

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

  const handlePageChange = useCallback((a) => {
    console.log(a)
  }, [])


  return (
    <>
    {names && names.map((name, i) => <Button key={`btn-${i}`}>{name.firstname} {name.lastname}</Button>)}
   
    Sortable here!
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
      Pagination here!
      <Pagination
        items={names}
        itemsPerPage={2}
        visiblePages={1}
        onChange={handlePageChange}
      />
    </>
  );
}
