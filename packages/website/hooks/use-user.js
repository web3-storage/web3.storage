import { useQuery } from 'react-query'
import { useLoggedIn } from 'Lib/user'
import { getInfo } from 'Lib/api'

export const useUser = () => {
  const { isLoggedIn } = useLoggedIn()
  const { data } = useQuery('get-info', getInfo, {
    enabled: isLoggedIn
  })
  return data
}