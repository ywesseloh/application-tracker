import { useId } from 'react'
import ActionErrorBanner from '@/shared/components/ActionErrorBanner/ActionErrorBanner'
import Modal from '@/shared/components/Modal/Modal'
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

  return (
    <Modal
      onClose={onCancel}
      ariaLabelledBy={titleId}
      dismissible={!isBusy}
      size="sm"
      className="confirm-dialog"
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
    </Modal>
  )
}
