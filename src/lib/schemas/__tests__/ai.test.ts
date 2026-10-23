import { aiParsePropertyInputSchema, smartSearchInputSchema } from "../ai";

describe("Strict AI schemas", () => {
  describe("aiParsePropertyInputSchema", () => {
    it("accepts valid property description", () => {
      const res = aiParsePropertyInputSchema.safeParse({
        description: "3 bed flat for sale in Dhanmondi, 1650 sqft, 4th floor, south facing, Tk 1.8 crore",
      });
      expect(res.success).toBe(true);
    });

    it("rejects description shorter than 20 characters", () => {
      const res = aiParsePropertyInputSchema.safeParse({
        description: "Too short",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toMatch(/at least 20 characters/i);
      }
    });

    it("rejects description longer than 2000 characters", () => {
      const res = aiParsePropertyInputSchema.safeParse({
        description: "x".repeat(2001),
      });
      expect(res.success).toBe(false);
    });

    it("rejects description with control characters", () => {
      const res = aiParsePropertyInputSchema.safeParse({
        description: "3 bed flat in Dhanmondi \u0000\u0007 with modern fittings",
      });
      expect(res.success).toBe(false);
    });

    it("rejects extra keys (.strict)", () => {
      const res = aiParsePropertyInputSchema.safeParse({
        description: "3 bed flat for sale in Dhanmondi, 1650 sqft, 4th floor",
        extraKey: "fail",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("smartSearchInputSchema", () => {
    it("accepts valid search queries", () => {
      expect(
        smartSearchInputSchema.safeParse({
          query: "2 bedroom flat for rent in Dhanmondi under 40 thousand",
          page: 1,
          limit: 12,
        }).success,
      ).toBe(true);
    });

    it("rejects empty search queries", () => {
      expect(smartSearchInputSchema.safeParse({ query: "" }).success).toBe(false);
    });

    it("rejects search queries longer than 300 characters", () => {
      expect(smartSearchInputSchema.safeParse({ query: "q".repeat(301) }).success).toBe(false);
    });

    it("rejects search queries containing angle brackets or script tags", () => {
      expect(
        smartSearchInputSchema.safeParse({
          query: "<script>alert(1)</script>",
        }).success,
      ).toBe(false);
    });

    it("rejects invalid page or limit values", () => {
      expect(smartSearchInputSchema.safeParse({ query: "flat", page: 0 }).success).toBe(false);
      expect(smartSearchInputSchema.safeParse({ query: "flat", limit: 25 }).success).toBe(false);
    });

    it("rejects extra properties (.strict)", () => {
      expect(
        smartSearchInputSchema.safeParse({
          query: "flat",
          injected: true,
        }).success,
      ).toBe(false);
    });
  });
});
