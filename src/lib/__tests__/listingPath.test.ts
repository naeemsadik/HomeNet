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
});
