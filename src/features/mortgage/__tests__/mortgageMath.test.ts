import {
  affordabilityFor,
  loanForInstalment,
  monthlyInstalment,
  parseAmount,
  paymentFor,
} from "../utils/mortgageMath";

describe("parseAmount", () => {
  it("reads digits with commas and spaces", () => {
    expect(parseAmount("1,20,00,000")).toBe(12000000);
    expect(parseAmount(" 9.5 ")).toBe(9.5);
  });

  it("is null for empty or non-numeric text", () => {
    expect(parseAmount("")).toBeNull();
    expect(parseAmount("abc")).toBeNull();
    expect(parseAmount("-5")).toBeNull();
    expect(parseAmount("1.2.3")).toBeNull();
  });
});

describe("monthlyInstalment", () => {
  it("matches the standard formula: 1,000,000 at 12% over 1 year", () => {
    // Textbook value: 88,848.79 a month.
    expect(monthlyInstalment(1000000, 12, 1)).toBeCloseTo(88848.79, 1);
  });

  it("splits the loan evenly at 0%", () => {
    expect(monthlyInstalment(1200000, 0, 10)).toBe(10000);
  });

  it("is zero for no loan or no term", () => {
    expect(monthlyInstalment(0, 9, 20)).toBe(0);
    expect(monthlyInstalment(1000000, 9, 0)).toBe(0);
  });

  it("falls as the term gets longer", () => {
    expect(monthlyInstalment(5000000, 9, 25)).toBeLessThan(monthlyInstalment(5000000, 9, 15));
  });
});

describe("loanForInstalment", () => {
  it("is the inverse of monthlyInstalment", () => {
    const instalment = monthlyInstalment(8400000, 9.5, 20);
    expect(loanForInstalment(instalment, 9.5, 20)).toBeCloseTo(8400000, 0);
    expect(loanForInstalment(10000, 0, 10)).toBe(1200000);
  });
});

describe("paymentFor", () => {
  it("borrows the price less the down payment and totals the interest", () => {
    const result = paymentFor({ price: 12000000, downPayment: 3600000, annualRatePct: 9, years: 20 })!;
    expect(result.loan).toBe(8400000);
    expect(result.cashUpfront).toBe(3600000);
    expect(result.totalRepaid).toBeCloseTo(result.instalment * 240, 5);
    expect(result.totalInterest).toBeCloseTo(result.totalRepaid - 8400000, 5);
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  it("is null until there is something to work out", () => {
    expect(paymentFor({ price: 0, downPayment: 0, annualRatePct: 9, years: 20 })).toBeNull();
    expect(paymentFor({ price: 5000000, downPayment: 5000000, annualRatePct: 9, years: 20 })).toBeNull();
    expect(paymentFor({ price: 5000000, downPayment: 6000000, annualRatePct: 9, years: 20 })).toBeNull();
    expect(paymentFor({ price: 5000000, downPayment: 0, annualRatePct: NaN, years: 20 })).toBeNull();
  });
});

describe("affordabilityFor", () => {
  const base = {
    monthlyIncome: 150000,
    existingInstalments: 0,
    incomeSharePct: 40,
    savings: 2000000,
    annualRatePct: 9,
    years: 20,
  };

  it("puts the chosen share of income towards the instalment", () => {
    const result = affordabilityFor(base)!;
    expect(result.instalment).toBe(60000);
    expect(result.price).toBeCloseTo(result.loan + 2000000, 5);
    expect(monthlyInstalment(result.loan, 9, 20)).toBeCloseTo(60000, 2);
  });

  it("takes existing instalments off first", () => {
    expect(affordabilityFor({ ...base, existingInstalments: 20000 })!.instalment).toBe(40000);
  });

  it("leaves only the savings when existing instalments use the whole share", () => {
    const result = affordabilityFor({ ...base, existingInstalments: 90000 })!;
    expect(result.instalment).toBe(0);
    expect(result.loan).toBe(0);
    expect(result.price).toBe(2000000);
  });

  it("is null without an income", () => {
    expect(affordabilityFor({ ...base, monthlyIncome: 0 })).toBeNull();
  });
});
