/**
 * HomeNet border-radius scale.
 *
 * A small, named tier system so components stop picking arbitrary radius
 * values ad hoc. Pick the closest tier rather than a new magic number.
 */
export const radiusTokens = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export type RadiusTokens = typeof radiusTokens;
