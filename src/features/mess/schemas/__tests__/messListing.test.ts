import { missingPhotos, validateStep } from "../messListing";
import { emptyForm, type MessListingForm } from "../../utils/wizardForm";

const form = (patch: Partial<MessListingForm> = {}): MessListingForm => ({ ...emptyForm(), ...patch });
const paths = (issues: { path: string }[]) => issues.map((issue) => issue.path);
const messages = (issues: { message: string }[]) => issues.map((issue) => issue.message);

describe("place step", () => {
  it("needs who it is for, the area, the address and the pin", () => {
    expect(paths(validateStep("place", form()))).toEqual(expect.arrayContaining(["gender_policy", "area_id", "address", "location"]));
  });

  it("passes once they are given", () => {
    expect(validateStep("place", form({ gender_policy: "male", area_id: "a1", address: "Road 4, Badda", location: { lat: 23.79, lng: 90.44 } }))).toEqual([]);
  });
});

describe("seats step", () => {
  const seat = { ...emptyForm().seats[0], room_label: "Room A", rent: 4500 };

  it("passes the empty form's counts with one priced seat", () => {
    expect(validateStep("seats", form({ seats: [seat] }))).toEqual([]);
  });

  it("names the room and checks the rent of each seat", () => {
    const issues = validateStep("seats", form({ seats: [{ ...seat, room_label: " ", rent: 200 }] }));
    expect(issues).toEqual(
      expect.arrayContaining([
        { path: "seats.0.room_label", message: "mess.validation.roomLabel" },
        { path: "seats.0.rent", message: "mess.validation.rentLow" },
      ]),
    );
  });

  it("does not let residents outnumber the seats", () => {
    expect(validateStep("seats", form({ total_seats: 4, current_residents: 5, seats: [seat] }))).toContainEqual({
      path: "current_residents",
      message: "mess.validation.residents",
    });
  });

  it("does not let residents plus open seats exceed the total", () => {
    expect(validateStep("seats", form({ total_seats: 4, current_residents: 3, seats: [seat, seat] }))).toContainEqual({
      path: "total_seats",
      message: "mess.validation.seatsVsTotal",
    });
  });

  it("does not count filled seats as open", () => {
    expect(validateStep("seats", form({ total_seats: 4, current_residents: 3, seats: [seat, { ...seat, status: "filled" }] }))).toEqual([]);
  });

  it("needs at least one seat", () => {
    expect(validateStep("seats", form({ seats: [] }))).toContainEqual({ path: "seats", message: "mess.validation.seats" });
  });
});

describe("costs step", () => {
  const answered = emptyForm().charges.map((charge) => ({ ...charge, billing: "included" as const }));

  it("needs every bill answered", () => {
    expect(messages(validateStep("costs", form()))).toContain("mess.validation.billing");
    expect(validateStep("costs", form({ charges: answered }))).toEqual([]);
  });

  it("needs an amount for a fixed bill", () => {
    const charges = answered.map((charge, i) => (i === 1 ? { ...charge, billing: "fixed" as const } : charge));
    expect(validateStep("costs", form({ charges }))).toContainEqual({ path: "charges.1.amount_min", message: "mess.validation.amountFixed" });
  });

  it("needs both ends of a varying bill, the high one at least the low one", () => {
    const missing = answered.map((charge, i) => (i === 0 ? { ...charge, billing: "variable" as const, amount_min: 400 } : charge));
    expect(validateStep("costs", form({ charges: missing }))).toContainEqual({ path: "charges.0.amount_max", message: "mess.validation.amountRange" });

    const reversed = answered.map((charge, i) => (i === 0 ? { ...charge, billing: "variable" as const, amount_min: 600, amount_max: 400 } : charge));
    expect(validateStep("costs", form({ charges: reversed }))).toContainEqual({ path: "charges.0.amount_max", message: "mess.validation.amountOrder" });
  });
});

describe("rules step", () => {
  const ready = form({ meal_system: "meal_manager", managed_by: "landlord" });

  it("starts from the defaults the lister confirms, and asks for meals and who runs it", () => {
    expect(paths(validateStep("rules", form()))).toEqual(expect.arrayContaining(["meal_system", "managed_by"]));
    expect(validateStep("rules", ready)).toEqual([]);
  });

  it("checks 24-hour times and keeps quiet hours as a pair", () => {
    expect(validateStep("rules", { ...ready, gate_open_time: "5am" })).toContainEqual({ path: "gate_open_time", message: "mess.validation.time" });
    expect(validateStep("rules", { ...ready, quiet_hours_start: "23:00" })).toContainEqual({ path: "quiet_hours_end", message: "mess.validation.time" });
  });

  it("allows up to five vibe tags", () => {
    const six = ["quiet", "early_risers", "night_owls", "study_focused", "fitness", "clean_freak"] as const;
    expect(validateStep("rules", { ...ready, vibe_tags: [...six] })).toContainEqual({ path: "vibe_tags", message: "mess.validation.vibeMax" });
  });
});

describe("contact, review and photos", () => {
  it("needs a way to be contacted and a title", () => {
    expect(validateStep("photos", form({ contact_channels: [] }))).toContainEqual({ path: "contact_channels", message: "mess.validation.channels" });
    expect(validateStep("review", form({ title: "" }))).toContainEqual({ path: "title", message: "mess.validation.title" });
  });

  it("needs room, washroom and building photos", () => {
    expect(missingPhotos([{ id: "1", url: "u", label: "room", display_order: 0 }]).map((item) => item.label)).toEqual(["washroom", "building"]);
    expect(missingPhotos([])).toHaveLength(3);
  });
});
