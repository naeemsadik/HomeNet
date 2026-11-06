import { isListingPhoto, listingCover, listingPhotos } from "../listingMedia";

describe("listing photos", () => {
  it("counts a media item with a URL as a photo whatever its type is called, unless it is a video", () => {
    expect(isListingPhoto({ url: "a.jpg", media_type: "image" })).toBe(true);
    expect(isListingPhoto({ url: "a.jpg", media_type: "IMAGE" })).toBe(true);
    expect(isListingPhoto({ url: "a.jpg", media_type: "photo" })).toBe(true);
    expect(isListingPhoto({ url: "a.jpg" })).toBe(true);
    expect(isListingPhoto({ url: "a.mp4", media_type: "video" })).toBe(false);
    expect(isListingPhoto({ url: "a.mp4", media_type: "VIDEO" })).toBe(false);
    expect(isListingPhoto({ url: "", media_type: "image" })).toBe(false);
    expect(isListingPhoto(null)).toBe(false);
  });

  it("lists the photos in display order and leaves videos out", () => {
    const media = [
      { url: "c.jpg", media_type: "IMAGE", display_order: 2 },
      { url: "v.mp4", media_type: "video", display_order: 0 },
      { url: "a.jpg", media_type: "image", display_order: 1 },
    ];
    expect(listingPhotos(media)).toEqual(["a.jpg", "c.jpg"]);
    expect(listingCover(media)).toBe("a.jpg");
    expect(media[0].url).toBe("c.jpg"); // the caller's list is not reordered
    expect(listingCover([])).toBeNull();
    expect(listingPhotos(undefined)).toEqual([]);
  });
});
