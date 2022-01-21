import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter} from 'next/router'

/**
 * @param {string} [param]
 * @param {string|number|null} [defaultValue]
 * @returns {[queryValue: any, setQueryValue: any] | []}
 */
export default function useQueryParams(param = '', defaultValue = null) {

  const { isReady } = useRouter()

  const [queryValue, setQueryValue] = useState(defaultValue);

  const setValue = useCallback(newValue => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set(param, newValue)
    window.history.replaceState({}, '', decodeURIComponent(`${window.location.pathname}?${queryParams}`))
    newValue && setQueryValue(newValue)
  }, [param, setQueryValue])

  useEffect(() => {
    if(!isReady) return
    const queryParams = new URLSearchParams(window.location.search);
    const value = queryParams.get(param) || defaultValue
    setValue(value)
  },[isReady, setValue, param, defaultValue])

  return [queryValue, setValue]
}
