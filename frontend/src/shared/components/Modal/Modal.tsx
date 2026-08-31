import { useEffect, type ReactNode } from 'react'
import './Modal.css'

type ModalProps = {
  children: ReactNode
  onClose: () => void
  ariaLabelledBy: string
  dismissible?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export default function Modal({
  children,
  onClose,
  ariaLabelledBy,
  dismissible = true,
  size = 'md',
  className,
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && dismissible) onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dismissible, onClose])

  function handleBackdropClick() {
    if (!dismissible) return
    onClose()
  }

  const panelClassName = [
    'modal',
    size === 'sm' ? 'modal--sm' : 'modal--md',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        className={panelClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
