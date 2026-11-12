/**
 * Home-loan arithmetic. Every figure comes from what the reader typed: no bank
 * rate, lending limit or fee is assumed here. The standard equal-instalment
 * formula is the only thing built in.
 */

/** Reads a typed amount: digits, with commas or spaces ignored. Null when empty or not a number. */
export function parseAmount(text: string): number | null {
  const clean = text.replace(/[,\s]/g, "");
  if (clean === "" || !/^\d*\.?\d*$/.test(clean)) return null;
  const value = Number(clean);
  return Number.isFinite(value) ? value : null;
}

/**
 * The equal monthly instalment that repays `principal` over `years` at
 * `annualRatePct` a year, charged monthly. At 0% it is the loan split evenly.
 */
export function monthlyInstalment(principal: number, annualRatePct: number, years: number): number {
  const months = Math.round(years * 12);
  if (principal <= 0 || months <= 0 || annualRatePct < 0) return 0;
  const rate = annualRatePct / 100 / 12;
  if (rate === 0) return principal / months;
  const growth = Math.pow(1 + rate, months);
  return (principal * rate * growth) / (growth - 1);
}

/** The loan an instalment of `instalment` a month can repay: the inverse of `monthlyInstalment`. */
export function loanForInstalment(instalment: number, annualRatePct: number, years: number): number {
  const months = Math.round(years * 12);
  if (instalment <= 0 || months <= 0 || annualRatePct < 0) return 0;
  const rate = annualRatePct / 100 / 12;
  if (rate === 0) return instalment * months;
  return (instalment * (1 - Math.pow(1 + rate, -months))) / rate;
}

export interface PaymentInput {
  price: number;
  downPayment: number;
  annualRatePct: number;
  years: number;
}

export interface PaymentResult {
  loan: number;
  instalment: number;
  totalRepaid: number;
  totalInterest: number;
  /** The down payment. Registration and bank fees come on top and are not estimated. */
  cashUpfront: number;
}

/** What a given flat costs each month. Null until the price, rate and term make a loan. */
export function paymentFor({ price, downPayment, annualRatePct, years }: PaymentInput): PaymentResult | null {
  const loan = price - downPayment;
  if (!(price > 0) || downPayment < 0 || !(loan > 0) || !(annualRatePct >= 0) || !(years > 0)) return null;
  const instalment = monthlyInstalment(loan, annualRatePct, years);
  const totalRepaid = instalment * Math.round(years * 12);
  return { loan, instalment, totalRepaid, totalInterest: totalRepaid - loan, cashUpfront: downPayment };
}

export interface AffordabilityInput {
  monthlyIncome: number;
  existingInstalments: number;
  /** The share of income the reader is willing to put towards all instalments, 0 to 100. */
  incomeSharePct: number;
  savings: number;
  annualRatePct: number;
  years: number;
}

export interface AffordabilityResult {
  /** What is left for this loan each month after existing instalments. Zero when nothing is left. */
  instalment: number;
  loan: number;
  /** Loan plus the savings put down. */
  price: number;
  totalInterest: number;
}

/** The price a given income can carry. Null until income, rate and term are usable. */
export function affordabilityFor(input: AffordabilityInput): AffordabilityResult | null {
  const { monthlyIncome, existingInstalments, incomeSharePct, savings, annualRatePct, years } = input;
  if (!(monthlyIncome > 0) || existingInstalments < 0 || savings < 0 || !(annualRatePct >= 0) || !(years > 0)) {
    return null;
  }
  const instalment = Math.max(0, (monthlyIncome * incomeSharePct) / 100 - existingInstalments);
  const loan = loanForInstalment(instalment, annualRatePct, years);
  const totalInterest = Math.max(0, instalment * Math.round(years * 12) - loan);
  return { instalment, loan, price: loan + savings, totalInterest };
}
