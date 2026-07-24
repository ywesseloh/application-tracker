import { useEffect, useState, type FormEvent } from 'react'
import type { ApplicationStatus } from './types'
import { STATUS_LABELS } from './types'
import './ApplicationForm.css'

export type ApplicationFormValues = {
  company: string
  role: string
  status: ApplicationStatus
  notes: string
  jobPostingUrl: string
}

type ApplicationFormProps = {
  open: boolean
  onClose: () => void
  onSubmit: (values: ApplicationFormValues) => void
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

export default function ApplicationForm({
  open,
  onClose,
  onSubmit,
}: ApplicationFormProps) {
  const [values, setValues] = useState<ApplicationFormValues>(EMPTY_VALUES)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    setValues(EMPTY_VALUES)
    setError(null)

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const company = values.company.trim()
    const role = values.role.trim()

    if (!company || !role) {
      setError('Company and role are required.')
      return
    }

    onSubmit({
      company,
      role,
      status: values.status,
      notes: values.notes.trim(),
      jobPostingUrl: values.jobPostingUrl.trim(),
    })
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
            Add application
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
              Add application
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
