const HOUR_IN_MS = 60 * 60 * 1000;

function getHoursUntil(startsAt: string, now = Date.now()): number {
  return (new Date(startsAt).getTime() - now) / HOUR_IN_MS;
}

export function isLateCancellation(
  startsAt: string,
  cancellationNoticeHours: number,
  now = Date.now(),
): boolean {
  return getHoursUntil(startsAt, now) < cancellationNoticeHours;
}
