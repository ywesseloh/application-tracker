import { useEffect, useState, type SubmitEvent } from 'react'
import type { Application, ApplicationStatus, FormMode } from '@/features/applications/model/types'
import { STATUS_LABELS } from '@/features/applications/model/types'
import './ApplicationForm.css'
import { useApplications } from '../../hooks/useApplications'
import { nextColumnPosition } from '../../model/boardOrdering'

export type ApplicationFormValues = {
  company: string
  role: string
  status: ApplicationStatus
  notes: string
  jobPostingUrl: string
}

type ApplicationFormProps = {
  open: boolean
  mode: FormMode
  onClose: () => void
}

const EMPTY_VALUES: ApplicationFormValues = {
  company: '',
  role: '',
  status: 'WISHLIST',
  notes: '',
  jobPostingUrl: '',
}

const STATUS_OPTIONS = Object.entries(STATUS_LABELS) as [
  ApplicationStatus,
  string,
][]

function valuesFromApplication(application: Application): ApplicationFormValues {
  return {
    company: application.company,
    role: application.role,
    status: application.status,
    notes: application.notes ?? '',
    jobPostingUrl: application.jobPostingUrl ?? '',
  }
}

export default function ApplicationForm({
  open,
  mode,
  onClose,
}: ApplicationFormProps) {
  const { applications, create, update } = useApplications()
  const [values, setValues] = useState<ApplicationFormValues>(EMPTY_VALUES)
  const [error, setError] = useState<string | null>(null)
  const initialApplication =
    mode.type === 'edit'
      ? applications.find((app) => app.id === mode.id) ?? null
      : null

  useEffect(() => {
    if (!open) return

    setValues(
      initialApplication
        ? valuesFromApplication(initialApplication)
        : EMPTY_VALUES,
    )

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, initialApplication, onClose])

  if (!open) return null

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mode.type === 'closed') return

    if (mode.type === 'create') {
      create(
        {
          company: values.company,
          role: values.role,
          status: values.status,
          columnPosition: nextColumnPosition(applications, values.status),
          notes: values.notes,
          jobPostingUrl: values.jobPostingUrl,
        },
        { onSuccess: onClose },
      )
      return
    }

    if (!initialApplication) return

    const statusChanged = initialApplication.status !== values.status
    const columnPosition = statusChanged
      ? nextColumnPosition(applications, values.status)
      : initialApplication.columnPosition

    update(
      {
        ...initialApplication,
        company: values.company,
        role: values.role,
        status: values.status,
        columnPosition,
        notes: values.notes,
        jobPostingUrl: values.jobPostingUrl,
      },
      { onSuccess: onClose },
    )
  }

  function updateField<K extends keyof ApplicationFormValues>(
    key: K,
    value: ApplicationFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (error) setError(null)
  }

  return (
    <div className="application-form-backdrop" onClick={onClose}>
      <div
        className="application-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="application-form__header">
          <h2 id="application-form-title" className="application-form__title">
            {mode.type === 'edit' ? 'Edit application' : 'Add application'}
          </h2>
          <button
            type="button"
            className="application-form__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <form className="application-form__body" onSubmit={handleSubmit}>
          <label className="application-form__field">
            <span className="application-form__label">Company</span>
            <input
              className="application-form__input"
              type="text"
              value={values.company}
              onChange={(event) => updateField('company', event.target.value)}
              autoFocus
            />
          </label>

          <label className="application-form__field">
            <span className="application-form__label">Role</span>
            <input
              className="application-form__input"
              type="text"
              value={values.role}
              onChange={(event) => updateField('role', event.target.value)}
            />
          </label>

          <label className="application-form__field">
            <span className="application-form__label">Status</span>
            <select
              className="application-form__input"
              value={values.status}
              onChange={(event) =>
                updateField('status', event.target.value as ApplicationStatus)
              }
            >
              {STATUS_OPTIONS.map(([status, label]) => (
                <option key={status} value={status}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="application-form__field">
            <span className="application-form__label">Notes</span>
            <textarea
              className="application-form__textarea"
              rows={4}
              value={values.notes}
              onChange={(event) => updateField('notes', event.target.value)}
            />
          </label>

          <label className="application-form__field">
            <span className="application-form__label">Job posting URL</span>
            <input
              className="application-form__input"
              type="url"
              value={values.jobPostingUrl}
              onChange={(event) =>
                updateField('jobPostingUrl', event.target.value)
              }
              placeholder="https://"
            />
          </label>

          {error ? <p className="application-form__error">{error}</p> : null}

          <div className="application-form__actions">
            <button
              type="button"
              className="application-form__button application-form__button--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="application-form__button application-form__button--primary"
            >
              {mode.type === 'edit' ? 'Save changes' : 'Add application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
