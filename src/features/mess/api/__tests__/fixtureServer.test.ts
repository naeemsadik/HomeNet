import { useAuthStore } from "@/stores/authStore";
import { fixtureBackend } from "../fixtures/server";

jest.useFakeTimers();

/** The fixture backend answers after a short delay; run it out. */
async function settle<T>(promise: Promise<T>): Promise<T> {
  const result = promise.then(
    (value) => ({ value }),
    (error: unknown) => ({ error }),
  );
  await jest.advanceTimersByTimeAsync(1000);
  const outcome = await result;
  if ("error" in outcome) throw outcome.error;
  return outcome.value;
}

function signIn(id: string, emailVerified = true) {
  useAuthStore.setState({
    user: { id, full_name: "Test User", email: `${id}@example.com`, avatar_url: null, email_verified: emailVerified },
  });
}

afterEach(() => useAuthStore.setState({ user: null }));

describe("fixture backend search", () => {
  it("adds walking times for the chosen campus and sorts by the shortest walk", async () => {
    const page = await settle(fixtureBackend.searchMess({ campus_id: "fx-campus-uiu" }, 1, 20));
    expect(page.items.length).toBeGreaterThan(0);
    const walks = page.items.map((item) => item.walk?.walking_min ?? Infinity);
    expect(walks).toEqual([...walks].sort((a, b) => a - b));
    expect(page.items.every((item) => item.walk?.campus_short === "UIU")).toBe(true);
  });

  it("applies the walk, gender, budget and rule filters", async () => {
    const page = await settle(
      fixtureBackend.searchMess({ campus_id: "fx-campus-nsu", max_walk_min: 30, gender: "female", max_all_in: 20000, no_smoking: true }, 1, 20),
    );
    expect(page.items.map((item) => item.id)).toEqual(["fx-mess-3"]);
  });

  it("filters on the cheapest seat's all-in cost, not the rent", async () => {
    const page = await settle(fixtureBackend.searchMess({ max_all_in: 4000 }, 1, 20));
    expect(page.items.every((item) => item.cost.all_in_min <= 4000)).toBe(true);
    expect(page.items.some((item) => item.cost.rent_from < 4000 && item.cost.all_in_min > 4000)).toBe(false);
  });

  it("never puts a phone number in the detail", async () => {
    const detail = await settle(fixtureBackend.getMessDetail("fx-mess-1"));
    expect(JSON.stringify(detail)).not.toMatch(/\+?880/);
  });
});

describe("fixture backend contact", () => {
  it("needs a signed-in account", async () => {
    await expect(settle(fixtureBackend.contactLister("fx-mess-1", "phone"))).rejects.toMatchObject({ status: 401 });
  });

  it("refuses unverified accounts when the lister asked for verified ones only", async () => {
    signIn("seeker-unverified", false);
    await expect(settle(fixtureBackend.contactLister("fx-mess-3", "whatsapp"))).rejects.toMatchObject({ status: 403 });
  });

  it("rate-limits reveals across listings", async () => {
    signIn("seeker-busy");
    const ids = ["fx-mess-1", "fx-mess-2", "fx-mess-4", "fx-mess-5", "fx-mess-6"];
    for (const id of ids) await settle(fixtureBackend.contactLister(id, "phone"));
    await expect(settle(fixtureBackend.contactLister("fx-mess-3", "phone"))).rejects.toMatchObject({ status: 429 });
  });
});

describe("fixture backend listing flow", () => {
  it("refuses an incomplete submit with the reasons, then accepts a complete one", async () => {
    signIn("lister-1");
    const { id } = await settle(fixtureBackend.upsertMess({ subtype: "mess", title: "Seat in Badda" }));
    await expect(settle(fixtureBackend.submitMess(id))).rejects.toMatchObject({ status: 422 });

    await settle(
      fixtureBackend.upsertMess({
        property_id: id,
        location_lat: 23.79,
        location_lng: 90.44,
        mess: {
          gender_policy: "male",
          smoking_policy: "not_allowed",
          meal_system: "none",
          guest_policy: "day_only",
          current_residents: 2,
          total_seats: 4,
          contact_channels: ["phone"],
        },
        seats: [{ room_label: "Room A", seat_type: "shared", beds_in_room: 2, washroom: "common", has_balcony: false, rent: 4000, available_from: "2026-12-01" }],
        charges: (["electricity", "gas", "water", "waste", "internet", "maid", "meal", "service_charge"] as const).map((category) => ({ category, billing: "included" as const })),
      }),
    );
    for (const label of ["room", "washroom", "building"] as const) {
      await settle(fixtureBackend.uploadMessMedia(id, { uri: `file://${label}.jpg`, name: `${label}.jpg`, type: "image/jpeg" }, label));
    }
    await expect(settle(fixtureBackend.submitMess(id))).resolves.toEqual({ id, status: "pending" });

    const mine = await settle(fixtureBackend.getMyMessListings());
    expect(mine.items.map((item) => item.id)).toContain(id);
  });

  it("lets only the owner change a listing", async () => {
    signIn("someone-else");
    await expect(settle(fixtureBackend.setSeatStatus("fx-mess-1", "fx-s1-1", "filled"))).rejects.toMatchObject({ status: 403 });
  });
});
