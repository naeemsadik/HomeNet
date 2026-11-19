import { removedPhotos } from "../removedPhotos";

const saved = [
  { id: "a", url: "https://img/a.jpg" },
  { id: "b", url: "https://img/b.jpg" },
];

describe("removedPhotos", () => {
  it("is empty when every saved photo is still in the form", () => {
    expect(removedPhotos(saved, [{ uri: "https://img/b.jpg" }, { uri: "https://img/a.jpg" }])).toEqual([]);
  });

  it("returns the saved photos the owner took out", () => {
    expect(removedPhotos(saved, [{ uri: "https://img/a.jpg" }])).toEqual([saved[1]]);
  });

  it("ignores photos added in the form, which are not saved yet", () => {
    expect(removedPhotos(saved, [...saved.map((p) => ({ uri: p.url })), { uri: "blob:new" }])).toEqual([]);
  });

  it("returns all of them when the form is empty", () => {
    expect(removedPhotos(saved, [])).toEqual(saved);
  });
});
