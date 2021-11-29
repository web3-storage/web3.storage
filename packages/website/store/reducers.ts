import { combineReducers } from 'redux';

import { StoreAction } from 'store';

const authentication = (state = {}, action) => {
  if (action.type === StoreAction.SET_AUTHENTICATION) {
    return {
      ...state,
      ...action.payload,
    };
  }
  return state;
};

const userData = (state = {}, action) => {
  if (action.type === StoreAction.SET_USER_DATA) {
    return {
      ...state,
      ...action.payload,
    };
  }
  return state;
};

export default combineReducers({ authentication, userData });
