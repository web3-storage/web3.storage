import { useState, createContext, useEffect } from 'react'
import { useQuery } from 'react-query'
import { getInfo } from '../lib/api'
import { useLoggedIn } from '../lib/user'

/**
 * @typedef {{
  *   info: {
  *     email: string
  *     github: string
  *     issuer: string
  *     _id: string
  *   }
  * }} User
 * */

 /** @type {User} */
export const initUser = {
  info: {
    email: '',
    github: '',
    issuer: '',
    _id: ''
  }
}

export const UserContext = createContext({
  user: initUser,
  /**
   * @param {User} _user
   */
  setUser: (_user) => {}
})

/**
 * @param {Object} props
 * @param {JSX.Element} [props.children]
 */
const UserProvider = ({ children }) => {
  const [user, setUser] = useState(initUser)
  const { isLoggedIn } = useLoggedIn()
  const { data } = useQuery('get-info', getInfo, {
    enabled: isLoggedIn
  })
  useEffect(() => setUser(data), [data])
  return (
    <UserContext.Provider value={{
      user: user,
      setUser: setUser
    }}>
      { children }
    </UserContext.Provider>
  )
}

export default UserProvider
