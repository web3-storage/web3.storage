import { StoreAction } from 'store';

export const setAuthToken = async (user?: string, password?: string) => {
  // TODO: Async method to API to get user authentication token
  const authentication = `${user}:${password}`;
  document.cookie = `authorization=${authentication}; expires=${new Date(
    Number.MAX_SAFE_INTEGER
  ).getUTCDate()}; path=/;`;

  return {
    type: StoreAction.SET_AUTHENTICATION,
    payload: { authentication },
  };
};

export const getUserData = async auth => {
  // TODO: Async method to API to get user data based off of auth token
  const userData = !!auth ? { firstName: auth.split(':')[0], lastName: auth.split(':')[1] } : '';

  return {
    type: StoreAction.SET_USER_DATA,
    payload: userData,
  };
};
