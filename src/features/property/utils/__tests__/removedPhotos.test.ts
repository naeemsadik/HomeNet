import { applyPhotoEdits, removedPhotos } from "../removedPhotos";

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

describe("applyPhotoEdits", () => {
  it("uploads new photos before it removes the old ones, so the only photo can be swapped", async () => {
    const calls: string[] = [];
    const file = new Blob(["x"]);

    await applyPhotoEdits({
      saved: [saved[0]],
      inForm: [{ uri: "blob:new", file }],
      upload: async () => void calls.push("upload"),
      remove: async (photo) => void calls.push(`remove ${photo.id}`),
    });

    expect(calls).toEqual(["upload", "remove a"]);
  });

  it("uploads only photos that have a file and are not saved yet, and removes only what was taken out", async () => {
    const upload = jest.fn().mockResolvedValue(undefined);
    const remove = jest.fn().mockResolvedValue(undefined);

    await applyPhotoEdits({
      saved,
      inForm: [{ uri: "https://img/a.jpg" }, { uri: "blob:no-file" }],
      upload,
      remove,
    });

    expect(upload).not.toHaveBeenCalled();
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith(saved[1]);
  });

  it("stops at the first failure, so a failed upload never leads to a delete", async () => {
    const remove = jest.fn();

    await expect(
      applyPhotoEdits({
        saved,
        inForm: [{ uri: "blob:new", file: new Blob(["x"]) }],
        upload: async () => {
          throw new Error("upload failed");
        },
        remove,
      }),
    ).rejects.toThrow("upload failed");
    expect(remove).not.toHaveBeenCalled();
  });
});
