import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { useLanguageStore } from "@/i18n";
import { MessListingCard } from "../MessListingCard";
import type { MessCard } from "../../types/mess";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

// The PRD's card example (section 1.5).
const CARD: MessCard = {
  id: "m1",
  title: "Single seat in 4-person mess, Notun Bazar",
  subtype: "mess",
  area: { id: "a1", name: "Notun Bazar" },
  cover: { url: "https://res.cloudinary.com/x/image/upload/v1/room.jpg", label: "room" },
  cost: { all_in_min: 6050, all_in_max: 6200, rent_from: 5000, costs_complete: true },
  walk: { campus_short: "UIU", walking_min: 12, walking_m: 950, approximate: false },
  occupancy: { current_residents: 3, available_seats: 1, per_washroom: 4, washrooms: ["common"] },
  seat_types: ["single"],
  gender_policy: "male",
  rules: ["guests_day_only", "meal_manager", "gate_opens_0500", "no_smoking_indoors", "quiet_after_2300"],
  vibe_tags: ["quiet", "study_focused"],
  is_verified: true,
  preferred_channel: "phone",
  last_confirmed_at: daysAgo(2),
};

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

async function render(node: React.ReactNode) {
  await act(async () => root.render(node));
  return container.textContent ?? "";
}

beforeEach(() => {
  useLanguageStore.getState().setLanguage("en");
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("MessListingCard", () => {
  it("shows the all-in price as the headline, with rent and bills split below", async () => {
    const text = await render(<MessListingCard item={CARD} onPress={jest.fn()} />);
    expect(text).toContain("৳ 6,050 to ৳ 6,200");
    expect(text).toContain("all-in / month");
    expect(text).toContain("Rent ৳ 5,000 + bills ৳ 1,050 to ৳ 1,200");
  });

  it("shows walk time, trust badges and the occupancy snapshot before the tap", async () => {
    const text = await render(<MessListingCard item={CARD} onPress={jest.fn()} />);
    expect(text).toContain("12 min walk to UIU");
    expect(text).toContain("Verified");
    expect(text).toContain("All costs declared");
    expect(text).toContain("3 living here · 1 seat open · 4 per washroom · Common washroom");
  });

  it("shows three rule badges in survey order, then +N", async () => {
    const text = await render(<MessListingCard item={CARD} onPress={jest.fn()} />);
    const quiet = text.indexOf("Quiet after 11:00 pm");
    const smoking = text.indexOf("No smoking indoors");
    const meal = text.indexOf("Meal manager");
    expect(quiet).toBeGreaterThan(-1);
    expect(quiet).toBeLessThan(smoking);
    expect(smoking).toBeLessThan(meal);
    expect(text).not.toContain("Gate opens");
    expect(text).toContain("+2");
  });

  it("puts a rule that matches an active filter first", async () => {
    const text = await render(<MessListingCard item={CARD} onPress={jest.fn()} activeRuleFilters={["gate_opens_0500"]} />);
    expect(text.indexOf("Gate opens 5:00 am")).toBeLessThan(text.indexOf("Quiet after"));
  });

  it("says a distance is approximate when routing fell back to a straight line", async () => {
    const text = await render(<MessListingCard item={{ ...CARD, walk: { ...CARD.walk!, approximate: true, walking_m: 1240 } }} onPress={jest.fn()} />);
    expect(text).toContain("About 1.2 km to UIU");
    expect(text).not.toContain("min walk");
  });

  it("shows freshness only once a confirmation is over a week old", async () => {
    expect(await render(<MessListingCard item={CARD} onPress={jest.fn()} />)).not.toContain("Confirmed available");
    expect(await render(<MessListingCard item={{ ...CARD, last_confirmed_at: daysAgo(9) }} onPress={jest.fn()} />)).toContain("Confirmed available 9 days ago");
  });

  it("says bills are included when they add nothing", async () => {
    const text = await render(<MessListingCard item={{ ...CARD, cost: { ...CARD.cost, all_in_min: 5000, all_in_max: 5000 } }} onPress={jest.fn()} />);
    expect(text).toContain("৳ 5,000");
    expect(text).toContain("Rent ৳ 5,000, bills included");
  });

  it("opens the breakdown from the price without opening the listing", async () => {
    const onPress = jest.fn();
    const onPressPrice = jest.fn();
    await render(<MessListingCard item={CARD} onPress={onPress} onPressPrice={onPressPrice} />);
    const price = container.querySelector('[aria-label^="See what the"]') as HTMLElement;
    await act(async () => price.click());
    expect(onPressPrice).toHaveBeenCalledWith("m1");
    expect(onPress).not.toHaveBeenCalled();
  });

  it("gives screen readers one link that says what the card shows", async () => {
    await render(<MessListingCard item={CARD} onPress={jest.fn()} />);
    const label = container.querySelector('[role="link"]')?.getAttribute("aria-label") ?? "";
    expect(label).toContain(CARD.title);
    expect(label).toContain("৳ 6,050 to ৳ 6,200");
    expect(label).toContain("12 min walk to UIU");
    expect(container.querySelectorAll('[role="link"]')).toHaveLength(1);
  });

  it("renders in Bangla with Bangla digits", async () => {
    useLanguageStore.getState().setLanguage("bn");
    const text = await render(<MessListingCard item={CARD} onPress={jest.fn()} />);
    expect(text).toContain("৳ ৬,০৫০ থেকে ৳ ৬,২০০");
    expect(text).toContain("UIU পর্যন্ত ১২ মিনিট হাঁটা");
    expect(text).toContain("ছেলেদের");
  });
});

describe("MessListingCard save button state", () => {
  it("says whether the listing is saved with aria-pressed", async () => {
    await render(<MessListingCard item={CARD} onPress={jest.fn()} saved onToggleSave={jest.fn()} />);
    expect(container.querySelector('[role="button"][aria-pressed]')?.getAttribute("aria-pressed")).toBe("true");

    await render(<MessListingCard item={CARD} onPress={jest.fn()} saved={false} onToggleSave={jest.fn()} />);
    expect(container.querySelector('[role="button"][aria-pressed]')?.getAttribute("aria-pressed")).toBe("false");
  });
});
