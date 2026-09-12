import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
import type { FormMode } from '@/features/applications/model/types'
import type { Application } from '@/shared/api/types'
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
import ConfirmDialog from '@/shared/components/ConfirmDialog/ConfirmDialog'
import { logout } from '@/shared/api/authApi'
import { useDeleteAccount } from '@/shared/hooks/useDeleteAccount'
import ApplicationDetail from '@/features/applications/components/ApplicationDetail/ApplicationDetail'
import BoardColumn from './BoardColumn'
import TilePreview from './TilePreview'
import { EditApplicationForm } from '../ApplicationForm/EditApplicationForm'
import { CreateApplicationForm } from '../ApplicationForm/CreateApplicationForm'
import ProfileIcon from '@/assets/profile.svg?react'
import { useUserQuery } from '@/shared/hooks/useUserQuery'

export default function ApplicationBoard() {
  const queryClient = useQueryClient()
  const { applications, isPending, error, hasData, refetch } = useApplicationsQuery()
  const { applyLocalChange, snapshot, restore, pauseRefetch } = useApplicationsCache()
  const { moveMutation } = useMoveApplication()
  const boardWritesBusy = useBoardWritesBusy()
  const { error: actionError, dismiss: dismissActionError } = useApplicationActionError()
  const { 
    user, 
    isPending: isUserPending,
    hasData: hasUserData
  } = useUserQuery()
  const {
    deleteAccountMutation,
    isPending: isDeletingAccount,
    error: deleteAccountError,
    reset: resetDeleteAccount,
  } = useDeleteAccount()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<FormMode>({ type: 'closed' })
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const dragSnapshotRef = useRef<Application[] | null>(null)
  const suppressOpenRef = useRef(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  const activeApplication = applications.find((app) => app.id.toString() === activeId) ?? null
  const selectedApplication =
    applications.find((app) => app.id.toString() === selectedId) ?? null

  useEffect(() => {
    if (!menuOpen) return
    function handlePointerDown(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  function handleOpen(id: string) {
    if (suppressOpenRef.current) return
    setSelectedId(id)
  }

  function handleEditFromDetail() {
    if (!selectedApplication) return
    setFormMode({ type: 'edit', id: selectedApplication.id })
    setSelectedId(null)
  }

  function handleLogout() {
    setMenuOpen(false)
    logout()
    queryClient.clear()
  }

  function handleDeleteAccountClick() {
    setMenuOpen(false)
    resetDeleteAccount()
    setDeleteConfirmOpen(true)
  }

  const handleCancelDeleteAccount = useCallback(() => {
    if (isDeletingAccount) return
    setDeleteConfirmOpen(false)
    resetDeleteAccount()
  }, [isDeletingAccount, resetDeleteAccount])

  function handleConfirmDeleteAccount() {
    if (isDeletingAccount) return
    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => setDeleteConfirmOpen(false),
    })
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
        <div className="application-board__header-bar">
          <div className="application-board__brand">
            <h1 className="application-board__title">Job Tracker Demo</h1>
          </div>
          <div className="application-board__profile" ref={profileMenuRef}>
            <button
              type="button"
              className="application-board__profile-trigger"
              aria-label="Account"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <ProfileIcon
                className="application-board__profile-icon"
                aria-hidden="true"
              />

              {isUserPending ? (
              <>
                Loading…
              </>
              ) : user != undefined ? (
                user.username
              ): null}
            </button>
            {menuOpen ? (
              <div className="application-board__profile-menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="application-board__profile-menu-item"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="application-board__profile-menu-item application-board__profile-menu-item--danger"
                  onClick={handleDeleteAccountClick}
                >
                  Delete Account
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {actionError ? (
        <ActionErrorBanner message={actionError} onDismiss={dismissActionError} />
      ) : null}

      {showLoading ? (
        <div className="application-board__viewport-state" role="status" aria-live="polite">
          <span className="application-board__loader" aria-hidden="true" />
          <p className="application-board__status">Loading applications…</p>
        </div>
      ) : null}

      {showLoadError ? (
        <div className="application-board__viewport-state" role="alert">
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
                  onAdd={(columnStatus) =>
                    setFormMode({ type: 'create', status: columnStatus })
                  }
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
          initialStatus={formMode.status}
          onClose={() => setFormMode({ type: 'closed' })}
        />
      ) : null}

      {formMode.type === 'edit' ? (
        <EditApplicationForm
          id={formMode.id}
          onClose={() => setFormMode({ type: 'closed' })}
        />
      ) : null}

      {deleteConfirmOpen ? (
        <ConfirmDialog
          title="Delete account"
          body="This permanently deletes your account and all applications. This cannot be undone."
          confirmLabel="Delete account"
          busyLabel="Deleting…"
          isBusy={isDeletingAccount}
          error={deleteAccountError?.message ?? null}
          onDismissError={resetDeleteAccount}
          onCancel={handleCancelDeleteAccount}
          onConfirm={handleConfirmDeleteAccount}
        />
      ) : null}
    </div>
  )
}
