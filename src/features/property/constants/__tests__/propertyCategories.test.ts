import {
  CUSTOM_SUBTYPE_MAX_LENGTH,
  PROPERTY_TYPE_CONFIGS,
  cleanCustomSubtype,
  findKnownSubtype,
  initialSubtype,
  subtypeLabel,
  validateSubtype,
} from "../propertyCategories";

// The category config imports icon components; the rules under test don't use them.
jest.mock("@/components/icons", () => ({
  Building2: () => null,
  Car: () => null,
  Compass: () => null,
  Home: () => null,
}));

const { residential, commercial, land, parking } = PROPERTY_TYPE_CONFIGS;

describe("allowsCustomSubtype", () => {
  it("is on for every category except parking, whose subtypes the API restricts", () => {
    expect(residential.allowsCustomSubtype).toBe(true);
    expect(commercial.allowsCustomSubtype).toBe(true);
    expect(land.allowsCustomSubtype).toBe(true);
    expect(parking.allowsCustomSubtype).toBe(false);
  });

  it("keeps the parking list in step with what the API accepts", () => {
    // backend property.rules.ts: PARKING_SUBTYPES
    expect(parking.subtypes.map((s) => s.value).sort()).toEqual(["covered", "garage", "open"]);
  });
});

describe("cleanCustomSubtype", () => {
  it("trims and collapses whitespace", () => {
    expect(cleanCustomSubtype("  Guest   house \n")).toBe("Guest house");
  });

  it("keeps the owner's casing and non-Latin text", () => {
    expect(cleanCustomSubtype("Farm House")).toBe("Farm House");
    expect(cleanCustomSubtype("বাগানবাড়ি")).toBe("বাগানবাড়ি");
  });

  it("removes angle brackets and control characters", () => {
    expect(cleanCustomSubtype("<b>Loft</b>")).toBe("b Loft /b");
    expect(cleanCustomSubtype("Loft\u0000\u0007x")).toBe("Loft x");
  });

  it("caps the length at the limit", () => {
    expect(cleanCustomSubtype("x".repeat(100))).toHaveLength(CUSTOM_SUBTYPE_MAX_LENGTH);
  });
});

describe("findKnownSubtype", () => {
  it("matches a listed value or label in any spelling", () => {
    expect(findKnownSubtype(residential, "duplex")?.value).toBe("duplex");
    expect(findKnownSubtype(residential, "  Duplex ")?.value).toBe("duplex");
    expect(findKnownSubtype(residential, "Independent House")?.value).toBe("house");
    expect(findKnownSubtype(residential, "short let")?.value).toBe("short-let");
    expect(findKnownSubtype(land, "residential plot")?.value).toBe("residential-plot");
  });

  it("matches one side of a 'A / B' label", () => {
    expect(findKnownSubtype(residential, "flat")?.value).toBe("apartment");
    expect(findKnownSubtype(commercial, "retail")?.value).toBe("shop");
  });

  it("does not match something new, or a listed word inside a longer name", () => {
    expect(findKnownSubtype(residential, "Farmhouse")).toBeUndefined();
    expect(findKnownSubtype(residential, "Duplex villa")).toBeUndefined();
    expect(findKnownSubtype(residential, "")).toBeUndefined();
    expect(findKnownSubtype(residential, "///")).toBeUndefined();
  });

  it("only looks within the given category", () => {
    expect(findKnownSubtype(commercial, "duplex")).toBeUndefined();
  });
});

describe("subtypeLabel", () => {
  it("uses the listed label, or the owner's own text", () => {
    expect(subtypeLabel(residential, "house")).toBe("Independent House");
    expect(subtypeLabel(residential, "  Guest   house ")).toBe("Guest house");
  });
});

describe("validateSubtype", () => {
  it("accepts a listed value", () => {
    expect(validateSubtype(residential, "apartment")).toBeNull();
    expect(validateSubtype(parking, "garage")).toBeNull();
  });

  it("accepts a custom subtype where allowed", () => {
    expect(validateSubtype(residential, "Farmhouse")).toBeNull();
    expect(validateSubtype(land, "Fish farm")).toBeNull();
  });

  it("asks for a subtype when empty, mentioning Other only where it exists", () => {
    expect(validateSubtype(residential, "   ")).toMatch(/pick Other/);
    expect(validateSubtype(parking, "")).toBe("Choose a subtype.");
  });

  it("rejects a one-character custom subtype", () => {
    expect(validateSubtype(commercial, "x")).toMatch(/at least 2/);
  });

  it("rejects an unlisted parking subtype, which the API would refuse", () => {
    expect(validateSubtype(parking, "Rooftop slot")).toMatch(/subtypes listed/);
  });
});

describe("initialSubtype", () => {
  it("falls back to the default with no suggestion", () => {
    expect(initialSubtype(residential, undefined)).toBe("apartment");
    expect(initialSubtype(residential, "   ")).toBe("apartment");
  });

  it("keeps a listed suggestion", () => {
    expect(initialSubtype(residential, "duplex")).toBe("duplex");
    expect(initialSubtype(land, "agricultural")).toBe("agricultural");
  });

  it("keeps a custom suggestion where allowed, tidied", () => {
    expect(initialSubtype(residential, "  Farm  house ")).toBe("Farm house");
  });

  it("drops a custom suggestion for parking", () => {
    expect(initialSubtype(parking, "rooftop")).toBe("covered");
    expect(initialSubtype(parking, "garage")).toBe("garage");
  });
});
