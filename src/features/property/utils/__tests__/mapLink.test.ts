import { NOT_A_MAPS_LINK, NO_EXACT_SPOT, parseMapLink } from "../mapLink";

const point = (lat: number, lng: number) => ({ kind: "point", point: { lat, lng } });

describe("parseMapLink: long Google Maps links", () => {
  it("prefers the place's own pin over the view centre", () => {
    const url =
      "https://www.google.com/maps/place/Gulshan+2,+Dhaka/@23.7925,90.4078,17z/data=!3m1!4b1!4m6!3m5!1s0x3755c7:0x1!8m2!3d23.7931!4d90.4065!16s%2Fg%2F1";
    expect(parseMapLink(url)).toEqual(point(23.7931, 90.4065));
  });

  it("reads the view centre when there is no pin", () => {
    expect(parseMapLink("https://www.google.com/maps/@23.8103,90.4125,15z")).toEqual(point(23.8103, 90.4125));
    expect(parseMapLink("https://www.google.com/maps/place/Banani/@23.7937,90.4043,16z")).toEqual(point(23.7937, 90.4043));
  });

  it("reads coordinates from the query: q, ll, query, with loc: and an encoded comma", () => {
    expect(parseMapLink("https://maps.google.com/?q=23.8103,90.4125")).toEqual(point(23.8103, 90.4125));
    expect(parseMapLink("https://www.google.com/maps?q=loc:23.8103,90.4125&z=15")).toEqual(point(23.8103, 90.4125));
    expect(parseMapLink("https://www.google.com/maps?ll=23.8103,90.4125&z=15")).toEqual(point(23.8103, 90.4125));
    expect(parseMapLink("https://www.google.com/maps/search/?api=1&query=23.8103%2C90.4125")).toEqual(point(23.8103, 90.4125));
  });

  it("accepts other Google country domains", () => {
    expect(parseMapLink("https://www.google.com.bd/maps/@23.8103,90.4125,15z")).toEqual(point(23.8103, 90.4125));
    expect(parseMapLink("https://www.google.co.uk/maps/@51.5072,-0.1276,15z")).toEqual(point(51.5072, -0.1276));
  });

  it("finds the link inside text copied from a chat, and trims trailing punctuation", () => {
    expect(parseMapLink("My flat: https://www.google.com/maps?q=23.8103,90.4125 thanks")).toEqual(point(23.8103, 90.4125));
    expect(parseMapLink("(https://www.google.com/maps/@23.8103,90.4125,15z).")).toEqual(point(23.8103, 90.4125));
  });

  it("accepts a link pasted without https://", () => {
    expect(parseMapLink("www.google.com/maps/@23.8103,90.4125,15z")).toEqual(point(23.8103, 90.4125));
  });

  it("explains a link that names a place without its exact spot", () => {
    expect(parseMapLink("https://www.google.com/maps/place/Gulshan+2,+Dhaka")).toEqual({
      kind: "invalid",
      message: NO_EXACT_SPOT,
    });
  });
});

describe("parseMapLink: short links", () => {
  it("recognises the links Google Maps' Share button copies on a phone", () => {
    expect(parseMapLink("https://maps.app.goo.gl/AbCdEf123")).toEqual({ kind: "short", url: "https://maps.app.goo.gl/AbCdEf123" });
    expect(parseMapLink("https://goo.gl/maps/xYz9")).toEqual({ kind: "short", url: "https://goo.gl/maps/xYz9" });
    expect(parseMapLink("Location: https://maps.app.goo.gl/AbCdEf123")).toEqual({
      kind: "short",
      url: "https://maps.app.goo.gl/AbCdEf123",
    });
  });
});

describe("parseMapLink: coordinates", () => {
  it("accepts a pasted 'lat, lng' pair", () => {
    expect(parseMapLink("23.8103, 90.4125")).toEqual(point(23.8103, 90.4125));
  });
});

describe("parseMapLink: things that are not usable", () => {
  it("rejects empty text and text with no link", () => {
    for (const text of ["", "   ", "near the big mosque", "23"]) {
      expect(parseMapLink(text)).toEqual({ kind: "invalid", message: NOT_A_MAPS_LINK });
    }
  });

  it("rejects links that are not Google Maps, including look-alike hosts", () => {
    for (const url of [
      "https://example.com/maps?q=23.8,90.4",
      "https://google.com.evil.example/maps/@23.8103,90.4125,15z",
      "https://evilgoogle.com/maps/@23.8103,90.4125,15z",
      "https://maps.app.goo.gl.evil.example/abc",
    ]) {
      expect(parseMapLink(url)).toEqual({ kind: "invalid", message: NOT_A_MAPS_LINK });
    }
  });

  it("rejects coordinates that can't be on Earth", () => {
    expect(parseMapLink("https://www.google.com/maps/@23.8103,912.4125,15z")).toEqual({
      kind: "invalid",
      message: NOT_A_MAPS_LINK,
    });
    expect(parseMapLink("https://www.google.com/maps/@123.8103,90.4125,15z")).toEqual({
      kind: "invalid",
      message: NOT_A_MAPS_LINK,
    });
  });
});
