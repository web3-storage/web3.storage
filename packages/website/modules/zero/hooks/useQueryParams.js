import { useState, useEffect, useCallback } from 'react';

/**
 * @param {string} [param]
 * @param {string|number|null} [defaultValue]
 * @returns {[queryValue: any, setQueryValue: any] | []}
 */
export default function useQueryParams(param = '', defaultValue = null) {

  const [queryValue, setQueryValue] = useState(defaultValue);

  const setValue = useCallback(newValue => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set(param, newValue)
    window.history.replaceState({}, '', decodeURIComponent(`${window.location.pathname}?${queryParams}`))
    setQueryValue(newValue)
  }, [param])

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const value = queryParams.get(param)
    setValue(value || defaultValue)
  }, 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [])
  
  if(!param) return []

  return [queryValue, setValue]
}
