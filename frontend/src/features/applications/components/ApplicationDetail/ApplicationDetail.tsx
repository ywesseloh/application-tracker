import { useEffect, useState } from 'react'
import type { Application } from '@/features/applications/model/types'
import { STATUS_LABELS } from '@/features/applications/model/types'
import { useApplications } from '@/features/applications/hooks/useApplications'
import './ApplicationDetail.css'

type ApplicationDetailProps = {
  application: Application | null
  onClose: () => void
  onEdit: () => void
}

export default function ApplicationDetail({
  application,
  onClose,
  onEdit,
}: ApplicationDetailProps) {
  const { deleteMutation } = useApplications()
  const [error, setError] = useState<string | null>(null)
  const isDeleting =
    deleteMutation.isPending &&
    application !== null &&
    deleteMutation.variables === application.id

  useEffect(() => {
    if (!application) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [application, onClose])

  useEffect(() => {
    setError(null)
  }, [application?.id])

  if (!application) return null

  const notes = application.notes ?? ''
  const jobPostingUrl = application.jobPostingUrl ?? ''
  const hasNotes = notes.trim().length > 0
  const hasUrl = jobPostingUrl.trim().length > 0

  function handleClose() {
    setError(null)
    onClose()
  }

  function handleDelete() {
    if (isDeleting || !application) return

    deleteMutation.mutate(application.id, {
      onError: (err) => setError(err.message),
      onSuccess: () => {
        setError(null)
        onClose()
      },
    })
  }

  return (
    <div className="application-detail-backdrop" onClick={handleClose}>
      <div
        className="application-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-detail-title"
        onClick={(event) => event.stopPropagation()}
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
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <p className="application-detail__status">
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
          <p className="application-detail__error" role="alert">
            {error}
          </p>
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
    </div>
  )
}
