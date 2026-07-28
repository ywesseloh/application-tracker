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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import './ApplicationBoard.css'
import type { Application, ApplicationStatus } from './types'
import { STATUS_LABELS } from './types'
import {
  applicationsQueryKey,
  createApplication,
  deleteApplication,
  fetchApplications,
  patchApplications,
  updateApplication,
  type ApplicationInput,
  type ApplicationPositionPatch,
} from './applicationsApi'
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

function isStatus(id: string): id is ApplicationStatus {
  return STATUSES.includes(id as ApplicationStatus)
}

function findContainer(
  id: string,
  applications: Application[],
): ApplicationStatus | undefined {
  if (isStatus(id)) return id
  return applications.find((app) => app.id.toString() === id)?.status
}

function withDensePositions(items: Application[]): Application[] {
  return items.map((app, index) =>
    app.columnPosition === index ? app : { ...app, columnPosition: index },
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
    groups[status].sort((a, b) => a.columnPosition - b.columnPosition)
  }

  return groups
}

function applicationsForStatus(
  applications: Application[],
  status: ApplicationStatus,
): Application[] {
  return applications
    .filter((app) => app.status === status)
    .sort((a, b) => a.columnPosition - b.columnPosition)
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

  const activeIndex = groups[activeContainer].findIndex((app) => app.id.toString() === activeItemId)
  if (activeIndex === -1) return applications

  const [moved] = groups[activeContainer].splice(activeIndex, 1)
  const nextItem: Application = { ...moved, status: overContainer }

  if (isStatus(overId)) {
    groups[overContainer].push(nextItem)
  } else {
    const overIndex = groups[overContainer].findIndex((app) => app.id.toString() === overId)
    if (overIndex === -1) {
      groups[overContainer].push(nextItem)
    } else {
      groups[overContainer].splice(overIndex, 0, nextItem)
    }
  }

  return rebuildByStatus(groups)
}

function changedPositions(
  before: Application[],
  after: Application[],
): ApplicationPositionPatch[] {
  const beforeById = new Map(before.map((app) => [app.id, app]))

  return after.filter((app) => {
    const previous = beforeById.get(app.id)
    if (!previous) return false
    return (
      previous.status !== app.status ||
      previous.columnPosition !== app.columnPosition
    )
  })
}

export default function ApplicationBoard() {
  const queryClient = useQueryClient()

  const { isPending, error, data } = useQuery({
    queryKey: applicationsQueryKey,
    queryFn: fetchApplications,
  })

  const applications = data ?? []

  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formApplication, setFormApplication] = useState<Application | null | undefined>(
    undefined,
  )
  const dragSnapshotRef = useRef<Application[] | null>(null)
  const suppressOpenRef = useRef(false)

  function invalidateApplications() {
    return queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
  }

  function updateCache(
    updater: (applications: Application[]) => Application[],
  ): Application[] {
    return (
      queryClient.setQueryData<Application[]>(applicationsQueryKey, (prev) =>
        updater(prev ?? []),
      ) ?? []
    )
  }

  const patchMutation = useMutation({
    mutationFn: patchApplications,
    onSettled: invalidateApplications,
  })

  const createMutation = useMutation({
    mutationFn: createApplication,
    onSettled: invalidateApplications,
  })

  const updateMutation = useMutation({
    mutationFn: updateApplication,
    onSettled: invalidateApplications,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSettled: invalidateApplications,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  const activeApplication = applications.find((app) => app.id.toString() === activeId) ?? null
  const selectedApplication =
    applications.find((app) => app.id.toString() === selectedId) ?? null

  function handleOpen(id: string) {
    if (suppressOpenRef.current) return
    setSelectedId(id)
  }

  function handleEditFromDetail() {
    if (!selectedApplication) return
    setFormApplication(selectedApplication)
    setSelectedId(null)
  }

  function handleDelete() {
    if (!selectedApplication) return
    deleteMutation.mutate(selectedApplication.id)
    setSelectedId(null)
  }

  function handleSave(values: ApplicationFormValues) {
    if (formApplication === undefined) return

    setFormApplication(undefined)

    if (formApplication === null) {
      const application: ApplicationInput = {
        company: values.company,
        role: values.role,
        status: values.status,
        columnPosition: applications.filter((app) => app.status === values.status)
          .length,
        notes: values.notes,
        jobPostingUrl: values.jobPostingUrl,
      }
      createMutation.mutate(application)
      return
    }

    const statusChanged = formApplication.status !== values.status
    const columnPosition = statusChanged
      ? applications.filter((app) => app.status === values.status).length
      : formApplication.columnPosition

    updateMutation.mutate({
      ...formApplication,
      company: values.company,
      role: values.role,
      status: values.status,
      columnPosition,
      notes: values.notes,
      jobPostingUrl: values.jobPostingUrl,
    })
  }

  function handleDragStart(event: DragStartEvent) {
    suppressOpenRef.current = true
    setActiveId(String(event.active.id))
    queryClient.cancelQueries({ queryKey: applicationsQueryKey })
    dragSnapshotRef.current = applications.map((app) => ({ ...app }))
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeItemId = String(active.id)
    const overId = String(over.id)

    updateCache((prev) => {
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
    requestAnimationFrame(() => {
      suppressOpenRef.current = false
    })

    const snapshot = dragSnapshotRef.current
    dragSnapshotRef.current = null

    if (!over) return

    const activeItemId = String(active.id)
    const overId = String(over.id)

    const next = updateCache((prev) => {
      const activeContainer = findContainer(activeItemId, prev)
      const overContainer = findContainer(overId, prev)

      if (!activeContainer || !overContainer) return prev
      if (activeContainer !== overContainer) return prev
      if (isStatus(overId)) return prev

      const groups = groupByStatus(prev)
      const activeIndex = groups[activeContainer].findIndex((app) => app.id.toString() === activeItemId)
      const overIndex = groups[overContainer].findIndex((app) => app.id.toString() === overId)

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

    if (!snapshot) return

    const changed = changedPositions(snapshot, next)
    if (changed.length > 0) {
      patchMutation.mutate(changed)
    }
  }

  function handleDragCancel() {
    const snapshot = dragSnapshotRef.current
    if (snapshot) {
      updateCache(() => snapshot)
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
          {isPending ? (
            <p className="application-board__status">Loading applications…</p>
          ) : null}
          {error ? (
            <p className="application-board__status application-board__status--error">
              Failed to load applications.
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="application-board__add"
          onClick={() => setFormApplication(null)}
          disabled={isPending}
        >
          Add application
        </button>
      </header>

      {!isPending && !error ? (
        <>
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
            onEdit={handleEditFromDetail}
            onDelete={handleDelete}
          />
        </>
      ) : null}

      <ApplicationForm
        open={formApplication !== undefined}
        initialApplication={formApplication ?? null}
        onClose={() => setFormApplication(undefined)}
        onSubmit={handleSave}
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

function TilePreview({ application }: { application: Application }) {
  return (
    <article className="application-tile application-tile--overlay">
      <h3 className="application-tile__company">{application.company}</h3>
      <p className="application-tile__role">{application.role}</p>
    </article>
  )
}
