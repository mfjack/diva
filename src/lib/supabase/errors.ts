export const DATABASE_ERROR_CODES = {
  exclusionViolation: "23P01",
  ruleViolation: "P0001",
  notFound: "P0002",
} as const;

type DatabaseErrorCode =
  (typeof DATABASE_ERROR_CODES)[keyof typeof DATABASE_ERROR_CODES];

type DatabaseError = {
  code?: string;
  message?: string;
};

export function hasDatabaseErrorCode(
  error: DatabaseError | null,
  code: DatabaseErrorCode,
): boolean {
  return error?.code === code;
}

export function assertNoDatabaseError(error: DatabaseError | null): void {
  if (error) throw new Error(error.message ?? "Database request failed.");
}
