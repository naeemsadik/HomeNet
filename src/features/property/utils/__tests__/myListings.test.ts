import type { MyMessListing } from "@/features/mess/types/mess";
import type { Property } from "../../types/property";
import { countByFilter, matchesFilter, mergeMyListings, rowReadyToPublish, statusWording, type MyListingRow } from "../myListings";

const property = (id: string, fields: Partial<Property> = {}) =>
  ({ id, title: `Flat ${id}`, status: "active", subtype: null, listing_type: "sale", ...fields }) as Property;

const seat = (id: string, fields: Partial<MyMessListing> = {}): MyMessListing => ({
  id,
  title: `Seat ${id}`,
  subtype: "mess",
  status: "active",
  area: null,
  cover: null,
  seats: [],
  available_seats: 0,
  all_in_min: 0,
  all_in_max: 0,
  costs_complete: false,
  last_confirmed_at: new Date().toISOString(),
  reveals_7d: 0,
  ...fields,
});

const ids = (rows: MyListingRow[]) => rows.map((row) => `${row.kind}:${row.id}`);

describe("mergeMyListings", () => {
  it("lists a seller with only properties as property rows, in the API's order", () => {
    expect(ids(mergeMyListings([property("p2"), property("p1")], []))).toEqual(["property:p2", "property:p1"]);
  });

  it("lists a seller with only seat listings as seat rows", () => {
    expect(ids(mergeMyListings([], [seat("m1"), seat("m2")]))).toEqual(["seat:m1", "seat:m2"]);
  });

  it("puts seat listings first, then the properties, each listing once", () => {
    // A seat listing is a Property row, so the property API returns it too.
    const rows = mergeMyListings([property("p1"), property("m1", { subtype: "mess", is_verified: true })], [seat("m1")]);
    expect(ids(rows)).toEqual(["seat:m1", "property:p1"]);
    const first = rows[0];
    expect(first.kind === "seat" && first.property?.is_verified).toBe(true);
  });

  it("keeps a mess listing whose seat details did not load as a Shared living property row", () => {
    const [row] = mergeMyListings([property("m9", { subtype: "seat_share" })], []);
    expect(row).toMatchObject({ kind: "property", sharedLiving: true });
  });

  it("does not repeat a seat listing the mess API sent twice", () => {
    expect(ids(mergeMyListings([], [seat("m1"), seat("m1")]))).toEqual(["seat:m1"]);
  });
});

describe("filters and counts", () => {
  const rows = mergeMyListings(
    [
      property("p-live"),
      property("p-held", { status: "draft", ready_to_publish: true }),
      property("p-review", { status: "pending" }),
      property("p-declined", { status: "rejected" }),
      property("p-sold", { status: "sold" }),
    ],
    [seat("m-live"), seat("m-draft", { status: "draft" }), seat("m-archived", { status: "archived" }), seat("m-review", { status: "pending" })],
  );

  it("counts seat listings under the same pills as properties, so each count matches its rows", () => {
    const counts = countByFilter(rows);
    expect(counts).toEqual({ all: 9, active: 2, draft: 2, pending: 2, rejected: 1, sold: 1, archived: 1 });
    for (const [filter, count] of Object.entries(counts)) {
      expect(rows.filter((row) => matchesFilter(row, filter as keyof typeof counts))).toHaveLength(count);
    }
  });

  it("names the review states the same on every row, and keeps the seat wording otherwise", () => {
    const wording = Object.fromEntries(rows.map((row) => [row.id, statusWording(row)]));
    expect(wording["p-held"]).toEqual({ kind: "ready" });
    expect(wording["p-review"]).toEqual({ kind: "review" });
    expect(wording["m-review"]).toEqual({ kind: "review" });
    expect(wording["p-declined"]).toEqual({ kind: "notApproved" });
    expect(wording["m-live"]).toEqual({ kind: "seat", status: "active" });
    expect(wording["p-live"]).toEqual({ kind: "property", status: "active" });
  });

  it("takes ready to publish from either source for a seat listing", () => {
    const [fromProperty] = mergeMyListings([property("m1", { status: "draft", ready_to_publish: true })], [seat("m1", { status: "draft" })]);
    expect(rowReadyToPublish(fromProperty)).toBe(true);
    const [fromSeat] = mergeMyListings([], [seat("m2", { status: "draft", ready_to_publish: true })]);
    expect(rowReadyToPublish(fromSeat)).toBe(true);
  });
});
