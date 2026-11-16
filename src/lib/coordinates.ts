/**
 * A typed latitude or longitude: a finite number within ±limit, or null.
 * Empty or partly numeric text ("12abc") is rejected rather than half-read.
 */
export function parseCoordinate(text: string, limit: number): number | null {
  const trimmed = text.trim();
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Math.abs(value) <= limit ? value : null;
}
