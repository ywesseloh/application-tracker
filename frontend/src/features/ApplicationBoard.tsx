import { useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import './ApplicationBoard.css'
import type { Application, ApplicationStatus } from './types'
import { STATUS_LABELS } from './types'
import ApplicationDetail from './ApplicationDetail'
import ApplicationForm, { type ApplicationFormValues } from './ApplicationForm'
import ApplicationTile from './ApplicationTile'

const STATUSES: ApplicationStatus[] = [
  'WISHLIST',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
]

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: '1',
    company: 'Acme Corp',
    role: 'Frontend Engineer',
    status: 'WISHLIST',
    position: 0,
    notes: 'Strong design culture. Reach out to Maya on LinkedIn before applying.',
    jobPostingUrl: 'https://example.com/jobs/acme-frontend',
  },
  {
    id: '2',
    company: 'Bright Labs',
    role: 'Full Stack Developer',
    status: 'APPLIED',
    position: 0,
    notes: 'Submitted via company portal. Recruiter screen scheduled for next week.',
    jobPostingUrl: 'https://example.com/jobs/bright-labs-fullstack',
  },
  {
    id: '3',
    company: 'Northwind',
    role: 'React Developer',
    status: 'APPLIED',
    position: 1,
    notes: '',
    jobPostingUrl: 'https://example.com/jobs/northwind-react',
  },
  {
    id: '4',
    company: 'Cascade Systems',
    role: 'Software Engineer',
    status: 'INTERVIEW',
    position: 0,
    notes: 'Onsite loop: system design + React take-home review.',
    jobPostingUrl: 'https://example.com/jobs/cascade-swe',
  },
  {
    id: '5',
    company: 'Helios AI',
    role: 'UI Engineer',
    status: 'OFFER',
    position: 0,
    notes: 'Verbal offer received. Waiting on written package.',
    jobPostingUrl: '',
  },
]

function isStatus(id: string): id is ApplicationStatus {
  return STATUSES.includes(id as ApplicationStatus)
}

function findContainer(
  id: string,
  applications: Application[],
): ApplicationStatus | undefined {
  if (isStatus(id)) return id
  return applications.find((app) => app.id === id)?.status
}

function withDensePositions(items: Application[]): Application[] {
  return items.map((app, index) =>
    app.position === index ? app : { ...app, position: index },
  )
}

function rebuildByStatus(
  groups: Record<ApplicationStatus, Application[]>,
): Application[] {
  return STATUSES.flatMap((status) => withDensePositions(groups[status]))
}

function groupByStatus(
  applications: Application[],
): Record<ApplicationStatus, Application[]> {
  const groups = Object.fromEntries(
    STATUSES.map((status) => [status, [] as Application[]]),
  ) as Record<ApplicationStatus, Application[]>

  for (const app of applications) {
    groups[app.status].push(app)
  }

  for (const status of STATUSES) {
    groups[status].sort((a, b) => a.position - b.position)
  }

  return groups
}

function applicationsForStatus(
  applications: Application[],
  status: ApplicationStatus,
): Application[] {
  return applications
    .filter((app) => app.status === status)
    .sort((a, b) => a.position - b.position)
}

function moveToContainer(
  applications: Application[],
  activeItemId: string,
  overId: string,
  overContainer: ApplicationStatus,
): Application[] {
  const groups = groupByStatus(applications)
  const activeContainer = findContainer(activeItemId, applications)

  if (!activeContainer) return applications

  const activeIndex = groups[activeContainer].findIndex((app) => app.id === activeItemId)
  if (activeIndex === -1) return applications

  const [moved] = groups[activeContainer].splice(activeIndex, 1)
  const nextItem: Application = { ...moved, status: overContainer }

  if (isStatus(overId)) {
    groups[overContainer].push(nextItem)
  } else {
    const overIndex = groups[overContainer].findIndex((app) => app.id === overId)
    if (overIndex === -1) {
      groups[overContainer].push(nextItem)
    } else {
      groups[overContainer].splice(overIndex, 0, nextItem)
    }
  }

  return rebuildByStatus(groups)
}

export default function ApplicationBoard() {
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const dragSnapshotRef = useRef<Application[] | null>(null)
  const suppressOpenRef = useRef(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  const activeApplication = applications.find((app) => app.id === activeId) ?? null
  const selectedApplication =
    applications.find((app) => app.id === selectedId) ?? null

  function handleOpen(id: string) {
    if (suppressOpenRef.current) return
    setSelectedId(id)
  }

  function handleCreate(values: ApplicationFormValues) {
    setApplications((prev) => {
      const position = prev.filter((app) => app.status === values.status).length
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          company: values.company,
          role: values.role,
          status: values.status,
          position,
          notes: values.notes,
          jobPostingUrl: values.jobPostingUrl,
        },
      ]
    })
    setIsCreating(false)
  }

  function handleDragStart(event: DragStartEvent) {
    suppressOpenRef.current = true
    setActiveId(String(event.active.id))
    dragSnapshotRef.current = applications.map((app) => ({ ...app }))
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeItemId = String(active.id)
    const overId = String(over.id)

    setApplications((prev) => {
      const activeContainer = findContainer(activeItemId, prev)
      const overContainer = findContainer(overId, prev)

      if (!activeContainer || !overContainer) return prev
      if (activeContainer === overContainer) return prev

      return moveToContainer(prev, activeItemId, overId, overContainer)
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    dragSnapshotRef.current = null
    requestAnimationFrame(() => {
      suppressOpenRef.current = false
    })

    if (!over) return

    const activeItemId = String(active.id)
    const overId = String(over.id)

    setApplications((prev) => {
      const activeContainer = findContainer(activeItemId, prev)
      const overContainer = findContainer(overId, prev)

      if (!activeContainer || !overContainer) return prev
      if (activeContainer !== overContainer) return prev
      if (isStatus(overId)) return prev

      const groups = groupByStatus(prev)
      const activeIndex = groups[activeContainer].findIndex((app) => app.id === activeItemId)
      const overIndex = groups[overContainer].findIndex((app) => app.id === overId)

      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
        return prev
      }

      groups[activeContainer] = arrayMove(
        groups[activeContainer],
        activeIndex,
        overIndex,
      )
      return rebuildByStatus(groups)
    })
  }

  function handleDragCancel() {
    if (dragSnapshotRef.current) {
      setApplications(dragSnapshotRef.current)
    }
    dragSnapshotRef.current = null
    setActiveId(null)
    requestAnimationFrame(() => {
      suppressOpenRef.current = false
    })
  }

  return (
    <div className="application-board">
      <header className="application-board__header">
        <div className="application-board__heading">
          <h1 className="application-board__title">Application Board</h1>
          <p className="application-board__subtitle">
            Drag to reorder within a column or move applications between columns.
          </p>
        </div>
        <button
          type="button"
          className="application-board__add"
          onClick={() => setIsCreating(true)}
        >
          Add application
        </button>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="application-board__columns">
          {STATUSES.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              applications={applicationsForStatus(applications, status)}
              onOpen={handleOpen}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeApplication ? <TilePreview application={activeApplication} /> : null}
        </DragOverlay>
      </DndContext>

      <ApplicationDetail
        application={selectedApplication}
        onClose={() => setSelectedId(null)}
      />

      <ApplicationForm
        open={isCreating}
        onClose={() => setIsCreating(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}

function BoardColumn({
  status,
  applications,
  onOpen,
}: {
  status: ApplicationStatus
  applications: Application[]
  onOpen: (id: string) => void
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
      <SortableContext
        items={applications.map((app) => app.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="board-column__list">
          {applications.map((application) => (
            <ApplicationTile
              key={application.id}
              application={application}
              onOpen={() => onOpen(application.id)}
            />
          ))}
        </div>
      </SortableContext>
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
