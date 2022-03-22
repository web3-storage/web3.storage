# Sortable Component

Sorts an array of strings or an array of objects based on the specified key, and order.

## Usage
`import Sortable from 'ZeroComponents/sortable/sortable'`

```
const data = [
  { firstname: 'Janet', lastname: 'Cora' }, 
  { firstname: 'Henry', lastname: 'Peppermint' }, 
  ...
]

<Sortable
  items={data}
  options={ [
    { label: 'First Name', value: 'firstname', key: 'firstname' },
    { label: 'Last Name Descending', value: 'lastname', key: 'lastname', direction: SortDirection.DESC },
    { label: 'Numeric (Newer)', value: 'numericASC', direction: SortDirection.DESC, compareFn: SortType.ALPHANUMERIC },
    { label: 'Numeric (Older)', value: 'numericDESC', direction: SortDirection.ASC, compareFn: SortType.ALPHANUMERIC }
  ]}
  value="numericASC"
  queryParam="sort"
  onChange={sortedItems => console.log(sortedItems)}
/>
```

### Custom sorting
```
const data = [
  { firstname: 'Janet', lastname: 'Cora' }, 
  { firstname: 'Henry', lastname: 'Peppermint' }, 
  ...
]

const customSort = useCallback((items, direction, key) => {
  if(direction === SortDirection.ASC) {
    items.push({firstname: 'Custom sort ASC'})
    return items
  } else if(direction === SortDirection.DESC) {
    items.push({firstname: 'Custom sort DESC'})
    return items
  }
}, [])
```

```
<Sortable
  items={data}
  options={ [
    { label: 'Custom Ascending', value: 'customASC', direction: SortDirection.ASC, compareFn: customSort },
    { label: 'Custom Descending', value: 'customDESC', direction: SortDirection.DESC, compareFn: customSort },
  ]}
  value="customDESC"
  queryParam="sort"
  onChange={sortedItems => console.log(sortedItems)}
/>
```

## Params

### className
Add additional classes to the **.Sortable** element  
**type:** `string`

### items
An array of data to be sorted  
**type:** `string[]` | `object[]`  

### options
An array of sort options  
**type:** `SortOptions[]`  

### value
The default selected **Sort Option** value  
**type:** `string`  

### queryParam
The name of the identifier of the query param to be displayed in the URL bar. If not set, no query string is written to or read from the URL  
**type:** `string`  

### onChange
Callback function  
**type:** `function`  
**returns:** `string[]` | `object[]`    

## Sort Option

### label
The dropdown item display text
**type:** `string`  

### value
The value to return on item select
**type:** `string`  

### key
The key to sort by
**type:** `string`  

### direction
The direction to order the result
**type:** `SortDirection`  

### compareFn
The function to compare and order **items**
**type:** `SortType` | `function`
