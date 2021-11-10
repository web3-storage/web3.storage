import { createContext, useEffect, useReducer } from 'react'
import { useUser } from '../hooks/use-user'

/**
 * @typedef {{
 *   user: {
 *     info: {
 *       email: string
 *       github: string
 *       issuer: string
 *       _id: string
 *     }
 *   }
 * }} State
* */

/**
 * @typedef {{
 *   info: {
 *     email: string
 *     github: string
 *     issuer: string
 *     _id: string
 *   }
 * }} UserInfo
* */

/**
 * @typedef {{
 *   type: 'updateUser'
 *   payload: any
 * }} Action
* */

const initialState = {
  user: {
    info: {
      email: '',
      github: '',
      issuer: '',
      _id: ''
    }
  }
}

/**
 * @param {State} state
 * @param {UserInfo} userInfo
 */
const updateUser = (state, userInfo) => ({ ...state, ...{ user: userInfo }})

/**
 * @param {State} state
 * @param {Action} action
 */
const reducer = (state, action) => {
  switch (action.type) {
    case 'updateUser':
      return updateUser(state, action.payload)
    default:
      throw new Error();
  }
}

export const AppContext = createContext({ 
  state: initialState, 
  /**
   * @param {any} _dispatch
   */
  dispatch: (_dispatch) => {} 
})

/**
 * @param {Object} props
 * @param {JSX.Element} [props.children]
 */
const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // init app state with user
  const user = useUser()
  useEffect(() => dispatch({ type: 'updateUser', payload: user }), [ user ])

  return (
    <AppContext.Provider value={{ state: state, dispatch: dispatch }}>
      { children }
    </AppContext.Provider>
  )
}

export default StateProvider
