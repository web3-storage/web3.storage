import React, { createContext, useState, useCallback, useEffect, useMemo, useContext } from 'react';

const TAB_CHOICE_PREFIX = 'web3storage.tab.';

/**
 * @typedef {object} ContextValue
 * @property {boolean} ready - True if tab choices have been restored from storage
 * @property {Record<string, string>} tabGroupChoices - A map of `groupId` to the chosen tab `value`
 * @property {(groupId: string, value: string) => void} setTabGroupChoice - Set the tab `value` for a given `groupId`
 */

/** @type {ContextValue} */
const initialValue = {
  ready: false,
  tabGroupChoices: {},
  setTabGroupChoice: () => {},
};

const TabGroupContext = createContext(initialValue);

/**
 * Stores the chosen `value` for a given tab `groupId` in local storage. Browser only.
 */
function storeTabGroupChoice(groupId, value) {
  if (typeof window === 'undefined') {
    console.error('localStorage is not available during server rendering');
    return;
  }
  const key = `${TAB_CHOICE_PREFIX}${groupId}`;
  window.localStorage.setItem(key, value);
}

/**
 * Loads all tab group choices from local storage. Browser only.
 * @returns {Record<string, string>}
 */
function getAllTabGroupChoices() {
  if (typeof window === 'undefined') {
    console.error('localStorage is not available during server rendering');
    return {};
  }
  const storage = window.localStorage;

  /** @type {Record<string, string>} */
  const choices = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key?.startsWith(TAB_CHOICE_PREFIX)) {
      continue;
    }
    const groupId = key.substring(TAB_CHOICE_PREFIX.length);
    choices[groupId] = storage.getItem(key) || '';
  }

  return choices;
}

/**
 * @returns {ContextValue}
 */
function useContextValue() {
  const [ready, setReady] = useState(false);
  const [tabGroupChoices, setChoices] = useState(/** @type {Record<string, string>} */ {});
  const setChoiceSyncWithLocalStorage = useCallback((groupId, value) => {
    storeTabGroupChoice(groupId, value);
  }, []);

  useEffect(() => {
    try {
      const choices = getAllTabGroupChoices();
      setChoices(choices);
      console.log('tab choices ready:', choices);
    } catch (err) {
      console.error('error loading tab choices from local storage:', err);
    }

    setReady(true);
  }, []);

  const setTabGroupChoice = useCallback(
    (groupId, value) => {
      setChoices(oldChoices => ({ ...oldChoices, [groupId]: value }));
      setChoiceSyncWithLocalStorage(groupId, value);
    },
    [setChoiceSyncWithLocalStorage]
  );

  return useMemo(() => ({ ready, tabGroupChoices, setTabGroupChoice }), [ready, tabGroupChoices, setTabGroupChoice]);
}

export function TabGroupChoiceProvider({ children }) {
  const value = useContextValue();
  return <TabGroupContext.Provider value={value}>{children}</TabGroupContext.Provider>;
}

/**
 * @returns {ContextValue}
 */
export function useTabGroupChoices() {
  const context = useContext(TabGroupContext);
  if (context == null) {
    throw new Error(`Hook useTabGroupChoice was called outside the provider <TabGroupChoiceProvider />`);
  }
  return context;
}
