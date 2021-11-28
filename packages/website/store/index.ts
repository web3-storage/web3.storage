import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';

export enum StoreAction {
  SET_USER_DATA = 'SET_USER_DATA',
  SET_AUTHENTICATION = 'SET_AUTHENTICATION',
}

export type AppReduxState = {
  authorization?: string;
  userData?: {
    firstName: string;
    lastName: string;
  };
};

export const useAppDispatch = () => useDispatch();
export const useAppSelector: TypedUseSelectorHook<AppReduxState> = useSelector;
