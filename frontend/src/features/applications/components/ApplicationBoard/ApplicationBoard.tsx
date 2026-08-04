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
import type { Application, FormMode } from '@/features/applications/model/types'
import {
  STATUSES,
  applicationsForStatus,
  moveBetweenColumns,
  reorderWithinColumn,
} from '@/features/applications/model/boardOrdering'
import { useApplicationsQuery } from '@/features/applications/hooks/useApplicationsQuery'
import { useApplicationsCache } from '@/features/applications/hooks/useApplicationsCache'
import { useMoveApplication } from '@/features/applications/hooks/useApplicationMutations'
import { useBoardWritesBusy } from '@/features/applications/hooks/useBoardWritesBusy'
import { useApplicationActionError } from '@/features/applications/hooks/useApplicationActionError'
import ActionErrorBanner from '@/shared/components/ActionErrorBanner/ActionErrorBanner'
import ApplicationDetail from '@/features/applications/components/ApplicationDetail/ApplicationDetail'
import BoardColumn from './BoardColumn'
import TilePreview from './TilePreview'
import { EditApplicationForm } from '../ApplicationForm/EditApplicationForm'
import { CreateApplicationForm } from '../ApplicationForm/CreateApplicationForm'

export default function ApplicationBoard() {
  const { applications, isPending, error, hasData, refetch } = useApplicationsQuery()
  const { applyLocalChange, snapshot, restore, pauseRefetch } = useApplicationsCache()
  const { moveMutation } = useMoveApplication()
  const boardWritesBusy = useBoardWritesBusy()
  const { error: actionError, dismiss: dismissActionError } = useApplicationActionError()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<FormMode>({ type: 'closed' })
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
    setFormMode({ type: 'edit', id: selectedApplication.id })
    setSelectedId(null)
  }

  function handleDragStart(event: DragStartEvent) {
    if (boardWritesBusy) return

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

    const application = next.find((app) => app.id.toString() === active.id)
    const previous = before.find((app) => app.id.toString() === active.id)
    if (
      !application ||
      !previous ||
      (previous.status === application.status &&
        previous.columnPosition === application.columnPosition)
    ) {
      return
    }

    moveMutation.mutate(
      {
        id: application.id,
        status: application.status,
        columnPosition: application.columnPosition,
      },
      { onError: () => restore(before) },
    )
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
                {error.message}
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
          onClick={() => setFormMode({ type: 'create' })}
          disabled={!hasData || boardWritesBusy}
        >
          Add application
        </button>
      </header>

      {actionError ? (
        <ActionErrorBanner message={actionError} onDismiss={dismissActionError} />
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
          {selectedApplication ? ( 
          <ApplicationDetail
            application={selectedApplication}
            onClose={() => setSelectedId(null)}
            onEdit={handleEditFromDetail}
          />) : null}
           </>
      ) : null}

      {formMode.type === 'create' ? (
        <CreateApplicationForm
          onClose={() => setFormMode({ type: 'closed' })}
        />
      ) : null}

      {formMode.type === 'edit' ? (
        <EditApplicationForm
          id={formMode.id}
          onClose={() => setFormMode({ type: 'closed' })}
        />
      ) : null}
    </div>
  )
}
