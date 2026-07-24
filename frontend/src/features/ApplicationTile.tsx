import { useDraggable } from '@dnd-kit/core'
import type { Application } from './types'

export default function ApplicationTile({ application }: { application: Application }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: application.id,
    data: { status: application.status },
  })

  return (
    <article
      ref={setNodeRef}
      className="application-tile"
      {...listeners}
      {...attributes}
    >
      <h3 className="application-tile__company">{application.company}</h3>
      <p className="application-tile__role">{application.role}</p>
    </article>
  )
}