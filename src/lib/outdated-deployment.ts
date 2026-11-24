const MISSING_SERVER_ACTION_PATTERN =
  /Server Action .+ was not found on the server/;
const LAST_RELOAD_STORAGE_KEY = "diva:outdated-deployment-reload";
const RELOAD_COOLDOWN_MS = 30_000;

export function isOutdatedDeploymentError(error: unknown): boolean {
  return (
    error instanceof Error && MISSING_SERVER_ACTION_PATTERN.test(error.message)
  );
}

function readLastReloadAt(): number {
  try {
    return Number(sessionStorage.getItem(LAST_RELOAD_STORAGE_KEY) ?? 0);
  } catch {
    return 0;
  }
}

function writeLastReloadAt(timestamp: number): void {
  try {
    sessionStorage.setItem(LAST_RELOAD_STORAGE_KEY, String(timestamp));
  } catch {
    return;
  }
}

export function reloadOnOutdatedDeployment(error: unknown): void {
  if (!isOutdatedDeploymentError(error)) return;
  const now = Date.now();
  if (now - readLastReloadAt() < RELOAD_COOLDOWN_MS) return;
  writeLastReloadAt(now);
  window.location.reload();
}
