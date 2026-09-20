/**
 * Page layout tokens.
 *
 * One container width for the whole product. The navbar and the page content
 * below it both use `containerMaxWidth` + the same gutter, so they align by
 * construction rather than by hand-tuned offsets.
 */
export const layoutTokens = {
  containerMaxWidth: 1240,
  gutter: 24,
  gutterTablet: 20,
  gutterPhone: 16,
  navHeight: 72,
  navHeightTablet: 64,
  navHeightPhone: 56,
} as const;

export type LayoutTokens = typeof layoutTokens;
