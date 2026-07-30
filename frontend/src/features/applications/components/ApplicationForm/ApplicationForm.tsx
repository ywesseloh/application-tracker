import { useEffect, useState, type SubmitEvent } from 'react'
import type { ApplicationStatus, FormMode } from '@/features/applications/model/types'
import type { ApplicationFormValues } from './formValues'
import { STATUS_LABELS } from '@/features/applications/model/types'
import './ApplicationForm.css'
import ActionErrorBanner from '@/shared/components/ActionErrorBanner/ActionErrorBanner'

type ApplicationFormProps = {
  mode: FormMode
  initialValues: ApplicationFormValues
  isSubmitting: boolean
  submitError: Error | null
  onDismissSubmitError: () => void
  onSubmit: (values: ApplicationFormValues, success: () => void) => void
  onClose: () => void
}

const STATUS_OPTIONS = Object.entries(STATUS_LABELS) as [
  ApplicationStatus,
  string,
][]

export default function ApplicationForm({
  mode,
  initialValues,
  isSubmitting,
  submitError,
  onDismissSubmitError,
  onSubmit,
  onClose,
}: ApplicationFormProps) {

  const [values, setValues] = useState<ApplicationFormValues>(initialValues)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleClose() {
    onClose()
    setValidationError(null)
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const company = values.company.trim()
    const role = values.role.trim()

    if (!company || !role) {
      setValidationError('Company and role are required.')
      return
    }

    onSubmit(values, () => {
      handleClose()
    })
  }

  function updateField<K extends keyof ApplicationFormValues>(
    key: K,
    value: ApplicationFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (validationError) setValidationError(null)
  }

  return (
    <div className="application-form-backdrop" onClick={handleClose}>
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
            onClick={handleClose}
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

          {validationError ? (
            <ActionErrorBanner message={validationError} />
          ) : null}
          {submitError ? (
            <ActionErrorBanner
              message={submitError.message}
              onDismiss={onDismissSubmitError}
            />
          ) : null}

          <div className="application-form__actions">
            <button
              type="button"
              className="application-form__button application-form__button--secondary"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="application-form__button application-form__button--primary"
            >
              {isSubmitting ? (
                <>
                  <span className="application-form__spinner" aria-hidden="true" />
                  Saving…
                </>
              ) : mode.type === 'edit' ? (
                'Save changes'
              ) : (
                'Add application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
