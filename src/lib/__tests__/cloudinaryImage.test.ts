import { cdnImage } from "@/lib/cloudinaryImage";

const ORIGINAL = "https://res.cloudinary.com/demo/image/upload/v1788701402/homenet/flat.jpg";

describe("cdnImage", () => {
  it("adds format, quality and width to an untransformed Cloudinary URL", () => {
    expect(cdnImage(ORIGINAL, 640)).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_640/v1788701402/homenet/flat.jpg",
    );
  });

  it("crops to the box when a height is given, rounding both sides", () => {
    expect(cdnImage(ORIGINAL, 639.6, 480.2)).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_640,h_480,c_fill/v1788701402/homenet/flat.jpg",
    );
  });

  it("leaves an already-transformed URL alone", () => {
    const thumb = "https://res.cloudinary.com/demo/image/upload/w_200/v1788701402/homenet/flat.jpg";
    expect(cdnImage(thumb, 640)).toBe(thumb);
  });

  it("returns non-Cloudinary URLs untouched", () => {
    const unsplash = "https://images.unsplash.com/photo-1?w=1200";
    expect(cdnImage(unsplash, 640)).toBe(unsplash);
  });

  it("maps null and undefined to undefined", () => {
    expect(cdnImage(null, 640)).toBeUndefined();
    expect(cdnImage(undefined, 640)).toBeUndefined();
  });
});
