# Hooks

## useQueryParams
Hook to manage the URL bar query param values

#### Usage
```
import useQueryParams from 'ZeroHooks/useQueryParams'
```

```
const [queryValue, setQueryValue] = useQueryParams('myParam', 'myDefaultValue)

setTimeout(() => setQueryValue('myUpdatedValue'), 2000)
```

#### Params

##### param
The name of the identifier of the query param to be displayed in the URL bar
**type:** `string` 

##### defaultValue
The default value to be displayed in the URL bar
**type:** `string` 