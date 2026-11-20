import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  archiveMess,
  confirmAvailable,
  deleteMess,
  getMyMessListings,
  setSeatStatus,
} from "@/features/mess/api/messApi";
import type { MyMessListing } from "@/features/mess/types/mess";
import { useLanguageStore } from "@/i18n";
import { confirmAction } from "@/lib/alert";
import { deleteProperty, getMyProperties } from "@/services/propertyApi";
import { useAuthStore } from "@/stores/authStore";
import type { Property } from "../../types/property";
import { MyPropertiesScreen } from "../MyPropertiesScreen";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockLayout = { phone: false };
const mockFlags = { mess: true };

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});
jest.mock("@/features/seller/components/SellerShell", () => ({
  SellerShell: ({ children, onSearchQueryChange }: { children: React.ReactNode; onSearchQueryChange?: (q: string) => void }) => (
    <>
      <button type="button" data-testid="search" onClick={() => onSearchQueryChange?.("nowhere at all")} />
      {children}
    </>
  ),
}));
jest.mock("@/hooks/useResponsive", () => ({
  ...jest.requireActual("@/hooks/useResponsive"),
  useResponsive: () => ({ isPhone: mockLayout.phone, isTablet: mockLayout.phone, isDesktop: !mockLayout.phone }),
}));
jest.mock("@/lib/features", () => ({
  ...jest.requireActual("@/lib/features"),
  get MESS_ENABLED() {
    return mockFlags.mess;
  },
  MESS_DEMO: false,
}));
jest.mock("@/lib/alert", () => ({ confirmAction: jest.fn(), notify: jest.fn() }));
jest.mock("@/lib/toast", () => ({ showToast: jest.fn() }));
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  Link: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("@/features/mess/api/messApi", () => ({
  getMyMessListings: jest.fn(),
  confirmAvailable: jest.fn(),
  setSeatStatus: jest.fn(),
  archiveMess: jest.fn(),
  deleteMess: jest.fn(),
  publishMess: jest.fn(),
}));
jest.mock("@/services/propertyApi", () => ({
  getMyProperties: jest.fn(),
  archiveProperty: jest.fn(),
  deleteProperty: jest.fn(),
  publishProperty: jest.fn(),
  unarchiveProperty: jest.fn(),
}));

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

const SEAT: MyMessListing = {
  id: "m1",
  title: "Single seat in 4-person mess, Notun Bazar",
  subtype: "mess",
  status: "active",
  area: { id: "a1", name: "Notun Bazar" },
  cover: null,
  seats: [
    { id: "s1", room_label: "Room B", seat_type: "single", beds_in_room: 1, washroom: "common", has_balcony: false, rent: 5000, available_from: "2026-12-01", status: "available" },
    { id: "s2", room_label: "Room A", seat_type: "shared", beds_in_room: 2, washroom: "common", has_balcony: false, rent: 4200, available_from: "2026-12-01", status: "filled" },
  ],
  available_seats: 1,
  all_in_min: 6050,
  all_in_max: 6200,
  costs_complete: true,
  last_confirmed_at: daysAgo(2),
  reveals_7d: 4,
};

const FLAT = {
  id: "p1",
  title: "Flat in Banani",
  status: "active",
  subtype: null,
  type: "residential",
  listing_type: "sale",
  price: 9_500_000,
  price_currency: "BDT",
  media: [],
  view_count: 12,
  area: { id: "a2", name: "Banani" },
  created_at: "2026-01-01T00:00:00Z",
} as unknown as Property;

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

/** The page's text, reading a no-break space (it holds ৳ to its amount) as a space. */
const text = () => (container.textContent ?? "").replace(/\u00a0/g, " ");
const everywhere = () => [...document.querySelectorAll('[role="button"], [role="menuitem"], [role="link"], button, a')] as HTMLElement[];
const byText = (value: string) => everywhere().find((el) => el.textContent?.trim() === value);
const byLabel = (label: string) => document.querySelector(`[aria-label="${label}"]`) as HTMLElement | null;
/** Lets queries, confirm dialogs and mutations settle: each step waits on the one before. */
const flush = async () => {
  for (let i = 0; i < 3; i++) await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
};
const click = async (el: HTMLElement | null | undefined) => {
  expect(el).toBeTruthy();
  await act(async () => el!.click());
  await flush();
};

function page<T>(items: T[], pageNo = 1, total = items.length, limit = 20) {
  return { items, total, page: pageNo, limit };
}

async function render({ seats = [] as MyMessListing[], properties = [] as Property[] } = {}) {
  (getMyMessListings as jest.Mock).mockResolvedValue(page(seats, 1, seats.length, 50));
  (getMyProperties as jest.Mock).mockResolvedValue({ success: true, message: "OK", data: page(properties) });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <MyPropertiesScreen />
      </QueryClientProvider>,
    ),
  );
  await flush();
}

async function rerender(args: Parameters<typeof render>[0]) {
  await act(async () => root.unmount());
  root = createRoot(container);
  await render(args);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockLayout.phone = false;
  mockFlags.mess = true;
  useLanguageStore.getState().setLanguage("en");
  useAuthStore.setState({ user: { id: "owner", full_name: "Rafi", email: "r@example.com", avatar_url: null } });
  (confirmAvailable as jest.Mock).mockResolvedValue(undefined);
  (setSeatStatus as jest.Mock).mockResolvedValue(undefined);
  (archiveMess as jest.Mock).mockResolvedValue(undefined);
  (deleteMess as jest.Mock).mockResolvedValue(undefined);
  (deleteProperty as jest.Mock).mockResolvedValue({ success: true, message: "OK", data: { id: "p1" } });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("My listings with seat listings in it", () => {
  it("shows a seat listing and a property in one list, the seat listing tagged Shared living", async () => {
    await render({ seats: [SEAT], properties: [FLAT] });
    expect(text()).toContain("Single seat in 4-person mess, Notun Bazar");
    expect(text()).toContain("Flat in Banani");
    expect(text()).toContain("Shared living");
    expect(text()).toContain("Live");
    expect(text()).toContain("1 of 2 seats open");
    expect(text()).toContain("৳ 6,050 to ৳ 6,200");
    expect(text()).toContain("Last confirmed 2 days ago");
    expect(byLabel("All, 2")).toBeTruthy();
    expect(byLabel("Active, 2")).toBeTruthy();
    // Seat listings first.
    expect(text().indexOf("Notun Bazar")).toBeLessThan(text().indexOf("Flat in Banani"));
  });

  it("opens the seats, which change state, and asks before the last open seat is filled", async () => {
    await render({ seats: [SEAT] });
    const toggle = byLabel(`Seats in ${SEAT.title}`);
    expect(toggle?.getAttribute("aria-expanded")).toBe("false");
    await click(toggle);
    expect(byLabel(`Seats in ${SEAT.title}`)?.getAttribute("aria-expanded")).toBe("true");
    expect(text()).toContain("4 students got your number this week");

    (confirmAction as jest.Mock).mockResolvedValueOnce(false);
    await click(byLabel("Mark filled: Room B · Single room"));
    expect(setSeatStatus).not.toHaveBeenCalled();
    (confirmAction as jest.Mock).mockResolvedValueOnce(true);
    await click(byLabel("Mark filled: Room B · Single room"));
    expect(setSeatStatus).toHaveBeenCalledWith("m1", "s1", "filled");

    await click(byLabel("Mark open: Room A · Shared room"));
    expect(setSeatStatus).toHaveBeenCalledWith("m1", "s2", "available");
  });

  it("confirms a listing is still available", async () => {
    await render({ seats: [SEAT] });
    await click(byLabel(`Seats in ${SEAT.title}`));
    await click(byLabel(`Still available: ${SEAT.title}`));
    expect(confirmAvailable).toHaveBeenCalledWith("m1");
  });

  it("opens a listing that needs confirming by itself, and says when search has hidden it", async () => {
    await render({ seats: [{ ...SEAT, last_confirmed_at: daysAgo(35) }] });
    expect(text()).toContain("Hidden from search: not confirmed for 35 days.");
    expect(byLabel(`Seats in ${SEAT.title}`)?.getAttribute("aria-expanded")).toBe("true");
    expect(byLabel(`Still available: ${SEAT.title}`)).toBeTruthy();
  });

  it("deletes a seat listing through the mess API and a property through the property API", async () => {
    (confirmAction as jest.Mock).mockResolvedValue(true);
    await render({ seats: [SEAT], properties: [FLAT] });

    await click(byLabel(`Actions for ${SEAT.title}`));
    await click(byLabel(`Delete: ${SEAT.title}`));
    expect(deleteMess).toHaveBeenCalledWith("m1");
    expect(deleteProperty).not.toHaveBeenCalled();

    await click(byLabel("Actions for Flat in Banani"));
    await click(byLabel("Delete: Flat in Banani"));
    // useDeleteProperty hands the API function TanStack's context as a second argument.
    expect((deleteProperty as jest.Mock).mock.calls[0][0]).toBe("p1");
  });

  it("archives a live seat listing through the mess API", async () => {
    (confirmAction as jest.Mock).mockResolvedValue(true);
    await render({ seats: [SEAT] });
    await click(byLabel(`Actions for ${SEAT.title}`));
    await click(byLabel(`Archive: ${SEAT.title}`));
    expect(archiveMess).toHaveBeenCalledWith("m1");
  });

  it("offers to continue an unfinished seat listing, with no confirmation or seat buttons", async () => {
    mockLayout.phone = true;
    await render({ seats: [{ ...SEAT, status: "draft", reveals_7d: 0 }] });
    expect(text()).toContain("Draft");
    expect(byText("Continue editing")).toBeTruthy();
    // Its page would look live to the owner; the old seat screen offered View only once submitted.
    expect(byText("View")).toBeUndefined();
    expect(text()).not.toContain("Still available");
    expect(text()).not.toContain("Mark filled");
  });

  it("shows the phone card with Still available as its main action", async () => {
    mockLayout.phone = true;
    await render({ seats: [SEAT], properties: [FLAT] });
    expect(byLabel(`Still available: ${SEAT.title}`)).toBeTruthy();
    expect(text()).toContain("4 students got your number this week");
    // Seats stay folded until asked for.
    expect(text()).not.toContain("Mark filled");
    await click(byLabel(`Seats in ${SEAT.title}`));
    expect(byLabel("Mark filled: Room B · Single room")).toBeTruthy();
  });
});

describe("My listings when there is nothing to show", () => {
  it("says there are no listings yet, and mentions seats only with Shared living on", async () => {
    await render();
    expect(text()).toContain("No listings yet");
    expect(text()).toContain("or list a vacant seat in shared living");
    expect(byText("List a vacant seat")).toBeTruthy();

    mockFlags.mess = false;
    await rerender({});
    expect(text()).toContain("No listings yet");
    expect(text()).not.toContain("vacant seat");
    expect(getMyMessListings).toHaveBeenCalledTimes(1);
  });

  it("names the filter that has nothing under it, for a seller with only seat listings", async () => {
    await render({ seats: [SEAT] });
    await click(byLabel("Sold, 0"));
    expect(text()).toContain("You have no listings under Sold.");
  });

  it("names the search that matched nothing", async () => {
    await render({ properties: [FLAT] });
    await click(container.querySelector('[data-testid="search"]') as HTMLElement);
    expect(text()).toContain("No listings match “nowhere at all”.");
  });

  it("keeps the properties on screen when the seat listings fail to load", async () => {
    (getMyProperties as jest.Mock).mockResolvedValue({ success: true, message: "OK", data: page([FLAT]) });
    (getMyMessListings as jest.Mock).mockRejectedValue(new Error("Not found"));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          <MyPropertiesScreen />
        </QueryClientProvider>,
      ),
    );
    await flush();
    expect(text()).toContain("Flat in Banani");
    expect(text()).toContain("Your seat listings did not load.");
  });
});

describe("Load more with both kinds in the list", () => {
  it("fetches the next page of whichever kind has one", async () => {
    (getMyProperties as jest.Mock)
      .mockResolvedValueOnce({ success: true, message: "OK", data: page([FLAT], 1, 2, 1) })
      .mockResolvedValueOnce({ success: true, message: "OK", data: page([{ ...FLAT, id: "p2", title: "Duplex in Gulshan" }], 2, 2, 1) });
    (getMyMessListings as jest.Mock).mockResolvedValue(page([SEAT], 1, 1, 50));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          <MyPropertiesScreen />
        </QueryClientProvider>,
      ),
    );
    await flush();
    expect(byLabel("All, 2")).toBeTruthy();

    await click(byText("Load more"));
    expect(getMyProperties).toHaveBeenLastCalledWith({ page: 2, limit: 20 });
    expect(getMyMessListings).toHaveBeenCalledTimes(1);
    expect(text()).toContain("Duplex in Gulshan");
    expect(byLabel("All, 3")).toBeTruthy();
    expect(byText("Load more")).toBeUndefined();
  });
});
