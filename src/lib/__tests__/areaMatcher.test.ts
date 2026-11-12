import {
  collectAvailableCities,
  inferAreaCity,
  normalizeBdTransliteration,
  normalizeCityName,
  parseGooglePlace,
  resolveAreaFromGooglePlace,
  resolveAreaMatch,
  scopeAreasToCity,
} from "@/lib/areaMatcher";
import type { Area } from "@/types/api";

const makeArea = (
  id: string,
  name: string,
  city: string | null,
  extra: Partial<Area> = {},
): Area => ({
  id,
  name,
  city,
  parent_area_id: null,
  ...extra,
});

const SAMPLE_AREAS: Area[] = [
  makeArea("dhk-adabar", "Adabar", "Dhaka", { center_lat: 23.7712, center_lng: 90.3586 }),
  makeArea("dhk-shajahanpur", "Shajahanpur", "Dhaka", { center_lat: 23.7438, center_lng: 90.4227 }),
  makeArea("bgr-shajahanpur", "Shajahanpur", "Bogura", { center_lat: 24.7825, center_lng: 89.3948 }),
  makeArea("dhk-mirpur", "Mirpur", "Dhaka", { center_lat: 23.8223, center_lng: 90.3654 }),
  makeArea("dhk-mirpur-dohs", "Mirpur DOHS", "Dhaka", { center_lat: 23.8384, center_lng: 90.3694 }),
  makeArea("dhk-gulshan-1", "Gulshan 1", "Dhaka", { center_lat: 23.7808, center_lng: 90.4165 }),
  makeArea("dhk-gulshan-2", "Gulshan 2", "Dhaka", {
    aliases: ["Gulshan-2", "Gulshan Circle 2"],
    center_lat: 23.7949,
    center_lng: 90.4144,
  }),
  makeArea("dhk-mohammadpur", "Mohammadpur", "Dhaka", { center_lat: 23.7662, center_lng: 90.3589 }),
  makeArea("dhk-bashundhara", "Bashundhara R/A", "Dhaka", { center_lat: 23.8193, center_lng: 90.4526 }),
  makeArea("ctg-agrabad", "Agrabad", "Chattogram", { center_lat: 22.3239, center_lng: 91.8124 }),
];

describe("normalizeCityName & city inference", () => {
  it("normalizes colonial spellings and administrative suffixes", () => {
    expect(normalizeCityName("Chittagong District")).toBe("Chattogram");
    expect(normalizeCityName("Bogra District")).toBe("Bogura");
    expect(normalizeCityName("Comilla")).toBe("Cumilla");
    expect(normalizeCityName("Barisal Division")).toBe("Barishal");
    expect(normalizeCityName("Jessore Sadar")).toBe("Jashore");
    expect(normalizeCityName("Dhaka District")).toBe("Dhaka");
  });

  it("infers city when backend area.city is null using coords, parent, or known map", () => {
    const legacyAreas = [
      makeArea("1", "Adabor", null),
      makeArea("2", "Agrabad", null),
      makeArea("3", "Padma Residential", null, { center_lat: 24.3745, center_lng: 88.6100 }),
      makeArea("syl-parent", "Sylhet", "Sylhet"),
      makeArea("4", "Subid Bazar", null, { parent_area_id: "syl-parent" }),
    ];
    const byId = new Map(legacyAreas.map((a) => [a.id, a]));
    expect(inferAreaCity(legacyAreas[0], byId)).toBe("Dhaka");
    expect(inferAreaCity(legacyAreas[1], byId)).toBe("Chattogram");
    expect(inferAreaCity(legacyAreas[2], byId)).toBe("Rajshahi");
    expect(inferAreaCity(legacyAreas[4], byId)).toBe("Sylhet");
    expect(scopeAreasToCity(legacyAreas, "Chittagong").map((a) => a.id)).toEqual(["2"]);
    expect(collectAvailableCities(legacyAreas)).toEqual(expect.arrayContaining(["Dhaka", "Chattogram", "Rajshahi", "Sylhet"]));
  });
});

describe("resolveAreaMatch multi-layer resolution", () => {
  it("normalizes Bangladeshi transliteration variations accurately", () => {
    expect(normalizeBdTransliteration("Adabor")).toBe("adabar");
    expect(normalizeBdTransliteration("Shahjahanpur")).toBe(normalizeBdTransliteration("Shajahanpur"));
  });

  it("matches exact spellings, separators, and aliases (Layer 1)", () => {
    const res = resolveAreaMatch({ query: "Gulshan Circle 2", city: "Dhaka", areas: SAMPLE_AREAS });
    expect(res.matchType).toBe("exact");
    expect(res.matchedArea?.id).toBe("dhk-gulshan-2");

    const bashundhara = resolveAreaMatch({
      query: "Bashundhara Residential Area",
      city: "Dhaka",
      areas: SAMPLE_AREAS,
    });
    expect(bashundhara.matchType).toBe("exact");
    expect(bashundhara.matchedArea?.id).toBe("dhk-bashundhara");
  });

  it("resolves Adabor -> Adabar and Shahjahanpur -> Shajahanpur via fuzzy matcher (Layer 2)", () => {
    const adabor = resolveAreaMatch({ query: "Adabor", city: "Dhaka", areas: SAMPLE_AREAS });
    expect(adabor.matchType).toBe("fuzzy");
    expect(adabor.matchedArea?.id).toBe("dhk-adabar");
    expect(adabor.confidence).toBeGreaterThanOrEqual(0.82);

    const shahjahanpur = resolveAreaMatch({ query: "Shahjahanpur", city: "Dhaka", areas: SAMPLE_AREAS });
    expect(shahjahanpur.matchType).toBe("fuzzy");
    expect(shahjahanpur.matchedArea?.id).toBe("dhk-shajahanpur");
  });

  it("scopes strictly to active city so cross-district duplicates never collide", () => {
    const boguraMatch = resolveAreaMatch({ query: "Shahjahanpur", city: "Bogura", areas: SAMPLE_AREAS });
    expect(boguraMatch.matchType).toBe("fuzzy");
    expect(boguraMatch.matchedArea?.id).toBe("bgr-shajahanpur");

    const dhakaMatch = resolveAreaMatch({ query: "Shahjahanpur", city: "Dhaka", areas: SAMPLE_AREAS });
    expect(dhakaMatch.matchedArea?.id).toBe("dhk-shajahanpur");

    // Area existing only in Dhaka must not match inside Chattogram
    const crossMiss = resolveAreaMatch({ query: "Adabar", city: "Chattogram", areas: SAMPLE_AREAS });
    expect(crossMiss.matchType).toBe("none");
    expect(crossMiss.matchedArea).toBeNull();
  });

  it("blocks qualifier conflicts such as Mirpur vs Mirpur DOHS and Gulshan 1 vs Gulshan 2", () => {
    const onlyMirpurDohs = [makeArea("dhk-mirpur-dohs", "Mirpur DOHS", "Dhaka")];
    const mirpurIntoDohs = resolveAreaMatch({ query: "Mirpur", city: "Dhaka", areas: onlyMirpurDohs });
    expect(mirpurIntoDohs.matchType).toBe("none");
    expect(mirpurIntoDohs.matchedArea).toBeNull();

    const mirpurBoth = resolveAreaMatch({ query: "Mirpur", city: "Dhaka", areas: SAMPLE_AREAS });
    expect(mirpurBoth.matchedArea?.id).toBe("dhk-mirpur");

    const onlyGulshan2 = [makeArea("dhk-gulshan-2", "Gulshan 2", "Dhaka")];
    const gulshan1Into2 = resolveAreaMatch({ query: "Gulshan 1", city: "Dhaka", areas: onlyGulshan2 });
    expect(gulshan1Into2.matchType).toBe("none");
  });

  it("returns ambiguous on near-tied fuzzy scores unless coordinates disambiguate", () => {
    const twinAreas = [
      makeArea("b1", "Baganbari", "Dhaka", { center_lat: 23.760, center_lng: 90.420 }),
      makeArea("b2", "Baganbura", "Dhaka", { center_lat: 23.790, center_lng: 90.450 }),
    ];

    const noCoords = resolveAreaMatch({ query: "Baganburi", city: "Dhaka", areas: twinAreas });
    expect(noCoords.matchType).toBe("ambiguous");
    expect(noCoords.matchedArea).toBeNull();
    expect(noCoords.candidates.map((c) => c.id)).toEqual(expect.arrayContaining(["b1", "b2"]));

    const withCoords = resolveAreaMatch({
      query: "Baganburi",
      city: "Dhaka",
      areas: twinAreas,
      coordinates: { lat: 23.7902, lng: 90.4502 },
    });
    expect(withCoords.matchType).toBe("fuzzy");
    expect(withCoords.matchedArea?.id).toBe("b2");
  });

  it("falls back to Haversine proximity within 3km inside the selected city (Layer 3)", () => {
    const nearMohammadpur = resolveAreaMatch({
      query: "Tajmahal Road Block C",
      city: "Dhaka",
      areas: SAMPLE_AREAS,
      coordinates: { lat: 23.7668, lng: 90.3605 },
    });
    expect(nearMohammadpur.matchType).toBe("proximity");
    expect(nearMohammadpur.matchedArea?.id).toBe("dhk-mohammadpur");
    expect(nearMohammadpur.distanceKm).not.toBeNull();
    expect(nearMohammadpur.distanceKm!).toBeLessThanOrEqual(3);

    // Coordinates far outside every Dhaka DB area (> 3km) gracefully fall back to city + coords
    const farAway = resolveAreaMatch({
      query: "Savar Ashulia",
      city: "Dhaka",
      areas: SAMPLE_AREAS,
      coordinates: { lat: 23.895, lng: 90.265 },
    });
    expect(farAway.matchType).toBe("none");
    expect(farAway.city).toBe("Dhaka");
    expect(farAway.coordinates).toEqual({ lat: 23.895, lng: 90.265 });
  });
});

describe("Google Places parsing & resolution", () => {
  it("parses Places API (New) addressComponents & location and resolves spelling mismatches", () => {
    const googlePlace = {
      displayName: "Adabor",
      formattedAddress: "Adabor, Dhaka, Bangladesh",
      location: { lat: () => 23.7715, lng: () => 90.3589 },
      addressComponents: [
        { longText: "Adabor", types: ["sublocality_level_1", "sublocality"] },
        { longText: "Dhaka", types: ["locality"] },
        { longText: "Dhaka District", types: ["administrative_area_level_2"] },
      ],
    };

    const { parsed, resolution } = resolveAreaFromGooglePlace(googlePlace, SAMPLE_AREAS);
    expect(parsed.city).toBe("Dhaka");
    expect(parsed.subArea).toBe("Adabor");
    expect(parsed.coordinates).toEqual({ lat: 23.7715, lng: 90.3589 });
    expect(resolution.matchType).toBe("fuzzy");
    expect(resolution.matchedArea?.id).toBe("dhk-adabar");
  });

  it("parses legacy address_components and resolves district-level Shajahanpur", () => {
    const legacyPlace = {
      formatted_address: "Shahjahanpur, Bogura District, Bangladesh",
      geometry: { location: { lat: 24.7828, lng: 89.3951 } },
      address_components: [
        { long_name: "Shahjahanpur", types: ["neighborhood"] },
        { long_name: "Bogra District", types: ["administrative_area_level_2"] },
      ],
    };

    const parsed = parseGooglePlace(legacyPlace);
    expect(parsed.city).toBe("Bogura");
    expect(parsed.subArea).toBe("Shahjahanpur");

    const { resolution } = resolveAreaFromGooglePlace(legacyPlace, SAMPLE_AREAS);
    expect(resolution.matchedArea?.id).toBe("bgr-shajahanpur");
  });
});
