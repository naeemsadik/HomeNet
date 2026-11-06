import { buildSnapshotJson, oncePerBuild, setBuildSnapshot } from "@/lib/buildTimeApi";

describe("build snapshots", () => {
  it("keeps a page's data for its render", () => {
    setBuildSnapshot("/property/kept", { title: "Flat" });
    expect(JSON.parse(buildSnapshotJson("/property/kept")!)).toEqual({ title: "Flat" });
  });

  it("keeps nothing for a failed fetch", () => {
    setBuildSnapshot("/property/failed", null);
    expect(buildSnapshotJson("/property/failed")).toBeUndefined();
  });

  it("keeps an area with no listings, which is known to be empty", () => {
    setBuildSnapshot("/buy/empty", { items: [], total: 0 });
    expect(JSON.parse(buildSnapshotJson("/buy/empty")!)).toEqual({ items: [], total: 0 });
  });

  it("cannot be closed by a listing's own text", () => {
    const title = "</script><script>alert(1)</script> & co\u2028";
    setBuildSnapshot("/property/hostile", { title });
    const json = buildSnapshotJson("/property/hostile")!;
    expect(json).not.toMatch(/[<>&\u2028]/);
    expect(JSON.parse(json).title).toBe(title);
  });
});

describe("oncePerBuild", () => {
  it("runs the work once, however many times Expo asks", async () => {
    const work = jest.fn(async () => [{ id: "1" }]);
    const first = await oncePerBuild("test-once", work);
    const second = await oncePerBuild("test-once", work);
    expect(work).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });
});
