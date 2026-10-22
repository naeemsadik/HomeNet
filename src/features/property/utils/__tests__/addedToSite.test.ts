import { addedSince, filterAddedSince } from "../addedToSite";

const NOW = Date.parse("2026-10-22T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW - h * 3600_000).toISOString();

describe("addedSince", () => {
  it.each([
    ["24h", 24],
    ["3d", 72],
    ["7d", 168],
    ["14d", 336],
  ])("turns %s into a cutoff %i hours back", (option, hours) => {
    expect(addedSince(option, NOW)).toBe(NOW - hours * 3600_000);
  });

  it.each(["", "anytime", "30d"])("has no cutoff for %p", (option) => {
    expect(addedSince(option, NOW)).toBeNull();
  });
});

describe("filterAddedSince", () => {
  const items = [
    { id: "new", published_at: hoursAgo(2), created_at: hoursAgo(50) },
    { id: "week", published_at: hoursAgo(100), created_at: hoursAgo(100) },
    { id: "old", published_at: hoursAgo(1000), created_at: hoursAgo(1000) },
    { id: "unpublished", published_at: null, created_at: hoursAgo(5) },
    { id: "undated", published_at: null, created_at: null },
  ];
  const ids = (option: string) => filterAddedSince(items, option, NOW).map((i) => i.id);

  it("keeps everything for anytime", () => {
    expect(ids("")).toHaveLength(items.length);
  });

  it("uses when a listing was published, so a listing created long ago but published today counts as new", () => {
    expect(ids("24h")).toEqual(["new", "unpublished"]);
  });

  it("widens with the window", () => {
    expect(ids("7d")).toEqual(["new", "week", "unpublished"]);
    expect(ids("14d")).toEqual(["new", "week", "unpublished"]);
  });

  it("falls back to the creation date when there is no publish date, and drops a listing with neither", () => {
    expect(ids("24h")).toContain("unpublished");
    expect(ids("14d")).not.toContain("undated");
  });
});
