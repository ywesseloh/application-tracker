import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Application } from './types'

type ApplicationTileProps = {
  application: Application
  onOpen: () => void
}

export default function ApplicationTile({ application, onOpen }: ApplicationTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
    data: { status: application.status },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`application-tile${isDragging ? ' application-tile--dragging' : ''}`}
      {...listeners}
      {...attributes}
      onClick={() => {
        if (isDragging) return
        onOpen()
      }}
    >
      <h3 className="application-tile__company">{application.company}</h3>
      <p className="application-tile__role">{application.role}</p>
    </article>
  )
}
