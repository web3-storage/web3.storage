# Tooltip Component

A basic tooltip

## Usage
```
import Tooltip from 'ZeroComponents/Tooltip/Tooltip'
import { useState } from 'react';
```

`const TooltipState = useState(false);`

```
<Tooltip content={This is example Tooltip content} />
```
## Params

### className
Add additional classes to the **.TooltipBackground** element   
**type:** `string`  

### Icon
Displays an close icon; controlled by the **TooltipState**  
**type:** `ReactComponent`  

### content
Displays the internal content of the Tooltip tag  
**type:** `any`

### position
'right' or 'left'
**type:** `string`
