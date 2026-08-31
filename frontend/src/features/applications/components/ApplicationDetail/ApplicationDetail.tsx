import type { Application } from '@/shared/api/types'
import { STATUS_LABELS } from '@/features/applications/model/types'
import { useDeleteApplication } from '@/features/applications/hooks/useApplicationMutations'
import { useApplicationsCache } from '@/features/applications/hooks/useApplicationsCache'
import { applicationMutationKeys } from '@/features/applications/model/mutationKeys'
import ActionErrorBanner from '@/shared/components/ActionErrorBanner/ActionErrorBanner'
import Modal from '@/shared/components/Modal/Modal'
import './ApplicationDetail.css'

type ApplicationDetailProps = {
  application: Application
  onClose: () => void
  onEdit: () => void
}

export default function ApplicationDetail({
  application,
  onClose,
  onEdit,
}: ApplicationDetailProps) {
  const { deleteMutation, deleteMutationState } = useDeleteApplication(application.id)
  const { clearSettledMutations } = useApplicationsCache()
  const { isPending: isDeleting, error } = deleteMutationState

  const notes = application.notes ?? ''
  const jobPostingUrl = application.jobPostingUrl ?? ''
  const hasNotes = notes.trim().length > 0
  const hasUrl = jobPostingUrl.trim().length > 0

  function handleDelete() {
    if (isDeleting) return
    deleteMutation.mutate(undefined, { onSuccess: onClose })
  }

  return (
    <Modal
      onClose={onClose}
      ariaLabelledBy="application-detail-title"
      size="md"
      className="application-detail"
    >
      <header className="application-detail__header">
        <div>
          <h2 id="application-detail-title" className="application-detail__company">
            {application.company}
          </h2>
          <p className="application-detail__role">{application.role}</p>
        </div>
        <button
          type="button"
          className="application-detail__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </header>

      <div className="application-detail__body">
        <p
          className={`application-detail__status application-detail__status--${application.status.toLowerCase()}`}
        >
          {STATUS_LABELS[application.status]}
        </p>

        <section className="application-detail__section">
          <h3 className="application-detail__label">Notes</h3>
          {hasNotes ? (
            <p className="application-detail__notes">{notes}</p>
          ) : (
            <p className="application-detail__empty">No notes yet.</p>
          )}
        </section>

        <section className="application-detail__section">
          <h3 className="application-detail__label">Job posting</h3>
          {hasUrl ? (
            <a
              className="application-detail__link"
              href={jobPostingUrl}
              target="_blank"
              rel="noreferrer"
            >
              {jobPostingUrl}
            </a>
          ) : (
            <p className="application-detail__empty">No job posting URL.</p>
          )}
        </section>

        {error ? (
          <ActionErrorBanner
            message={error.message}
            onDismiss={() =>
              clearSettledMutations(applicationMutationKeys.remove(application.id))
            }
          />
        ) : null}

        <div className="application-detail__actions">
          <button
            type="button"
            className="application-detail__delete"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-busy={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="application-detail__spinner" aria-hidden="true" />
                Deleting…
              </>
            ) : (
              'Delete'
            )}
          </button>
          <button
            type="button"
            className="application-detail__edit"
            onClick={onEdit}
            disabled={isDeleting}
          >
            Edit
          </button>
        </div>
      </div>
    </Modal>
  )
}
