# Dropzone Component

A customizable file uploader with single and multi-file upload support.

## Usage
`import Dropzone from 'ZeroComponents/dropzone/dropzone'`

```
<form encType="multipart/form-data" onSubmit={()=>console.log('Handle file upload'))}>
  <Dropzone
    icon={<OpenIcon />}
    dragAreaText="Drag and drop your files here"
    maxFiles={2}
    accept={'image/jpeg, image/png'}
    multiple={true}
    onChange={acceptedFiles => console.log(acceptedFiles)}
    onError={rejectedFiles => console.log(rejectedFiles)}
  />
  <Button type="submit">Upload</Button>
</form> 
```
## Params

### className
Add additional classes to the **.Dropzone** element   
**type:** `string`  

### dragAreaText
Displays upload instructions in the drag area  
**type:** `string`

### icon
Displays an icon above the **dragAreaText**  
**type:** `ReactComponent`  

### onChange
Returns an array of valid files 
**type:** `function`  
**returns:** `File[]`  

### onError
Returns an array of invalid files
**type:** `function`  
**returns:** `File[]`   
