This component is used inside docs

- import raw file and you can specify a "region" to display
- includes highlight.js

```
import storageJsSource from '!!raw-loader!../../../node_modules/example-image-gallery/src/js/storage.js'
<CodeSnippet lang="js" src={storageJsSource} region="storeImage" />
```
