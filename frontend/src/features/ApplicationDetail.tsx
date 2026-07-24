import { useEffect } from 'react'
import type { Application } from './types'
import { STATUS_LABELS } from './types'
import './ApplicationDetail.css'

type ApplicationDetailProps = {
  application: Application | null
  onClose: () => void
}

export default function ApplicationDetail({
  application,
  onClose,
}: ApplicationDetailProps) {
  useEffect(() => {
    if (!application) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [application, onClose])

  if (!application) return null

  const hasNotes = application.notes.trim().length > 0
  const hasUrl = application.jobPostingUrl.trim().length > 0

  return (
    <div className="application-detail-backdrop" onClick={onClose}>
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
            onClick={onClose}
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
            <p className="application-detail__notes">{application.notes}</p>
          ) : (
            <p className="application-detail__empty">No notes yet.</p>
          )}
        </section>

        <section className="application-detail__section">
          <h3 className="application-detail__label">Job posting</h3>
          {hasUrl ? (
            <a
              className="application-detail__link"
              href={application.jobPostingUrl}
              target="_blank"
              rel="noreferrer"
            >
              {application.jobPostingUrl}
            </a>
          ) : (
            <p className="application-detail__empty">No job posting URL.</p>
          )}
        </section>
      </div>
    </div>
  )
}
