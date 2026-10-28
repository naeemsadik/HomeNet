import type { WizardMediaItem } from "../../stores/propertyWizardStore";
import { uploadLocalMedia, type StoredMedia } from "../localMedia";

const local = (id: string, mediaType: "image" | "video" = "image"): WizardMediaItem => ({
  id,
  url: `blob:${id}`,
  displayOrder: 0,
  mediaType,
  file: { uri: `file:///${id}`, name: `${id}.jpg`, type: "image/jpeg" },
  name: `${id}.jpg`,
});

const stored = (id: string): WizardMediaItem => ({ id, url: `https://cdn/${id}`, displayOrder: 0, mediaType: "image" });

describe("uploadLocalMedia", () => {
  it("uploads only what is still on the device, in order, keeping each one's place", async () => {
    const items = [stored("s1"), local("a"), local("b", "video")];
    const calls: [string, string, number][] = [];
    const swapped: string[] = [];
    await uploadLocalMedia(
      items,
      async (file, type, order): Promise<StoredMedia> => {
        calls.push([(file as { name: string }).name, type, order]);
        return { id: `srv-${order}`, url: `https://cdn/${order}`, display_order: order, media_type: type };
      },
      (localId, item) => swapped.push(`${localId}->${item.id}`),
    );
    expect(calls).toEqual([
      ["a.jpg", "image", 1],
      ["b.jpg", "video", 2],
    ]);
    expect(swapped).toEqual(["a->srv-1", "b->srv-2"]);
  });

  it("stops at a failed upload, having already swapped the ones before it", async () => {
    const swapped: string[] = [];
    const upload = jest
      .fn()
      .mockResolvedValueOnce({ id: "srv-a", url: "u", display_order: 0, media_type: "image" })
      .mockRejectedValueOnce(new Error("network"));
    await expect(
      uploadLocalMedia([local("a"), local("b"), local("c")], upload, (localId) => swapped.push(localId)),
    ).rejects.toThrow("network");
    expect(swapped).toEqual(["a"]);
    expect(upload).toHaveBeenCalledTimes(2);
  });

  it("reports progress before each upload", async () => {
    const progress: string[] = [];
    await uploadLocalMedia(
      [local("a"), local("b")],
      async (_file, type, order) => ({ id: `s${order}`, url: "u", display_order: order, media_type: type }),
      () => {},
      (done, total) => progress.push(`${done}/${total}`),
    );
    expect(progress).toEqual(["0/2", "1/2"]);
  });
});
