# Filterable Component

Filters an array of strings or an array of objects based on the specified keys.

## Usage
`import Filterable from 'ZeroComponents/filterable/filterable'`

### Filtering String Arrays
```
const data = ['Janet Cora', 'Henry Peppermint', ...]

<Filterable
  items={data}
  placeholder="Search for a user"
  queryParam="user"
  onChange={user => console.log(user)}
/>
```

### Filtering Object Arrays
```
const data = [
  { firstname: 'Janet', lastname: 'Cora' }, 
  { firstname: 'Henry', lastname: 'Peppermint' }, 
  ...
]

<Filterable
  items={data}
  filterKeys={['firstname', 'lastname']}
  placeholder="Search for a user"
  queryParam="user"
  onChange={user => console.log(user)}
/>
```

## Params

### className
Add additional classes to the **.Filterable** element  
**type:** `string`  

### items
An array of data to be filtered  
**type:** `string[]` | `object[]`  

### filterKeys
An array of key values to search when `items` is an array of objects  
**type:** `string[]`  

### value
The default value of the search field  
**type:** `string`  

### queryParam
The name of the identifier of the query param to be displayed in the URL bar. If not set, no query string is written to or read from the URL  
**type:** `string`  

### onChange
Callback function  
**type:** `function`  
**returns:** `string[]` | `object[]`   
