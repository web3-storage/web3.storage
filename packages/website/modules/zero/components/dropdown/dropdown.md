# Dropdown Component

A dropdown component with keyboard interaction and select support.

## Usage
`import Dropdown from 'ZeroComponents/dropdown/dropdown'`

```
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
  onChange={value => console.log(value)}
/>
```
## Params

### className
Add additional classes to the **.Dropdown** element  
**type:** `string`  

### options
An array of dropdown options  
**type:** `DropdownOptions[]`  

### value
The default selected **Dropdown Option** value  
**type:** `string`  

### scrollable
Whether or not to enable max-height support and scrolling within the dropdown  
**type:** `boolean`   
**default:** `false`  

### queryParam
The name of the identifier of the query param to be displayed in the URL bar. If not set, no query string is written to or read from the URL  
**type:** `string`  

### onChange
Callback function  
**type:** `function`    
**returns:** `string`   

### onSelectChange
Default select on change event  
**type:** `function`   
**returns:** `Event`   

## Dropdown Option

### label
The dropdown item display text
**type:** `string`  

### value
The value to return on item select
**type:** `string`  
