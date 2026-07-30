import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import type { Application, ApplicationStatus, FormMode } from '@/features/applications/model/types'
import { STATUS_LABELS } from '@/features/applications/model/types'
import './ApplicationForm.css'
import { useApplicationsQuery } from '../../hooks/useApplicationsQuery'
import {
  useCreateApplication,
  useUpdateApplication,
} from '../../hooks/useApplicationMutations'
import { useApplicationMutationState } from '../../hooks/useApplicationBusy'
import { nextColumnPosition } from '../../model/boardOrdering'

type ApplicationFormValues = {
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
  const { applications } = useApplicationsQuery()
  const editingId = mode.type === 'edit' ? mode.id : null
  const createMutation = useCreateApplication()
  const updateMutation = useUpdateApplication(editingId)
  const updateState = useApplicationMutationState(editingId, 'update')

  const [values, setValues] = useState<ApplicationFormValues>(EMPTY_VALUES)
  const [validationError, setValidationError] = useState<string | null>(null)

  const initialApplication =
    editingId === null
      ? null
      : applications.find((app) => app.id === editingId) ?? null
  const isSubmitting = createMutation.isPending || updateState.isPending
  const submitError = createMutation.error ?? updateState.error
  const error = validationError ?? submitError?.message ?? null

  // A refetch replaces the application object, so read it through a ref: the
  // form must reset when the edit target changes, not when its identity does.
  const initialApplicationRef = useRef(initialApplication)
  initialApplicationRef.current = initialApplication

  useEffect(() => {
    if (!open) return

    const current = initialApplicationRef.current
    setValues(current ? valuesFromApplication(current) : EMPTY_VALUES)
    setValidationError(null)
    createMutation.reset()
  }, [open, editingId, createMutation.reset])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

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

    switch (mode.type) {
      case 'create':
        createApplication()
        break
      case 'edit':
        updateApplication()
        break
    }
  }

  function createApplication() {
    createMutation.mutate(
      {
        company: values.company,
        role: values.role,
        status: values.status,
        columnPosition: nextColumnPosition(applications, values.status),
        notes: values.notes,
        jobPostingUrl: values.jobPostingUrl,
      },
      { onSuccess: handleClose },
    )
  }

  function updateApplication() {
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
      { onSuccess: handleClose },
    )
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

          {error ? <p className="application-form__error"  role="alert">{error}</p> : null}

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
