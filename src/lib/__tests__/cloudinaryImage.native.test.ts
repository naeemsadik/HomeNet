import { cdnImage, stockImage } from "@/lib/cloudinaryImage";
import { listingShareImage } from "@/lib/listingMeta";
import type { PropertyDetail } from "@/features/property/hooks/usePropertyDetail";

const ORIGINAL = "https://res.cloudinary.com/demo/image/upload/v1788701402/homenet/flat.jpg";

describe("images in the Android app", () => {
  it("asks Cloudinary for WebP outright, since the app does not negotiate a format like a browser", () => {
    expect(cdnImage(ORIGINAL, 640)).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_webp,q_auto,w_640/v1788701402/homenet/flat.jpg",
    );
  });

  it("keeps the crop and the avatar cache-buster", () => {
    expect(cdnImage(`${ORIGINAL}?v=3`, 256, 256)).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_webp,q_auto,w_256,h_256,c_fill/v1788701402/homenet/flat.jpg?v=3",
    );
  });

  it("asks Unsplash for WebP instead of auto=format", () => {
    expect(stockImage("https://images.unsplash.com/photo-1?auto=format&fit=crop&w=800&q=80")).toBe(
      "https://images.unsplash.com/photo-1?fm=webp&fit=crop&w=800&q=80",
    );
  });

  it("does not touch other URLs, or a local file", () => {
    expect(stockImage("https://example.com/a.png")).toBe("https://example.com/a.png");
    expect(cdnImage("file:///data/photo.jpg", 200)).toBe("file:///data/photo.jpg");
  });

  it("still gives link-preview crawlers a JPEG for the share image", () => {
    const detail = { media: [{ media_type: "image", url: ORIGINAL }] } as unknown as PropertyDetail;
    expect(listingShareImage(detail)).toContain("/f_jpg,");
  });
});
