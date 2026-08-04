export const applicationMutationKeys = {
  all: ['applications'] as const,
  create: ['applications', 'create'] as const,
  reposition: ['applications', 'reposition'] as const,
  anyFor: (id: number) => ['applications', id] as const,
  update: (id: number) => ['applications', id, 'update'] as const,
  remove: (id: number) => ['applications', id, 'delete'] as const,
}

/** Serializes create, update, delete, and move so board denseness stays consistent. */
export const boardWritesScope = { id: 'board-writes' }
