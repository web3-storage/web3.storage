import { createContext, useEffect, useReducer } from 'react'
import { useQuery } from 'react-query'
import { getInfo } from '../lib/api'
import { useLoggedIn } from '../lib/user'

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

export const AppContext = createContext(initialState)

/**
 * @param {Object} props
 * @param {JSX.Element} [props.children]
 */
const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { isLoggedIn } = useLoggedIn()
  const { data } = useQuery('get-info', getInfo, {
    enabled: isLoggedIn
  })
  
  useEffect(() => dispatch({ type: 'updateUser', payload: data }), [data])

  return (
    <AppContext.Provider value={state}>
      { children }
    </AppContext.Provider>
  )
}

export default StateProvider
