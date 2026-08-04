import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Application } from '@/features/applications/model/types'
import { useApplicationBusy } from '@/features/applications/hooks/useApplicationBusy'
import { useBoardWritesBusy } from '@/features/applications/hooks/useBoardWritesBusy'

type ApplicationTileProps = {
  application: Application
  onOpen: () => void
}

export default function ApplicationTile({ application, onOpen }: ApplicationTileProps) {
  const isBusy = useApplicationBusy(application.id)
  const boardWritesBusy = useBoardWritesBusy()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id.toString(),
    data: { status: application.status },
    disabled: isBusy || boardWritesBusy,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const className = [
    'application-tile',
    isDragging ? 'application-tile--dragging' : '',
    isBusy ? 'application-tile--syncing' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={className}
      aria-busy={isBusy}
      {...listeners}
      {...attributes}
      onClick={() => {
        if (isDragging) return
        onOpen()
      }}
    >
      <h3 className="application-tile__company">{application.company}</h3>
      <p className="application-tile__role">{application.role}</p>
      {isBusy ? <span className="application-tile__spinner" aria-hidden="true" /> : null}
    </article>
  )
}
