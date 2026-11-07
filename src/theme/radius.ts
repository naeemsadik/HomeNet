/**
 * HomeNet border-radius scale.
 *
 * A small, named tier system so components stop picking arbitrary radius
 * values ad hoc. Pick the closest tier rather than a new magic number.
 */
export const radiusTokens = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  card: 6,
  xl: 12,
  pill: 999,
} as const;

export type RadiusTokens = typeof radiusTokens;
