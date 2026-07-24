import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import './ApplicationBoard.css'
import type { Application, ApplicationStatus } from './types'
import ApplicationTile from './ApplicationTile'

const STATUSES: ApplicationStatus[] = [
  'WISHLIST',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
]

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
}

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: '1',
    company: 'Acme Corp',
    role: 'Frontend Engineer',
    status: 'WISHLIST',
  },
  {
    id: '2',
    company: 'Bright Labs',
    role: 'Full Stack Developer',
    status: 'APPLIED',
  },
  {
    id: '3',
    company: 'Northwind',
    role: 'React Developer',
    status: 'APPLIED',
  },
  {
    id: '4',
    company: 'Cascade Systems',
    role: 'Software Engineer',
    status: 'INTERVIEW',
  },
  {
    id: '5',
    company: 'Helios AI',
    role: 'UI Engineer',
    status: 'OFFER',
  },
]

export default function ApplicationBoard() {
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  const activeApplication = applications.find((app) => app.id === activeId) ?? null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const applicationId = String(active.id)
    const overId = String(over.id)

    const nextStatus = STATUSES.includes(overId as ApplicationStatus)
      ? (overId as ApplicationStatus)
      : applications.find((app) => app.id === overId)?.status

    if (!nextStatus) return

    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId && app.status !== nextStatus
          ? { ...app, status: nextStatus }
          : app,
      ),
    )
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  return (
    <div className="application-board">
      <header className="application-board__header">
        <h1 className="application-board__title">Application Board</h1>
        <p className="application-board__subtitle">
          Drag applications between columns to update their status.
        </p>
      </header>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="application-board__columns">
          {STATUSES.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              applications={applications.filter((app) => app.status === status)}
              activeId={activeId}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeApplication ? <TilePreview application={activeApplication} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function BoardColumn({
  status,
  applications,
  activeId,
}: {
  status: ApplicationStatus
  applications: Application[]
  activeId: string | null
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <section
      ref={setNodeRef}
      className={`board-column${isOver ? ' board-column--over' : ''}`}
    >
      <header className="board-column__header">
        <h2 className="board-column__title">{STATUS_LABELS[status]}</h2>
        <span className="board-column__count">{applications.length}</span>
      </header>
      <div className="board-column__list">
        {applications.map((application) =>
          application.id === activeId ? (
            <div
              key={application.id}
              className="application-tile application-tile--placeholder"
              aria-hidden
            />
          ) : (
            <ApplicationTile key={application.id} application={application} />
          ),
        )}
      </div>
    </section>
  )
}

function TilePreview({ application }: { application: Application }) {
  return (
    <article className="application-tile application-tile--overlay">
      <h3 className="application-tile__company">{application.company}</h3>
      <p className="application-tile__role">{application.role}</p>
    </article>
  )
}
