/**
 * Bangladeshi money reads in crore and lakh, not in grouped digits.
 * 48,500,000 is unparseable at a glance; 4.85 Cr is not.
 */
export function formatPrice(price: number, currency: string): string {
  const unit = currency === "BDT" ? "৳" : currency;
  if (price >= 10_000_000) return `${unit} ${(price / 10_000_000).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (price >= 100_000) return `${unit} ${(price / 100_000).toFixed(2).replace(/\.00$/, "")} Lac`;
  return `${unit} ${price.toLocaleString("en-BD")}`;
}
