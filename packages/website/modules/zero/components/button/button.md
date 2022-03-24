# Button Component

A button that supports page redirects using the React router, external links, and non-linking callback functions

## Usage
`import Button from 'ZeroComponents/button/button'`

### Router Link
```
<Button href="/">Link</Button>
```

### External Link
```
<Button href="/docs" openInNewWindow={true}>External Link</Button>
```

### Internal Callback
```
<Button onClick={() => console.log('Button clicked')}>Button</Button>
```
## Params

### className
Add additional classes to the **.Button** element  
**type:** `string`  

### onClick
Callback function  
**type:** `function`  
**args:** `-`   
**returns:** `-`

### href
Relative internal URL, or absolute external URL  
**type:** `string`  

### type
Relative internal URL, or absolute external URL   
**type:** `'button'` | `'submit'`  | `'reset'` 

### disabled
Disables the button  
**type:** `boolean`  
**default:** `false`  

### openInNewWindow
Opens the **href** in a new window/tab  
**type:** `boolean`  
**default:** `false`  

### children
Displays the internal content of the button tag  
**type:** `any`
