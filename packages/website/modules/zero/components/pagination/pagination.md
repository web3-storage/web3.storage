# Pagination Component

Paginates an array of strings or an array of objects.

## Usage
`import Pagination from 'ZeroComponents/pagination/pagination'`

### Paginating String or Object Arrays
```
const data = ['Janet Cora', 'Henry Peppermint', ...]
```

OR

```
const data = [
  { firstname: 'Janet', lastname: 'Cora' }, 
  { firstname: 'Henry', lastname: 'Peppermint' }, 
  ...
]
```

```
<Pagination
  items={data}
  itemsPerPage={5}
  visiblePages={2}
  defaultPage={2}
  queryParam="page"
  onChange={names => console.log(names)}
/>
```

## Params

### className
Add additional classes to the **.Pagination** element   
**type:** `string`  

### items
An array of data to be filtered  
**type:** `string[]` | `object[]`  

### itemsPerPage
Number of items to display per page  
**type:** `integer`  

### visiblePages
Number of page numbers to display before and after the currently selected page
**type:** `integer`  

### defaultPage
The default page to navigate to on page load  
**type:** `integer`   
**default:** `1`  

### value
The default value of the search field  
**type:** `string`  

### queryParam
The name of the identifier of the query param to be displayed in the URL bar. If not set, no query string is written to or read from the URL  
**type:** `string`  

### onChange
Returns an array of paginated data   
**type:** `function`  
**returns:** `string[]` | `object[]`   
