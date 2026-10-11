import { coordinateProblem, parseCoordinatePair } from "../coordinates";

describe("parseCoordinatePair", () => {
  it("reads what Google Maps copies", () => {
    expect(parseCoordinatePair("23.8103, 90.4125")).toEqual({ lat: 23.8103, lng: 90.4125 });
    expect(parseCoordinatePair("23.8103,90.4125")).toEqual({ lat: 23.8103, lng: 90.4125 });
    expect(parseCoordinatePair("23.8103 90.4125")).toEqual({ lat: 23.8103, lng: 90.4125 });
    expect(parseCoordinatePair("২৩.৮১০৩, ৯০.৪১২৫")).toEqual({ lat: 23.8103, lng: 90.4125 });
  });

  it("does not take one comma-decimal number for a pair", () => {
    expect(parseCoordinatePair("23,8")).toBeNull();
    expect(parseCoordinatePair("23,8103")).toBeNull();
  });

  it("is null for a single number or text", () => {
    expect(parseCoordinatePair("23.8103")).toBeNull();
    expect(parseCoordinatePair("23.")).toBeNull();
    expect(parseCoordinatePair("hello, 1.5")).toBeNull();
  });
});

describe("coordinateProblem", () => {
  it("passes valid Dhaka coordinates", () => {
    expect(coordinateProblem(23.8103, 90.4125)).toBeNull();
  });

  it("explains a longitude that is out of range, like the 912 that started this", () => {
    expect(coordinateProblem(23, 912)).toMatch(/Longitude must be between -180 and 180/);
  });

  it("explains a latitude out of range and hints at a swap", () => {
    expect(coordinateProblem(90.4125, 23.8103)).toMatch(/swapped/);
  });

  it("asks for each missing value by name", () => {
    expect(coordinateProblem(null, 90.4)).toMatch(/latitude/i);
    expect(coordinateProblem(23.8, null)).toMatch(/longitude/i);
    expect(coordinateProblem(Number.NaN, 90.4)).toMatch(/latitude/i);
  });
});
