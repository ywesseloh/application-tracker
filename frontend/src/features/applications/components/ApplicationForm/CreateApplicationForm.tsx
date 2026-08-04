import './ApplicationForm.css'
import type { ApplicationFormValues } from './formValues'
import { EMPTY_VALUES } from './formValues'
import { useCreateApplication } from '../../hooks/useApplicationMutations'
import { useBoardWritesBusy } from '../../hooks/useBoardWritesBusy'
import { useApplicationsCache } from '../../hooks/useApplicationsCache'
import { applicationMutationKeys } from '../../model/mutationKeys'
import ApplicationForm from './ApplicationForm'

type CreateApplicationFormProps = {
  onClose: () => void
}

export function CreateApplicationForm({
  onClose,
}: CreateApplicationFormProps) { 
  const { createMutation, createMutationState } = useCreateApplication()
  const boardWritesBusy = useBoardWritesBusy()
  const { clearSettledMutations } = useApplicationsCache()

  function createApplication(values: ApplicationFormValues, success: () => void) {
    if (boardWritesBusy && !createMutationState.isPending) return

    createMutation.mutate(
      {
        company: values.company,
        role: values.role,
        status: values.status,
        notes: values.notes,
        jobPostingUrl: values.jobPostingUrl,
      },
      { onSuccess: success },
    )
  }

  return <ApplicationForm
           mode={{ type: 'create' }} 
           initialValues={EMPTY_VALUES}
           isSubmitting={createMutationState.isPending || boardWritesBusy} 
           submitError={createMutationState.error} 
           onDismissSubmitError={() => clearSettledMutations(applicationMutationKeys.create)}
           onSubmit={createApplication} 
           onClose={onClose} 
           />
}