# Searchbar Component

An input component with focus-managed styles

## Usage
`import Searchbar from 'ZeroComponents/searchbar/searchbar'`

```
<SearchBar
  value="initial search"
  placeholder="Enter a search term"
  icon={<SearchIcon />}
  onChange={query => console.log(query)}
/>
```

## Params

### className
Add additional classes to the **.Sortable** element   
**type:** `string`  

### icon
Displays an icon in the search bar  
**type:** `ReactComponent`  

### value
The default value of the search field  
**type:** `string`

### placeholder
The placeholder value of the search field   
**type:** `string`  

### onChange
Returns the search query 
**type:** `function`  
**returns:** `string`   
