import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLanguageStore } from "@/i18n";
import { confirmAction } from "@/lib/alert";
import { useAuthStore } from "@/stores/authStore";
import { confirmAvailable, getMyMessListings, setSeatStatus } from "../../api/messApi";
import type { MyMessListing } from "../../types/mess";
import { MyMessListingsScreen } from "../MyMessListingsScreen";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});
jest.mock("@/features/seller/components/SellerShell", () => ({ SellerShell: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
jest.mock("@/components/PageMeta", () => ({ PageMeta: () => null }));
jest.mock("@/lib/alert", () => ({ confirmAction: jest.fn(), notify: jest.fn() }));
jest.mock("expo-router", () => ({ router: { push: jest.fn(), replace: jest.fn() } }));
jest.mock("../../api/messApi", () => ({ getMyMessListings: jest.fn(), confirmAvailable: jest.fn(), setSeatStatus: jest.fn() }));

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

const LISTING: MyMessListing = {
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

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

const text = () => container.textContent ?? "";
const byText = (value: string) =>
  ([...container.querySelectorAll('[role="button"], button')] as HTMLElement[]).find((el) => el.textContent?.trim() === value);
const flush = () => act(async () => new Promise((resolve) => setTimeout(resolve, 0)));

async function render(items: MyMessListing[]) {
  (getMyMessListings as jest.Mock).mockResolvedValue({ items, total: items.length, page: 1, limit: 50 });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <MyMessListingsScreen />
      </QueryClientProvider>,
    ),
  );
  await flush();
}

beforeEach(() => {
  jest.clearAllMocks();
  useLanguageStore.getState().setLanguage("en");
  useAuthStore.setState({ user: { id: "owner", full_name: "Rafi", email: "r@example.com", avatar_url: null } });
  (confirmAvailable as jest.Mock).mockResolvedValue(undefined);
  (setSeatStatus as jest.Mock).mockResolvedValue(undefined);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("MyMessListingsScreen", () => {
  it("shows each listing's status, seats, reveals this week and last confirmation", async () => {
    await render([LISTING]);
    expect(text()).toContain("Live");
    expect(text()).toContain("1 of 2 seats open");
    expect(text()).toContain("4 students got your number this week");
    expect(text()).toContain("Last confirmed 2 days ago");
    expect(text()).toContain("৳ 6,050 to ৳ 6,200");
  });

  it("confirms a listing is still available with one tap", async () => {
    await render([LISTING]);
    await act(async () => byText("Still available")!.click());
    await flush();
    expect(confirmAvailable).toHaveBeenCalledWith("m1");
  });

  it("asks before marking the last open seat filled", async () => {
    await render([LISTING]);
    (confirmAction as jest.Mock).mockResolvedValueOnce(false);
    await act(async () => byText("Mark filled")!.click());
    await flush();
    expect(setSeatStatus).not.toHaveBeenCalled();

    (confirmAction as jest.Mock).mockResolvedValueOnce(true);
    await act(async () => byText("Mark filled")!.click());
    await flush();
    expect(setSeatStatus).toHaveBeenCalledWith("m1", "s1", "filled");
  });

  it("reopens a filled seat without asking", async () => {
    await render([LISTING]);
    await act(async () => byText("Mark open")!.click());
    await flush();
    expect(confirmAction).not.toHaveBeenCalled();
    expect(setSeatStatus).toHaveBeenCalledWith("m1", "s2", "available");
  });

  it("says when a listing has dropped out of search for want of confirmation", async () => {
    await render([{ ...LISTING, last_confirmed_at: daysAgo(35) }]);
    expect(text()).toContain("Hidden from search: not confirmed for 35 days.");
  });

  it("offers to continue a draft and to list a first seat when there are none", async () => {
    await render([{ ...LISTING, status: "draft", reveals_7d: 0 }]);
    expect(text()).toContain("Continue editing");
    expect(text()).not.toContain("Still available");

    await act(async () => root.unmount());
    root = createRoot(container);
    await render([]);
    expect(text()).toContain("You have no seat listings yet.");
  });
});
