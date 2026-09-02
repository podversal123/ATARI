import "server-only";

/**
 * Distinguishes our own deliberately-thrown validation messages (plain
 * `new Error("...")`, written to be shown to the user - e.g. "An image is
 * required.") from Prisma/DB exceptions (PrismaClientKnownRequestError and
 * similar, which are Error subclasses, not plain Error) that leak internal
 * schema/constraint details and should never reach the client verbatim
 * (security audit finding, 2026-09-02 - every mutation route was passing
 * `error.message` straight through, regardless of where it came from). The
 * real error is still logged server-side so nothing gets lost for debugging.
 */
export function safeErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.constructor === Error) return error.message;
  console.error(error);
  return fallback;
}
