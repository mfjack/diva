import "server-only";

import { z } from "zod";
import { type ActionFailure, actionFailure } from "@/lib/action-result";
import { INVALID_FORM_MESSAGE, UNAUTHORIZED_MESSAGE } from "./errors";
import { getAuthorizedPsychologist } from "./queries";
import type { CurrentUser } from "./types";

const entityIdSchema = z.string().min(1);

type MaybePromise<TValue> = TValue | Promise<TValue>;

type AuthorizedEntityLookup<TEntity> =
  | { isFound: true; entity: TEntity; psychologist: CurrentUser }
  | { isFound: false; failure: ActionFailure };

export async function findAuthorizedEntity<TEntity>(
  entityId: string,
  findEntity: (id: string) => MaybePromise<TEntity | null | undefined>,
  notFoundMessage: string,
): Promise<AuthorizedEntityLookup<TEntity>> {
  const psychologist = await getAuthorizedPsychologist();
  if (!psychologist) {
    return { isFound: false, failure: actionFailure(UNAUTHORIZED_MESSAGE) };
  }
  const parsedId = entityIdSchema.safeParse(entityId);
  if (!parsedId.success) {
    return { isFound: false, failure: actionFailure(INVALID_FORM_MESSAGE) };
  }
  const entity = await findEntity(parsedId.data);
  if (!entity) {
    return { isFound: false, failure: actionFailure(notFoundMessage) };
  }
  return { isFound: true, entity, psychologist };
}
