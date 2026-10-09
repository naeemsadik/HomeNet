import {
  formatLocalizedNumber,
  formatLocalizedPrice,
  translateAmenity,
  translatePropertyType,
  translateListingStatus,
} from "@/i18n/dataTranslators";

describe("dataTranslators", () => {
  describe("formatLocalizedNumber", () => {
    it("returns English numbers as string when lang is 'en'", () => {
      expect(formatLocalizedNumber(12345, "en")).toBe("12345");
      expect(formatLocalizedNumber("987", "en")).toBe("987");
    });

    it("converts Western digits 0-9 to Bengali digits ০-৯ when lang is 'bn'", () => {
      expect(formatLocalizedNumber(0, "bn")).toBe("০");
      expect(formatLocalizedNumber(1234567890, "bn")).toBe("১২৩৪৫৬৭৮৯০");
      expect(formatLocalizedNumber("4.85", "bn")).toBe("৪.৮৫");
    });

    it("handles null and undefined safely", () => {
      expect(formatLocalizedNumber(null, "bn")).toBe("");
      expect(formatLocalizedNumber(undefined, "bn")).toBe("");
    });
  });

  describe("formatLocalizedPrice", () => {
    it("formats crore prices correctly in English", () => {
      expect(formatLocalizedPrice(48_500_000, "BDT", "en")).toBe("৳ 4.85 Cr");
      expect(formatLocalizedPrice(10_000_000, "BDT", "en")).toBe("৳ 1 Cr");
    });

    it("formats crore prices correctly in Bengali", () => {
      expect(formatLocalizedPrice(48_500_000, "BDT", "bn")).toBe("৳ ৪.৮৫ কোটি");
      expect(formatLocalizedPrice(10_000_000, "BDT", "bn")).toBe("৳ ১ কোটি");
    });

    it("formats lakh prices correctly in English", () => {
      expect(formatLocalizedPrice(5_000_000, "BDT", "en")).toBe("৳ 50 Lac");
      expect(formatLocalizedPrice(150_000, "BDT", "en")).toBe("৳ 1.50 Lac");
      expect(formatLocalizedPrice(100_000, "BDT", "en")).toBe("৳ 1 Lac");
    });

    it("formats lakh prices correctly in Bengali", () => {
      expect(formatLocalizedPrice(5_000_000, "BDT", "bn")).toBe("৳ ৫০ লাখ");
      expect(formatLocalizedPrice(150_000, "BDT", "bn")).toBe("৳ ১.৫০ লাখ");
      expect(formatLocalizedPrice(100_000, "BDT", "bn")).toBe("৳ ১ লাখ");
    });

    it("formats amounts below lakh with standard grouping", () => {
      expect(formatLocalizedPrice(75_000, "BDT", "en")).toBe("৳ 75,000");
      expect(formatLocalizedPrice(75_000, "BDT", "bn")).toBe("৳ ৭৫,০০০");
    });

    it("supports custom currency codes", () => {
      expect(formatLocalizedPrice(50_000, "USD", "en")).toBe("USD 50,000");
    });
  });

  describe("translatePropertyType", () => {
    it("returns raw string in English", () => {
      expect(translatePropertyType("apartment", "en")).toBe("apartment");
      expect(translatePropertyType("duplex", "en")).toBe("duplex");
    });

    it("translates known property types in Bengali", () => {
      expect(translatePropertyType("apartment", "bn")).toBe("অ্যাপার্টমেন্ট");
      expect(translatePropertyType("flat", "bn")).toBe("ফ্ল্যাট");
      expect(translatePropertyType("duplex", "bn")).toBe("ডুপ্লেক্স");
      expect(translatePropertyType("house", "bn")).toBe("বাড়ি");
      expect(translatePropertyType("commercial", "bn")).toBe("বাণিজ্যিক");
    });

    it("handles case and hyphen variations safely", () => {
      expect(translatePropertyType("PENTHOUSE", "bn")).toBe("পেন্টহাউস");
      expect(translatePropertyType("smart-home", "bn")).toBe("smart-home");
    });

    it("handles null, undefined, empty string, and non-string safely", () => {
      expect(translatePropertyType("" as any, "bn")).toBe("");
      expect(translatePropertyType(null as any, "bn")).toBe("");
      expect(translatePropertyType(undefined as any, "bn")).toBe("");
    });
  });

  describe("translateListingStatus", () => {
    it("returns raw status in English", () => {
      expect(translateListingStatus("active", "en")).toBe("active");
      expect(translateListingStatus("pending", "en")).toBe("pending");
    });

    it("translates known statuses in Bengali", () => {
      expect(translateListingStatus("active", "bn")).toBe("সক্রিয়");
      expect(translateListingStatus("sold", "bn")).toBe("বিক্রি হয়েছে");
      expect(translateListingStatus("rented", "bn")).toBe("ভাড়া হয়েছে");
      expect(translateListingStatus("verified", "bn")).toBe("যাচাইকৃত");
    });

    it("returns fallback for unknown statuses", () => {
      expect(translateListingStatus("custom_status", "bn")).toBe("custom_status");
    });

    it("handles null, undefined, empty string, and non-string safely", () => {
      expect(translateListingStatus("" as any, "bn")).toBe("");
      expect(translateListingStatus(null as any, "bn")).toBe("");
      expect(translateListingStatus(undefined as any, "bn")).toBe("");
    });
  });

  describe("translateAmenity", () => {
    it("returns raw amenity in English", () => {
      expect(translateAmenity("Lift", "en")).toBe("Lift");
      expect(translateAmenity("Parking", "en")).toBe("Parking");
    });

    it("translates known amenities in Bengali", () => {
      expect(translateAmenity("Lift", "bn")).toBe("লিফট");
      expect(translateAmenity("Parking", "bn")).toBe("পার্কিং");
      expect(translateAmenity("Generator", "bn")).toBe("জেনারেটর");
      expect(translateAmenity("Gym", "bn")).toBe("জিম");
      expect(translateAmenity("Pool", "bn")).toBe("সুইমিং পুল");
      expect(translateAmenity("Security", "bn")).toBe("নিরাপত্তা");
      expect(translateAmenity("Garden", "bn")).toBe("বাগান");
      expect(translateAmenity("Smart Home", "bn")).toBe("স্মার্ট হোম");
    });

    it("returns fallback safely for custom amenities", () => {
      expect(translateAmenity("Helipad", "bn")).toBe("Helipad");
    });

    it("handles null, undefined, empty string, and non-string safely", () => {
      expect(translateAmenity("" as any, "bn")).toBe("");
      expect(translateAmenity(null as any, "bn")).toBe("");
      expect(translateAmenity(undefined as any, "bn")).toBe("");
    });
  });
});
