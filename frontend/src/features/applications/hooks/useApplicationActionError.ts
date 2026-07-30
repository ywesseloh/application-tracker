import { useMutationState } from '@tanstack/react-query'
import { applicationMutationKeys } from '@/features/applications/model/mutationKeys'
import { useApplicationsCache } from '@/features/applications/hooks/useApplicationsCache'

type Failure = { message: string; at: number }

/**
 * Every application mutation key starts with this segment, so one prefix
 * filter covers create, update, delete and reposition.
 */
const applicationMutations = applicationMutationKeys.all

function latestTimestamp(timestamps: number[]) {
  return timestamps.reduce((latest, at) => (at > latest ? at : latest), 0)
}

/**
 * Surfaces the most recent failure across every application mutation. Reading
 * from the mutation cache keeps the board out of the error-reporting path of
 * the dialogs, which own their own inline messages.
 */
export function useApplicationActionError() {
  const { clearSettledMutations } = useApplicationsCache()

  const failures = useMutationState({
    filters: { mutationKey: applicationMutations, status: 'error' },
    select: (mutation): Failure => ({
      message: mutation.state.error?.message ?? 'Something went wrong.',
      at: mutation.state.submittedAt,
    }),
  })

  const successes = useMutationState({
    filters: { mutationKey: applicationMutations, status: 'success' },
    select: (mutation) => mutation.state.submittedAt,
  })

  const latestFailure = failures.reduce<Failure | null>(
    (latest, failure) => (!latest || failure.at > latest.at ? failure : latest),
    null,
  )

  // A failed mutation lingers in the cache until it is garbage collected, so a
  // newer success is what marks the failure as no longer worth reporting.
  const clearedAt = latestTimestamp(successes)

  return {
    error:
      latestFailure && latestFailure.at > clearedAt ? latestFailure.message : null,
    dismiss: () => clearSettledMutations(applicationMutations),
  }
}
