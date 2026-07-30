import './ApplicationForm.css'
import type { ApplicationFormValues } from './formValues'
import { useApplicationsQuery } from '../../hooks/useApplicationsQuery'
import { useUpdateApplication } from '../../hooks/useApplicationMutations'
import { useApplicationsCache } from '../../hooks/useApplicationsCache'
import { applicationMutationKeys } from '../../model/mutationKeys'
import { nextColumnPosition } from '../../model/boardOrdering'
import type { Application } from '../../model/types'
import { EMPTY_VALUES } from './formValues'
import ApplicationForm from './ApplicationForm'

type EditApplicationFormProps = {
  id: number
  onClose: () => void
}

function valuesFromApplication(application: Application): ApplicationFormValues {
  return {
    company: application.company,
    role: application.role,
    status: application.status,
    notes: application.notes ?? '',
    jobPostingUrl: application.jobPostingUrl ?? '',
  }
}

export function EditApplicationForm({
  id,
  onClose,
}: EditApplicationFormProps) { 
  const { applications } = useApplicationsQuery()
  const { updateMutation, updateMutationState } = useUpdateApplication(id)
  const { clearSettledMutations } = useApplicationsCache()

  const initialApplication = applications.find((app) => app.id === id) ?? null

  function updateApplication(values: ApplicationFormValues, success: () => void) {
    if (!initialApplication) return

    const statusChanged = initialApplication.status !== values.status
    const columnPosition = statusChanged
      ? nextColumnPosition(applications, values.status)
      : initialApplication.columnPosition

    updateMutation.mutate(
      {
        ...initialApplication,
        company: values.company,
        role: values.role,
        status: values.status,
        columnPosition,
        notes: values.notes,
        jobPostingUrl: values.jobPostingUrl,
      },
      { onSuccess: success },
    )
  }

  return <ApplicationForm
           mode={{ type: 'edit', id }} 
           initialValues={initialApplication ? valuesFromApplication(initialApplication) : EMPTY_VALUES}
           isSubmitting={updateMutationState.isPending} 
           submitError={updateMutationState.error} 
           onDismissSubmitError={() => clearSettledMutations(applicationMutationKeys.update(id))}
           onSubmit={updateApplication} 
           onClose={onClose} 
           />
}