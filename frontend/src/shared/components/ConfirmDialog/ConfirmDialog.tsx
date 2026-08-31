import { useEffect, useId } from 'react'
import ActionErrorBanner from '@/shared/components/ActionErrorBanner/ActionErrorBanner'
import './ConfirmDialog.css'

type ConfirmDialogProps = {
  title: string
  body: string
  confirmLabel: string
  cancelLabel?: string
  busyLabel?: string
  isBusy?: boolean
  error?: string | null
  onDismissError?: () => void
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  busyLabel = 'Working…',
  isBusy = false,
  error = null,
  onDismissError,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isBusy) onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isBusy, onCancel])

  function handleBackdropClick() {
    if (isBusy) return
    onCancel()
  }

  return (
    <div className="confirm-dialog-backdrop" onClick={handleBackdropClick}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="confirm-dialog__title">
          {title}
        </h2>
        <p className="confirm-dialog__body">{body}</p>
        {error ? (
          <ActionErrorBanner message={error} onDismiss={onDismissError} />
        ) : null}
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="confirm-dialog__cancel"
            onClick={onCancel}
            disabled={isBusy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="confirm-dialog__confirm"
            onClick={onConfirm}
            disabled={isBusy}
            aria-busy={isBusy}
          >
            {isBusy ? (
              <>
                <span className="confirm-dialog__spinner" aria-hidden="true" />
                {busyLabel}
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
