import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logout } from '@/shared/api/authApi'
import { deleteUser } from '@/shared/api/userApi'

const deleteAccountMutationKey = ['user', 'delete'] as const

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  const deleteAccountMutation = useMutation({
    mutationKey: deleteAccountMutationKey,
    mutationFn: deleteUser,
    onSuccess: () => {
      logout()
      queryClient.clear()
    },
  })

  return {
    deleteAccountMutation,
    isPending: deleteAccountMutation.isPending,
    error: deleteAccountMutation.error,
    reset: deleteAccountMutation.reset,
  }
}
