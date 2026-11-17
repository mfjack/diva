export function emptyToNull(value: string): string | null {
  const trimmedValue = value.trim();
  return trimmedValue === "" ? null : trimmedValue;
}

export function toFileSlug(value: string, fallback: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || fallback;
}
