import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';

// Available Actions
export enum StoreAction {
  SET_USER_DATA = 'SET_USER_DATA',
  SET_AUTHENTICATION = 'SET_AUTHENTICATION',
}

// Redux state shape
export type AppReduxState = {
  authorization?: string;
  userData: {
    firstName: string;
    lastName: string;
  } | null;
};

// Custom typed hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector: TypedUseSelectorHook<AppReduxState> = useSelector;
