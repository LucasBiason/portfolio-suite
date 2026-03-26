import { prisma } from '../config/prisma';

type ModelWithOrder = {
  id: string;
  order: number;
  userId: string;
};

/**
 * Reorders records when saving a new or updated record with an `order` field.
 *
 * When the new order conflicts with an existing record, adjacent records are
 * shifted to make room:
 * - For a new record: all records with order >= newOrder are incremented by 1.
 * - For an existing record moving up: records between [newOrder, oldOrder-1] are incremented.
 * - For an existing record moving down: records between [oldOrder+1, newOrder] are decremented.
 *
 * Supported models: Project, CareerEntry, StackDetail, Category, Domain,
 * Service, ContactInfo, Education, ProjectImage (uses projectId instead of userId).
 *
 * @param model - Prisma model name (e.g. "project", "careerEntry").
 * @param scopeField - The field that scopes the ordering (e.g. "userId", "projectId").
 * @param scopeValue - The value of the scope field (e.g. the user's id).
 * @param newOrder - The desired order position for the record being saved.
 * @param existingId - The id of the record being updated; omit when inserting.
 * @returns Resolves when the reordering operations are complete.
 * @throws Error when the model is not found on the Prisma client.
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
