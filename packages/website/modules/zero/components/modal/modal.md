# Modal Component

A basic pop-over modal

## Usage
```
import Modal from 'ZeroComponents/modal/modal'
import { useState } from 'react';
```

`const modalState = useState(false);`

```
<Modal modalState={modalState}>
  This is example modal content
</Modal>
```
## Params

### className
Add additional classes to the **.modalBackground** element   
**type:** `string`  

### modalState
Controls the modal state within the component  
**type:** `React.Dispatch<React.SetStateAction<boolean>]`

### showCloseButton
Shows a close button for the modal  
**type:** `boolean`  
**default:** `true`  

### closeIcon
Displays an close icon; controlled by the **modalState**  
**type:** `ReactComponent`  

### children
Displays the internal content of the Modal tag  
**type:** `any`


### animation
https://tympanus.net/Development/DialogEffects/ken.html
options: 'ken'
default: 'don'
**type:** `string`
