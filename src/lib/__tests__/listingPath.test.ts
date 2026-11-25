describe("listingPath", () => {
  afterEach(() => jest.resetModules());

  function load(messEnabled: boolean) {
    jest.doMock("@/lib/features", () => ({ ...jest.requireActual("@/lib/features"), MESS_ENABLED: messEnabled }));
    return require("@/lib/listingPath") as typeof import("@/lib/listingPath");
  }

  it("recognises both mess subtypes, whatever the case, and nothing else", () => {
    const { isMessSubtype } = load(true);
    expect(isMessSubtype("mess")).toBe(true);
    expect(isMessSubtype("seat_share")).toBe(true);
    expect(isMessSubtype(" Mess ")).toBe(true);
    expect(isMessSubtype("apartment")).toBe(false);
    expect(isMessSubtype("")).toBe(false);
    expect(isMessSubtype(null)).toBe(false);
    expect(isMessSubtype(undefined)).toBe(false);
  });

  it("sends a mess listing to /mess when the module is on", () => {
    const { listingPath, listingEditPath } = load(true);
    expect(listingPath({ id: "m1", subtype: "mess" })).toBe("/mess/m1");
    expect(listingPath({ id: "m2", subtype: "seat_share" })).toBe("/mess/m2");
    expect(listingEditPath({ id: "m1", subtype: "mess" })).toBe("/mess/edit?id=m1");
  });

  it("keeps every other listing on /property", () => {
    const { listingPath, listingEditPath } = load(true);
    expect(listingPath({ id: "p1", subtype: "apartment" })).toBe("/property/p1");
    expect(listingPath({ id: "p2" })).toBe("/property/p2");
    expect(listingEditPath({ id: "p1", subtype: null })).toBe("/property/edit?id=p1");
  });

  it("keeps mess listings on /property while the module is off, so no link leads to a missing page", () => {
    const { listingPath, listingEditPath } = load(false);
    expect(listingPath({ id: "m1", subtype: "mess" })).toBe("/property/m1");
    expect(listingEditPath({ id: "m1", subtype: "mess" })).toBe("/property/edit?id=m1");
  });

  it("encodes the id", () => {
    const { listingPath } = load(true);
    expect(listingPath({ id: "a/b", subtype: "mess" })).toBe("/mess/a%2Fb");
  });

  describe("readable URLs", () => {
    const ID = "0b6f3c1e-1234-4abc-8def-0123456789ab";

    it("puts the title words before a uuid", () => {
      const { listingPath } = load(true);
      expect(listingPath({ id: ID, title: "3 Bed Flat, Gulshan-1!" })).toBe(`/property/3-bed-flat-gulshan-1-${ID}`);
      expect(listingPath({ id: ID, title: "Seat near BRACU", subtype: "mess" })).toBe(`/mess/seat-near-bracu-${ID}`);
    });

    it("strips accents and keeps the id alone for a title with no Latin words", () => {
      const { listingPath, titleSlug } = load(true);
      expect(titleSlug("Café Résidence")).toBe("cafe-residence");
      expect(listingPath({ id: ID, title: "গুলশানে ফ্ল্যাট" })).toBe(`/property/${ID}`);
      expect(listingPath({ id: ID, title: null })).toBe(`/property/${ID}`);
    });

    it("cuts a long title at a word, within 60 characters", () => {
      const { titleSlug } = load(true);
      const slug = titleSlug("Spacious fully furnished family apartment with lake view and rooftop garden in Gulshan");
      expect(slug.length).toBeLessThanOrEqual(60);
      expect(slug).toBe("spacious-fully-furnished-family-apartment-with-lake-view-and");
    });

    it("keeps a non-uuid id bare, since it could not be read back from the end", () => {
      const { listingPath } = load(true);
      expect(listingPath({ id: "fx-mess-1", title: "Seat", subtype: "mess" })).toBe("/mess/fx-mess-1");
    });

    it("uses the API's slug when it sends one", () => {
      const { listingPath } = load(true);
      expect(listingPath({ id: ID, title: "Flat", slug: "flat-gulshan-k7p2" })).toBe("/property/flat-gulshan-k7p2");
    });

    it("reads the uuid back from any URL form", () => {
      const { listingKeyFromSegment } = load(true);
      expect(listingKeyFromSegment(`3-bed-flat-${ID}`)).toBe(ID);
      expect(listingKeyFromSegment(ID.toUpperCase())).toBe(ID);
      expect(listingKeyFromSegment(`any-words-${ID}`)).toBe(ID);
      expect(listingKeyFromSegment("fx-mess-1")).toBe("fx-mess-1");
      expect(listingKeyFromSegment("flat-gulshan-k7p2")).toBe("flat-gulshan-k7p2");
      expect(listingKeyFromSegment("%E0%A4")).toBe("%E0%A4");
      expect(listingKeyFromSegment(undefined)).toBe("");
    });
  });
});
