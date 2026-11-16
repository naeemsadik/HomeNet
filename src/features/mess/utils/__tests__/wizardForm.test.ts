import { dtoForStep, emptyForm, emptySeat, firstOfNextMonth, formFromDetail, previewCard, type MessListingForm } from "../wizardForm";
import type { MessDetail } from "../../types/mess";

const filled: MessListingForm = {
  ...emptyForm(),
  gender_policy: "male",
  area_id: "a1",
  area_name: "Badda",
  address: " Road 4, Badda ",
  location: { lat: 23.79, lng: 90.44 },
  seats: [{ id: "s1", room_label: "Room A ", seat_type: "single", beds_in_room: 3, washroom: "common", has_balcony: false, rent: 5000, available_from: "2026-12-01", status: "available" }],
  charges: emptyForm().charges.map((charge) =>
    charge.category === "electricity"
      ? { ...charge, billing: "variable", amount_min: 400, amount_max: 550, note: " meter " }
      : charge.category === "gas"
        ? { ...charge, billing: "fixed", amount_min: 250, amount_max: 999 }
        : { ...charge, billing: "included", amount_min: 100 },
  ),
  meal_system: "meal_manager",
  managed_by: "landlord",
  quiet_hours_start: "23:00",
  quiet_hours_end: "07:00",
  title: " Single seat in Badda ",
};

describe("dtoForStep", () => {
  it("sends the place, trimmed, with the gender on the mess", () => {
    expect(dtoForStep("place", filled, null)).toEqual({
      subtype: "mess",
      area_id: "a1",
      address: "Road 4, Badda",
      location_lat: 23.79,
      location_lng: 90.44,
      mess: { gender_policy: "male" },
    });
  });

  it("names the draft once it exists", () => {
    expect(dtoForStep("photos", filled, "d1")).toMatchObject({ property_id: "d1", mess: { contact_channels: ["phone", "whatsapp"] } });
  });

  it("keeps seat ids and makes a single seat one bed", () => {
    const seats = dtoForStep("seats", filled, "d1").seats!;
    expect(seats[0]).toMatchObject({ id: "s1", room_label: "Room A", beds_in_room: 1, rent: 5000, status: "available" });
  });

  it("drops amounts a bill's billing does not use", () => {
    const charges = dtoForStep("costs", filled, "d1").charges!;
    expect(charges.find((charge) => charge.category === "gas")).toEqual({ category: "gas", billing: "fixed", amount_min: 250, amount_max: null, note: null });
    expect(charges.find((charge) => charge.category === "water")).toMatchObject({ amount_min: null, amount_max: null });
    expect(charges.find((charge) => charge.category === "electricity")).toMatchObject({ amount_min: 400, amount_max: 550, note: "meter" });
  });

  it("does not send unanswered bills", () => {
    expect(dtoForStep("costs", emptyForm(), "d1").charges).toEqual([]);
  });

  it("sends blank optional times as null", () => {
    expect(dtoForStep("rules", filled, "d1").mess).toMatchObject({ quiet_hours_start: "23:00", gate_open_time: null, rent_last_revised_at: null });
  });
});

describe("formFromDetail", () => {
  it("round-trips a saved listing back into the form", () => {
    const detail = {
      id: "d1",
      title: "Seat",
      description: null,
      subtype: "mess",
      status: "draft",
      is_verified: false,
      address: "Road 4",
      location_lat: 23.79,
      location_lng: 90.44,
      area: { id: "a1", name: "Badda" },
      lister: null,
      media: [],
      mess: { ...emptyForm(), gender_policy: "female", managed_by: "agent", meal_system: "none", smoking_policy: "allowed", guest_policy: "allowed", quiet_hours_start: null, quiet_hours_end: null, gate_open_time: "05:00", gate_close_time: null, rent_last_revised_at: "2026-01-01T00:00:00Z", all_in_min: 0, all_in_max: 0, costs_complete: false, available_seats: 0, last_confirmed_at: "" },
      seats: [],
      charges: [{ category: "gas", billing: "fixed", amount_min: 250, amount_max: null, note: null }],
      distances: [],
      rules: [],
      created_at: "",
      updated_at: "",
    } as unknown as MessDetail;
    const values = formFromDetail(detail);
    expect(values).toMatchObject({ gender_policy: "female", area_name: "Badda", location: { lat: 23.79, lng: 90.44 }, gate_open_time: "05:00", gate_close_time: "", rent_last_revised_at: "2026-01-01" });
    expect(values.charges).toHaveLength(8);
    expect(values.charges.find((charge) => charge.category === "gas")).toMatchObject({ billing: "fixed", amount_min: 250, note: "" });
    expect(values.charges.find((charge) => charge.category === "water")?.billing).toBeNull();
    expect(values.seats).toHaveLength(1);
  });
});

describe("seats and preview", () => {
  it("duplicates a seat without its server id or status", () => {
    expect(emptySeat(filled.seats[0])).not.toHaveProperty("id");
    expect(emptySeat(filled.seats[0])).not.toHaveProperty("status");
    expect(emptySeat().available_from).toBe(firstOfNextMonth());
  });

  it("builds the card students will see from the answers", () => {
    const card = previewCard(filled, [{ id: "m1", url: "u", label: "room", display_order: 0 }], "d1");
    expect(card.cost).toEqual({ all_in_min: 5650, all_in_max: 5800, rent_from: 5000, costs_complete: true });
    expect(card.rules).toEqual(expect.arrayContaining(["quiet_after_2300", "no_smoking_indoors", "meal_manager", "guests_day_only"]));
    expect(card.cover).toEqual({ url: "u", label: "room" });
  });
});
