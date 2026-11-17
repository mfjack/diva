export type SearchParamValue = string | string[] | undefined;

export function getSingleSearchParam(
  value: SearchParamValue,
): string | undefined {
  return typeof value === "string" ? value : undefined;
}
