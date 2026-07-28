import { arrayMove } from '@dnd-kit/sortable'
import type { Application, ApplicationStatus } from './types'

export const STATUSES: ApplicationStatus[] = [
  'WISHLIST',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
]

export function isStatus(id: string): id is ApplicationStatus {
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

function rebuildByStatus(
  groups: Record<ApplicationStatus, Application[]>,
): Application[] {
  return STATUSES.flatMap((status) => withDensePositions(groups[status]))
}

export function applicationsForStatus(
  applications: Application[],
  status: ApplicationStatus,
): Application[] {
  return applications
    .filter((app) => app.status === status)
    .sort((a, b) => a.columnPosition - b.columnPosition)
}

export function nextColumnPosition(
  applications: Application[],
  status: ApplicationStatus,
): number {
  return applications.filter((app) => app.status === status).length
}

export function moveBetweenColumns(
  applications: Application[],
  activeItemId: string,
  overId: string,
): Application[] {
  const activeContainer = findContainer(activeItemId, applications)
  const overContainer = findContainer(overId, applications)

  if (!activeContainer || !overContainer) return applications
  if (activeContainer === overContainer) return applications

  const groups = groupByStatus(applications)
  const activeIndex = groups[activeContainer].findIndex(
    (app) => app.id.toString() === activeItemId,
  )
  if (activeIndex === -1) return applications

  const [moved] = groups[activeContainer].splice(activeIndex, 1)
  const nextItem: Application = { ...moved, status: overContainer }

  const overIndex = isStatus(overId)
    ? -1
    : groups[overContainer].findIndex((app) => app.id.toString() === overId)

  if (overIndex === -1) {
    groups[overContainer].push(nextItem)
  } else {
    groups[overContainer].splice(overIndex, 0, nextItem)
  }

  return rebuildByStatus(groups)
}

export function reorderWithinColumn(
  applications: Application[],
  activeItemId: string,
  overId: string,
): Application[] {
  const activeContainer = findContainer(activeItemId, applications)
  const overContainer = findContainer(overId, applications)

  if (!activeContainer || !overContainer) return applications
  if (activeContainer !== overContainer) return applications
  if (isStatus(overId)) return applications

  const groups = groupByStatus(applications)
  const activeIndex = groups[activeContainer].findIndex(
    (app) => app.id.toString() === activeItemId,
  )
  const overIndex = groups[overContainer].findIndex(
    (app) => app.id.toString() === overId,
  )

  if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
    return applications
  }

  groups[activeContainer] = arrayMove(
    groups[activeContainer],
    activeIndex,
    overIndex,
  )
  return rebuildByStatus(groups)
}

export function changedPositions(
  before: Application[],
  after: Application[],
): Application[] {
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
