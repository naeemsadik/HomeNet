import { propertyFormSchema, upsertPropertyDtoSchema } from "../property";

describe("Strict property schemas", () => {
  const validFormData = {
    title: "Modern 3-Bedroom Apartment in Gulshan 2",
    description: "Spacious luxury flat with all modern facilities.",
    type: "residential" as const,
    listing_type: "sale" as const,
    price: "25000000",
    area_id: "gulshan-2",
    address: "Road 11, House 42",
    bedrooms: "3",
    bathrooms: "3",
    area_size: "2200",
  };

  describe("propertyFormSchema", () => {
    it("accepts valid form data", () => {
      expect(propertyFormSchema.safeParse(validFormData).success).toBe(true);
    });

    it("rejects title shorter than 3 or longer than 150 characters", () => {
      expect(propertyFormSchema.safeParse({ ...validFormData, title: "Ab" }).success).toBe(false);
      expect(propertyFormSchema.safeParse({ ...validFormData, title: "A".repeat(151) }).success).toBe(false);
    });

    it("rejects title containing script or angle brackets", () => {
      expect(
        propertyFormSchema.safeParse({
          ...validFormData,
          title: "Apartment <script>alert(1)</script>",
        }).success,
      ).toBe(false);
    });

    it("rejects description longer than 5000 characters", () => {
      expect(
        propertyFormSchema.safeParse({
          ...validFormData,
          description: "x".repeat(5001),
        }).success,
      ).toBe(false);
    });

    it("rejects invalid property types or listing types", () => {
      expect(
        propertyFormSchema.safeParse({
          ...validFormData,
          type: "spaceship" as any,
        }).success,
      ).toBe(false);

      expect(
        propertyFormSchema.safeParse({
          ...validFormData,
          listing_type: "giveaway" as any,
        }).success,
      ).toBe(false);
    });

    it("rejects non-numeric, zero, or negative prices", () => {
      expect(propertyFormSchema.safeParse({ ...validFormData, price: "abc" }).success).toBe(false);
      expect(propertyFormSchema.safeParse({ ...validFormData, price: "0" }).success).toBe(false);
      expect(propertyFormSchema.safeParse({ ...validFormData, price: "-100" }).success).toBe(false);
    });

    it("rejects invalid area_id format", () => {
      expect(
        propertyFormSchema.safeParse({
          ...validFormData,
          area_id: "area<with>tags",
        }).success,
      ).toBe(false);
    });

    it("rejects bedrooms or bathrooms not whole numbers or > 100", () => {
      expect(propertyFormSchema.safeParse({ ...validFormData, bedrooms: "2.5" }).success).toBe(false);
      expect(propertyFormSchema.safeParse({ ...validFormData, bedrooms: "150" }).success).toBe(false);
      expect(propertyFormSchema.safeParse({ ...validFormData, bathrooms: "-1" }).success).toBe(false);
    });

    it("rejects unexpected extra keys (.strict)", () => {
      expect(
        propertyFormSchema.safeParse({
          ...validFormData,
          extraKey: "should_fail",
        }).success,
      ).toBe(false);
    });
  });

  describe("upsertPropertyDtoSchema", () => {
    it("accepts valid upsert DTO", () => {
      const res = upsertPropertyDtoSchema.safeParse({
        title: "Modern 3-Bedroom Apartment in Gulshan 2",
        type: "residential",
        listing_type: "sale",
        price: 25000000,
        area_size: 2200,
        area_unit: "sqft",
        location_lat: 23.7925,
        location_lng: 90.4078,
        status: "draft",
      });
      expect(res.success).toBe(true);
    });

    it("rejects out-of-bounds latitude and longitude", () => {
      expect(upsertPropertyDtoSchema.safeParse({ location_lat: 95 }).success).toBe(false);
      expect(upsertPropertyDtoSchema.safeParse({ location_lat: -95 }).success).toBe(false);
      expect(upsertPropertyDtoSchema.safeParse({ location_lng: 190 }).success).toBe(false);
      expect(upsertPropertyDtoSchema.safeParse({ location_lng: -190 }).success).toBe(false);
    });

    it("rejects invalid virtual tour URLs", () => {
      expect(upsertPropertyDtoSchema.safeParse({ virtual_tour_url: "javascript:alert(1)" }).success).toBe(false);
      expect(upsertPropertyDtoSchema.safeParse({ virtual_tour_url: "not-a-url" }).success).toBe(false);
      expect(upsertPropertyDtoSchema.safeParse({ virtual_tour_url: "https://matterport.com/tour/123" }).success).toBe(true);
    });

    it("rejects unexpected properties (.strict)", () => {
      expect(
        upsertPropertyDtoSchema.safeParse({
          title: "Valid Title",
          unknown_field: 123,
        }).success,
      ).toBe(false);
    });
  });
});
