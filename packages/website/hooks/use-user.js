import { useQuery } from 'react-query'
import { useLoggedIn } from '../lib/user'
import { getInfo } from '../lib/api'

export const useUser = () => {
  const { isLoggedIn } = useLoggedIn()
  const { data } = useQuery('get-info', getInfo, {
    enabled: isLoggedIn
  })
  return data
}