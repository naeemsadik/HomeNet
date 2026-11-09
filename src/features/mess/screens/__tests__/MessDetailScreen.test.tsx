import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLanguageStore } from "@/i18n";
import { ApiError } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { getMessDetail, getUniversities } from "../../api/messApi";
import type { MessDetail } from "../../types/mess";
import { MessDetailScreen } from "../MessDetailScreen";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});
jest.mock("@/components/AppChrome", () => ({
  AppChrome: ({ children, floating }: { children: React.ReactNode; floating?: React.ReactNode }) => (
    <>
      {children}
      {floating}
    </>
  ),
}));
jest.mock("@/components/PageMeta", () => ({ PageMeta: () => null }));
jest.mock("@/features/property/components/PropertyLightbox", () => ({ PropertyLightbox: () => null }));
jest.mock("@/features/property/components/WhatsAppIcon", () => ({ WhatsAppIcon: () => null }));
jest.mock("expo-router", () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false } }));
jest.mock("../../api/messApi", () => ({
  getMessDetail: jest.fn(),
  getUniversities: jest.fn(),
  contactLister: jest.fn(),
  reportMess: jest.fn(),
}));

const DETAIL: MessDetail = {
  id: "m1",
  title: "Single seat in 4-person mess, Notun Bazar",
  description: "Quiet house near the main road.",
  subtype: "mess",
  status: "active",
  is_verified: true,
  address: "Road 4, Notun Bazar",
  location_lat: 23.79,
  location_lng: 90.44,
  area: { id: "a1", name: "Notun Bazar" },
  lister: { id: "owner", full_name: "Rafi", avatar_url: null },
  media: [{ id: "p1", url: "https://example.com/room.jpg", label: "room", display_order: 0 }],
  mess: {
    gender_policy: "male",
    tenant_type: "students_only",
    managed_by: "resident_manager",
    total_rooms: 2,
    total_seats: 4,
    current_residents: 3,
    washroom_count: 1,
    floor_level: 3,
    has_lift: false,
    has_generator: false,
    has_security_guard: true,
    has_cctv: false,
    gate_open_time: null,
    gate_close_time: null,
    smoking_policy: "not_allowed",
    quiet_hours_start: "23:00",
    quiet_hours_end: "07:00",
    study_friendly: true,
    guest_policy: "day_only",
    meal_system: "meal_manager",
    maid_service: true,
    vibe_tags: ["quiet"],
    security_deposit: null,
    advance_months: 1,
    notice_period_days: 30,
    rent_last_revised_at: "2026-01-01",
    contact_channels: ["phone", "whatsapp"],
    verified_seekers_only: false,
    all_in_min: 6050,
    all_in_max: 6200,
    costs_complete: true,
    available_seats: 1,
    last_confirmed_at: new Date().toISOString(),
  },
  seats: [
    { id: "s1", room_label: "Room B", seat_type: "single", beds_in_room: 1, washroom: "common", has_balcony: false, rent: 5000, available_from: "2020-01-01", status: "available" },
    { id: "s2", room_label: "Room A", seat_type: "shared", beds_in_room: 2, washroom: "common", has_balcony: false, rent: 4200, available_from: "2020-01-01", status: "filled" },
  ],
  charges: [
    { category: "electricity", billing: "variable", amount_min: 400, amount_max: 550, note: null },
    { category: "gas", billing: "fixed", amount_min: 250, amount_max: null, note: null },
    { category: "water", billing: "included", amount_min: null, amount_max: null, note: null },
    { category: "waste", billing: "fixed", amount_min: 50, amount_max: null, note: null },
    { category: "internet", billing: "fixed", amount_min: 150, amount_max: null, note: null },
    { category: "maid", billing: "fixed", amount_min: 200, amount_max: null, note: null },
    { category: "meal", billing: "not_applicable", amount_min: null, amount_max: null, note: null },
    { category: "service_charge", billing: "not_applicable", amount_min: null, amount_max: null, note: null },
  ],
  distances: [{ campus_id: "c-uiu", campus_name: "United City", university_short: "UIU", walking_min: 12, walking_m: 950, approximate: false }],
  rules: ["quiet_after_2300", "no_smoking_indoors", "meal_manager", "guests_day_only", "study_friendly"],
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-11-01T00:00:00Z",
};

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

async function render() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <MessDetailScreen id="m1" />
      </QueryClientProvider>,
    ),
  );
  await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  return container.textContent ?? "";
}

beforeEach(() => {
  jest.clearAllMocks();
  useLanguageStore.getState().setLanguage("en");
  useAuthStore.setState({ user: null });
  (getUniversities as jest.Mock).mockResolvedValue([]);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("MessDetailScreen", () => {
  it("lays the sections out in the order students decide: cost, location, rooms, rules, photos, governance", async () => {
    (getMessDetail as jest.Mock).mockResolvedValue(DETAIL);
    const text = await render();
    const order = ["Monthly cost", "Location and safety", "Rooms and roommates", "House rules and vibe", "Photos", "Who runs it"].map((heading) =>
      text.indexOf(heading),
    );
    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
  });

  it("shows the cost breakdown inline, for the cheapest open seat", async () => {
    (getMessDetail as jest.Mock).mockResolvedValue(DETAIL);
    const text = await render();
    expect(text).toContain("৳ 6,050 to ৳ 6,200");
    expect(text).toContain("All-in total৳ 6,050 to ৳ 6,200");
    expect(text).toContain("12 min · 950 m");
    expect(text).toContain("3 living here");
  });

  it("lists what the lister left blank under Before you call", async () => {
    (getMessDetail as jest.Mock).mockResolvedValue(DETAIL);
    const text = await render();
    expect(text).toContain("Before you call, ask about");
    expect(text).toContain("Gate opening and closing times");
    expect(text).toContain("The security deposit");
    expect(text).not.toContain("The notice period");
  });

  it("shows the contact bar to a visitor but not to the lister", async () => {
    (getMessDetail as jest.Mock).mockResolvedValue(DETAIL);
    expect(await render()).toContain("Free. Sign in to see the number.");

    await act(async () => root.unmount());
    root = createRoot(container);
    useAuthStore.setState({ user: { id: "owner", full_name: "Rafi", email: "r@example.com", avatar_url: null } });
    const text = await render();
    expect(text).not.toContain("Sign in to see the number");
    expect(text).toContain("Edit listing");
  });

  it("says when a listing is gone", async () => {
    (getMessDetail as jest.Mock).mockRejectedValue(new ApiError("Not found", 404));
    const text = await render();
    expect(text).toContain("This listing is not available any more.");
    expect(text).toContain("See other seats");
  });

  it("offers a retry when loading failed for another reason", async () => {
    (getMessDetail as jest.Mock).mockRejectedValue(new ApiError("Server error", 500));
    const text = await render();
    expect(text).toContain("Could not load this listing.");
    expect(text).toContain("Try again");
  });
});
