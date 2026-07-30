import './ActionErrorBanner.css'

type ActionErrorBannerProps = {
  message: string
  onDismiss?: () => void
}

export default function ActionErrorBanner({
  message,
  onDismiss,
}: ActionErrorBannerProps) {
  return (
    <div className="action-error-banner" role="alert">
      <p className="action-error-banner__text">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          className="action-error-banner__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      ) : null}
    </div>
  )
}
