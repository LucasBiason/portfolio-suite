import { prisma } from '../config/prisma';

type ModelWithOrder = {
  id: string;
  order: number;
  userId: string;
};

/**
 * Reorders records when saving a new or updated record with an `order` field.
 *
 * When the new order conflicts with an existing record:
 * - Shifts all records with order >= newOrder up by 1
 * - If updating an existing record, closes the gap at the old position
 *
 * Supported models: Project, CareerEntry, StackDetail, Category, Domain,
 * Service, ContactInfo, Education, ProjectImage (uses projectId instead of userId).
 */
export async function reorderOnSave(
  model: string,
  scopeField: string,
  scopeValue: string,
  newOrder: number,
  existingId?: string,
): Promise<void> {
  const delegate = (prisma as Record<string, any>)[model];
  if (!delegate) {
    throw new Error(`Model "${model}" not found in Prisma client`);
  }

  const scopeWhere = { [scopeField]: scopeValue };

  // If updating, get the old order first
  let oldOrder: number | null = null;
  if (existingId) {
    const existing = await delegate.findFirst({
      where: { id: existingId, ...scopeWhere },
      select: { order: true },
    });
    if (!existing) return;
    oldOrder = existing.order;

    // If order didn't change, nothing to do
    if (oldOrder === newOrder) return;
  }

  // Check if the new order position is already taken
  const conflict = await delegate.findFirst({
    where: {
      ...scopeWhere,
      order: newOrder,
      ...(existingId ? { id: { not: existingId } } : {}),
    },
    select: { id: true },
  });

  if (!conflict) return; // No conflict, no shifting needed

  if (existingId && oldOrder !== null) {
    // Moving an existing record
    if (newOrder < oldOrder) {
      // Moving up: shift records in [newOrder, oldOrder-1] up by 1
      await delegate.updateMany({
        where: {
          ...scopeWhere,
          order: { gte: newOrder, lt: oldOrder },
          id: { not: existingId },
        },
        data: { order: { increment: 1 } },
      });
    } else {
      // Moving down: shift records in [oldOrder+1, newOrder] down by 1
      await delegate.updateMany({
        where: {
          ...scopeWhere,
          order: { gt: oldOrder, lte: newOrder },
          id: { not: existingId },
        },
        data: { order: { decrement: 1 } },
      });
    }
  } else {
    // Inserting a new record: shift all records with order >= newOrder up by 1
    await delegate.updateMany({
      where: {
        ...scopeWhere,
        order: { gte: newOrder },
      },
      data: { order: { increment: 1 } },
    });
  }
}
