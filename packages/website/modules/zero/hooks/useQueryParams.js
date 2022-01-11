import { useState, useEffect, useCallback } from 'react';

/**
 * @typedef {function} useQueryParams
 * @prop {string} [param]
 * @prop {string} [defaultValue]
 */

export default function useQueryParams(param, defaultValue = null) {
  if(!param) return []

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
  }, [])

  return [queryValue, setValue]
}
