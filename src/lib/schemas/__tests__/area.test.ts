import { createAreaSchema, updateAreaSchema } from "../area";

describe("Strict area schemas", () => {
  describe("createAreaSchema", () => {
    it("accepts valid area details", () => {
      expect(
        createAreaSchema.safeParse({
          name: "Gulshan-2",
          city: "Dhaka",
          parent_area_id: "gulshan",
        }).success,
      ).toBe(true);
    });

    it("rejects name shorter than 2 or longer than 100 characters", () => {
      expect(createAreaSchema.safeParse({ name: "A" }).success).toBe(false);
      expect(createAreaSchema.safeParse({ name: "A".repeat(101) }).success).toBe(false);
    });

    it("rejects invalid characters in name or city", () => {
      expect(createAreaSchema.safeParse({ name: "Area <script>" }).success).toBe(false);
      expect(createAreaSchema.safeParse({ name: "Gulshan", city: "Dhaka<script>" }).success).toBe(false);
    });

    it("rejects unexpected properties (.strict)", () => {
      expect(
        createAreaSchema.safeParse({
          name: "Banani",
          extra: "bad",
        }).success,
      ).toBe(false);
    });
  });

  describe("updateAreaSchema", () => {
    it("accepts partial updates", () => {
      expect(updateAreaSchema.safeParse({ name: "New Name" }).success).toBe(true);
      expect(updateAreaSchema.safeParse({}).success).toBe(true);
    });

    it("rejects invalid properties (.strict)", () => {
      expect(updateAreaSchema.safeParse({ unknown_prop: 123 }).success).toBe(false);
    });
  });
});
