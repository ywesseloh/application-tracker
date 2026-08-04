import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Application, ApplicationStatus } from '@/features/applications/model/types'
import { STATUS_LABELS } from '@/features/applications/model/types'
import ApplicationTile from '@/features/applications/components/ApplicationTile/ApplicationTile'

type BoardColumnProps = {
  status: ApplicationStatus
  applications: Application[]
  onOpen: (id: string) => void
  onAdd: (status: ApplicationStatus) => void
}

export default function BoardColumn({
  status,
  applications,
  onOpen,
  onAdd,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <section
      ref={setNodeRef}
      className={`board-column board-column--${status.toLowerCase()}${isOver ? ' board-column--over' : ''}`}
    >
      <header className="board-column__header">
        <h2 className="board-column__title">{STATUS_LABELS[status]}</h2>
        <div className="board-column__header-actions">
          <span className="board-column__count">{applications.length}</span>
          <button
            type="button"
            className="board-column__add"
            onClick={() => onAdd(status)}
            aria-label={`Add application to ${STATUS_LABELS[status]}`}
          >
            <span className="board-column__add-icon" aria-hidden="true" />
          </button>
        </div>
      </header>
      <SortableContext
        items={applications.map((app) => app.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="board-column__list">
          {applications.map((application) => (
            <ApplicationTile
              key={application.id.toString()}
              application={application}
              onOpen={() => onOpen(application.id.toString())}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  )
}
