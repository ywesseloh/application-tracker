import { useQuery } from '@tanstack/react-query'
import {
  userQueryKey,
  getUser
} from '@/shared/api/userApi'

export function useUserQuery() {
  const { isPending, error, data, refetch } = useQuery({
    queryKey: userQueryKey,
    queryFn: getUser
  })

  return {
    user: data,
    isPending,
    error,
    hasData: data !== undefined,
    refetch,
  }
}