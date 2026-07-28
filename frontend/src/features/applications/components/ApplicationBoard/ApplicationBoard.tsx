import { useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import './ApplicationBoard.css'
import type { Application } from '@/features/applications/model/types'
import {
  STATUSES,
  applicationsForStatus,
  changedPositions,
  moveBetweenColumns,
  nextColumnPosition,
  reorderWithinColumn,
} from '@/features/applications/model/boardOrdering'
import { useApplications } from '@/features/applications/hooks/useApplications'
import { getErrorMessage } from '@/shared/api/apiClient'
import ApplicationDetail from '@/features/applications/components/ApplicationDetail/ApplicationDetail'
import ApplicationForm, {
  type ApplicationFormValues,
} from '@/features/applications/components/ApplicationForm/ApplicationForm'
import BoardColumn from './BoardColumn'
import TilePreview from './TilePreview'

export default function ApplicationBoard() {
  const {
    applications,
    isPending,
    error,
    hasData,
    refetch,
    actionError,
    clearActionError,
    applyLocalChange,
    snapshot,
    restore,
    pauseRefetch,
    persistPositions,
    create,
    update,
    remove,
  } = useApplications()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formApplication, setFormApplication] = useState<Application | null | undefined>(
    undefined,
  )
  const dragSnapshotRef = useRef<Application[] | null>(null)
  const suppressOpenRef = useRef(false)

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
    remove(selectedApplication.id)
    setSelectedId(null)
  }

  function handleSave(values: ApplicationFormValues) {
    if (formApplication === undefined) return

    if (formApplication === null) {
      create(
        {
          company: values.company,
          role: values.role,
          status: values.status,
          columnPosition: nextColumnPosition(applications, values.status),
          notes: values.notes,
          jobPostingUrl: values.jobPostingUrl,
        },
        {
          onSuccess: () => setFormApplication(undefined),
        },
      )
      return
    }

    const statusChanged = formApplication.status !== values.status
    const columnPosition = statusChanged
      ? nextColumnPosition(applications, values.status)
      : formApplication.columnPosition

    update(
      {
        ...formApplication,
        company: values.company,
        role: values.role,
        status: values.status,
        columnPosition,
        notes: values.notes,
        jobPostingUrl: values.jobPostingUrl,
      },
      {
        onSuccess: () => setFormApplication(undefined),
      },
    )
  }

  function handleDragStart(event: DragStartEvent) {
    suppressOpenRef.current = true
    setActiveId(String(event.active.id))
    pauseRefetch()
    dragSnapshotRef.current = snapshot()
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    applyLocalChange((prev) =>
      moveBetweenColumns(prev, String(active.id), String(over.id)),
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    requestAnimationFrame(() => {
      suppressOpenRef.current = false
    })

    const before = dragSnapshotRef.current
    dragSnapshotRef.current = null

    if (!over) return

    const next = applyLocalChange((prev) =>
      reorderWithinColumn(prev, String(active.id), String(over.id)),
    )

    if (!before) return

    const changed = changedPositions(before, next)
    if (changed.length > 0) {
      persistPositions(changed, {
        onError: () => restore(before),
      })
    }
  }

  function handleDragCancel() {
    const before = dragSnapshotRef.current
    if (before) {
      restore(before)
    }
    dragSnapshotRef.current = null
    setActiveId(null)
    requestAnimationFrame(() => {
      suppressOpenRef.current = false
    })
  }

  const showLoading = isPending && !hasData
  const showLoadError = !!error && !hasData

  return (
    <div className="application-board">
      <header className="application-board__header">
        <div className="application-board__heading">
          <h1 className="application-board__title">Application Board</h1>
          <p className="application-board__subtitle">
            Drag to reorder within a column or move applications between columns.
          </p>
          {showLoading ? (
            <p className="application-board__status">Loading applications…</p>
          ) : null}
          {showLoadError ? (
            <div className="application-board__load-error">
              <p className="application-board__status application-board__status--error">
                {getErrorMessage(error, 'Failed to load applications.')}
              </p>
              <button
                type="button"
                className="application-board__retry"
                onClick={() => void refetch()}
              >
                Retry
              </button>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="application-board__add"
          onClick={() => setFormApplication(null)}
          disabled={!hasData}
        >
          Add application
        </button>
      </header>

      {actionError ? (
        <div className="application-board__banner" role="alert">
          <p className="application-board__banner-text">{actionError}</p>
          <button
            type="button"
            className="application-board__banner-dismiss"
            onClick={clearActionError}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ) : null}

      {hasData ? (
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
