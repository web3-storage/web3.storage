import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { get } from 'lodash';

/**
 * @param {string} [param]
 * @param {string|number|null} [defaultValue]
 * @returns {[queryValue: any, setQueryValue: any] | []}
 */
export default function useQueryParams(param = '', defaultValue) {
  const { isReady, query, replace } = useRouter();
  const initialized = useRef(false);

  const setValue = useCallback(
    newValue => {
      const newQuery = { ...query, [param]: newValue };
      Object.keys(newQuery).forEach(
        key => newQuery[key] === undefined || (newQuery[key] === '' && delete newQuery[key])
      );

      replace(
        {
          query: newQuery,
        },
        undefined,
        { shallow: true }
      );
    },
    [param, query, replace]
  );

  useEffect(() => {
    if (!isReady || !!initialized.current) return;
    initialized.current = true;
  }, [isReady, param, defaultValue, query]);

  return [get(query, param, defaultValue), setValue];
}
