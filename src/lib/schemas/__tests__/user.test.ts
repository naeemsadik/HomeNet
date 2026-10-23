import { editProfileSchema, updateUserDtoSchema } from "../user";

describe("Strict user schemas", () => {
  describe("editProfileSchema", () => {
    it("accepts valid names", () => {
      expect(editProfileSchema.safeParse({ full_name: "John Doe" }).success).toBe(true);
      expect(editProfileSchema.safeParse({ full_name: "মোহাম্মদ রহিম" }).success).toBe(true);
    });

    it("rejects names shorter than 2 characters", () => {
      expect(editProfileSchema.safeParse({ full_name: "A" }).success).toBe(false);
      expect(editProfileSchema.safeParse({ full_name: "" }).success).toBe(false);
    });

    it("rejects names longer than 100 characters", () => {
      expect(editProfileSchema.safeParse({ full_name: "A".repeat(101) }).success).toBe(false);
    });

    it("rejects whitespace-only names", () => {
      expect(editProfileSchema.safeParse({ full_name: "    " }).success).toBe(false);
    });

    it("rejects names with script or html tags", () => {
      expect(editProfileSchema.safeParse({ full_name: "<script>alert(1)</script>" }).success).toBe(false);
      expect(editProfileSchema.safeParse({ full_name: "John <b>Doe</b>" }).success).toBe(false);
    });

    it("rejects unexpected extra properties (.strict)", () => {
      expect(
        editProfileSchema.safeParse({
          full_name: "John Doe",
          role: "admin",
        }).success,
      ).toBe(false);
    });
  });

  describe("updateUserDtoSchema", () => {
    it("accepts empty or partial valid updates", () => {
      expect(updateUserDtoSchema.safeParse({}).success).toBe(true);
      expect(updateUserDtoSchema.safeParse({ full_name: "Jane Smith" }).success).toBe(true);
    });

    it("rejects invalid full_name", () => {
      expect(updateUserDtoSchema.safeParse({ full_name: "X" }).success).toBe(false);
    });

    it("rejects unexpected properties (.strict)", () => {
      expect(
        updateUserDtoSchema.safeParse({
          full_name: "Jane Smith",
          is_admin: true,
        }).success,
      ).toBe(false);
    });
  });
});
