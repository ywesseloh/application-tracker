import './ApplicationForm.css'
import type { ApplicationFormValues } from './formValues'
import { EMPTY_VALUES } from './formValues'
import { useCreateApplication } from '../../hooks/useApplicationMutations'
import { useApplicationsCache } from '../../hooks/useApplicationsCache'
import { applicationMutationKeys } from '../../model/mutationKeys'
import type { ApplicationStatus } from '../../model/types'
import ApplicationForm from './ApplicationForm'

type CreateApplicationFormProps = {
  initialStatus: ApplicationStatus
  onClose: () => void
}

export function CreateApplicationForm({
  initialStatus,
  onClose,
}: CreateApplicationFormProps) { 
  const { createMutation, createMutationState } = useCreateApplication()
  const { clearSettledMutations } = useApplicationsCache()

  function createApplication(values: ApplicationFormValues, success: () => void) {
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
           mode={{ type: 'create', status: initialStatus }} 
           initialValues={{ ...EMPTY_VALUES, status: initialStatus }}
           isSubmitting={createMutationState.isPending} 
           submitError={createMutationState.error} 
           onDismissSubmitError={() => clearSettledMutations(applicationMutationKeys.create)}
           onSubmit={createApplication} 
           onClose={onClose} 
           />
}
