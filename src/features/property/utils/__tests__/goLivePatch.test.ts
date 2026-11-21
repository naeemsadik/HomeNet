import { goLivePatch } from "../goLivePatch";

describe("goLivePatch", () => {
  it("sends nothing when the owner left the choice alone", () => {
    expect(goLivePatch("edit", true, true)).toEqual({});
    expect(goLivePatch("edit", false, false)).toEqual({});
  });

  it("sends the new value when the owner changed it", () => {
    expect(goLivePatch("edit", false, true)).toEqual({ go_live_on_approval: false });
    expect(goLivePatch("edit", true, false)).toEqual({ go_live_on_approval: true });
  });

  it("never sends it when creating a listing", () => {
    expect(goLivePatch("create", false, true)).toEqual({});
  });
});
