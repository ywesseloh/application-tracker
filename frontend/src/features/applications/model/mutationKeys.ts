export const applicationMutationKeys = {
  create: ['applications', 'create'] as const,
  reposition: ['applications', 'reposition'] as const,
  anyFor: (id: number) => ['applications', id] as const,
  update: (id: number) => ['applications', id, 'update'] as const,
  remove: (id: number) => ['applications', id, 'delete'] as const,
}

export const applicationScope = (id: number) => ({ id: `application-${id}` })

export const boardPositionsScope = { id: 'board-positions' }
