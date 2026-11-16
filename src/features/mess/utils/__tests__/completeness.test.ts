import { CHARGE_CATEGORIES } from "../../constants/vocabulary";
import type { CompletenessInput } from "../completeness";
import { completenessChecks, missingForSubmit } from "../completeness";

function completeListing(): CompletenessInput {
  return {
    mess: {
      gender_policy: "male",
      smoking_policy: "not_allowed",
      meal_system: "meal_manager",
      guest_policy: "day_only",
      current_residents: 3,
      total_seats: 4,
      contact_channels: ["phone"],
    },
    seats: [{ status: "available" }],
    charges: CHARGE_CATEGORIES.map((category) => ({ category, billing: "included" as const })),
    media: [{ label: "room" }, { label: "washroom" }, { label: "building" }],
    location_lat: 23.79,
    location_lng: 90.42,
  };
}

describe("completenessChecks (PRD 2.3.4)", () => {
  it("passes a complete listing", () => {
    expect(missingForSubmit(completeListing())).toEqual([]);
    expect(completenessChecks(completeListing()).every((check) => check.ok)).toBe(true);
  });

  it("names every missing part of an empty draft", () => {
    const missing = missingForSubmit({ mess: null, seats: [], charges: [], media: [], location_lat: null, location_lng: null });
    expect(missing).toEqual([
      "pin",
      "gender_policy",
      "current_residents",
      "available_seat",
      "costs",
      "smoking_policy",
      "meal_system",
      "guest_policy",
      "photo_room",
      "photo_washroom",
      "photo_building",
      "contact_channels",
    ]);
  });

  it("needs every bill category answered, not just some", () => {
    const listing = completeListing();
    listing.charges = listing.charges.slice(1);
    expect(missingForSubmit(listing)).toEqual(["costs"]);
  });

  it("needs an available seat: reserved and filled seats do not count", () => {
    const listing = completeListing();
    listing.seats = [{ status: "reserved" }, { status: "filled" }];
    expect(missingForSubmit(listing)).toEqual(["available_seat"]);
  });

  it("needs each required photo label, whatever optional photos there are", () => {
    const listing = completeListing();
    listing.media = [{ label: "room" }, { label: "kitchen" }, { label: null }];
    expect(missingForSubmit(listing)).toEqual(["photo_washroom", "photo_building"]);
  });

  it("refuses more residents than seats, and accepts zero residents", () => {
    const listing = completeListing();
    listing.mess = { ...listing.mess, current_residents: 5, total_seats: 4 };
    expect(missingForSubmit(listing)).toEqual(["residents_fit"]);
    listing.mess = { ...listing.mess, current_residents: 0 };
    expect(missingForSubmit(listing)).toEqual([]);
  });

  it("needs both halves of the pin", () => {
    const listing = completeListing();
    listing.location_lng = null;
    expect(missingForSubmit(listing)).toEqual(["pin"]);
  });
});
