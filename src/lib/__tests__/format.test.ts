import { formatPrice } from "@/lib/format";

describe("formatPrice", () => {
  it("shows crore from 1,00,00,000 up, dropping a trailing .00", () => {
    expect(formatPrice(10_000_000, "BDT")).toBe("৳ 1 Cr");
    expect(formatPrice(48_500_000, "BDT")).toBe("৳ 4.85 Cr");
  });

  it("shows lakh (Lac) from 1,00,000 up to just under a crore", () => {
    expect(formatPrice(100_000, "BDT")).toBe("৳ 1 Lac");
    expect(formatPrice(2_550_000, "BDT")).toBe("৳ 25.50 Lac");
    expect(formatPrice(9_999_999, "BDT")).toBe("৳ 100 Lac");
  });

  it("groups smaller amounts", () => {
    expect(formatPrice(99_999, "BDT")).toMatch(/^৳ 99,999$/);
  });

  it("uses the currency code as-is for anything but BDT", () => {
    expect(formatPrice(25_000_000, "USD")).toBe("USD 2.50 Cr");
  });
});
