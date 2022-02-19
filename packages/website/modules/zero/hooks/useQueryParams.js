import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { get } from 'lodash';

/**
 * @param {string} [param]
 * @param {string|number|null} [defaultValue]
 * @returns {[queryValue: any, setQueryValue: any] | []}
 */
export default function useQueryParams(param = '', defaultValue = null) {
  const { isReady, query, replace } = useRouter();

  const [queryValue, setQueryValue] = useState(defaultValue);

  const setValue = useCallback(
    newValue => {
      replace({
        query: { ...query, [param]: newValue },
      });
      newValue !== undefined && setQueryValue(newValue);
    },
    [param, setQueryValue, query, replace]
  );

  useEffect(() => {
    if (!isReady) return;
    setQueryValue(get(query, param, defaultValue));
  }, [isReady, param, defaultValue, query]);

  return [queryValue, setValue];
}
