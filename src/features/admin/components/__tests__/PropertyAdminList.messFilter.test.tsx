import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLanguageStore } from "@/i18n";
import { getAdminProperties } from "@/services/propertyApi";
import type { PropertyAdminItem } from "../../types/admin";
import { useAdminProperties } from "../../hooks/useAdminProperties";
import { PropertyAdminList } from "../PropertyAdminList";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});
jest.mock("@/services/propertyApi", () => ({
  getAdminProperties: jest.fn(),
  adminUpdateProperty: jest.fn(),
  adminDeleteProperty: jest.fn(),
}));

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

beforeEach(() => {
  jest.clearAllMocks();
  useLanguageStore.getState().setLanguage("en");
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

const row = (overrides: Partial<PropertyAdminItem>) =>
  ({
    id: "p1",
    title: "Listing",
    price: 6050,
    price_currency: "BDT",
    status: "pending",
    subtype: null,
    media: [],
    created_at: "2026-11-01T00:00:00Z",
    ...overrides,
  }) as PropertyAdminItem;

function list(props: Partial<React.ComponentProps<typeof PropertyAdminList>>) {
  return (
    <PropertyAdminList
      properties={[]}
      total={0}
      isLoading={false}
      isMutating={false}
      activeStatus="all"
      searchQuery=""
      onStatusChange={jest.fn()}
      onSearchChange={jest.fn()}
      onApprove={jest.fn()}
      onReject={jest.fn()}
      onDelete={jest.fn()}
      onView={jest.fn()}
      {...props}
    />
  );
}

describe("Admin listings: the Mess & seats filter", () => {
  it("offers the filter when the screen passes a handler, and toggles it", async () => {
    const onMessOnlyChange = jest.fn();
    await act(async () => root.render(list({ messOnly: false, onMessOnlyChange })));
    const chip = container.querySelector('[role="switch"][aria-label="Mess & Seats"]') as HTMLElement;
    expect(chip).not.toBeNull();
    expect(chip.getAttribute("aria-checked")).toBe("false");
    await act(async () => chip.click());
    expect(onMessOnlyChange).toHaveBeenCalledWith(true);
  });

  it("is left out when the mess module is off (no handler)", async () => {
    await act(async () => root.render(list({})));
    expect(container.querySelector('[role="switch"]')).toBeNull();
  });

  it("tags mess and seat-share rows so a moderator can tell them apart", async () => {
    await act(async () =>
      root.render(
        list({
          properties: [row({ id: "m1", title: "Seat A", subtype: "mess" }), row({ id: "m2", title: "Seat B", subtype: "seat_share" }), row({ id: "p3", title: "Flat C", subtype: "apartment" })],
          total: 3,
        }),
      ),
    );
    const text = container.textContent ?? "";
    expect(text).toContain("Seat AMess");
    expect(text).toContain("Seat BSeat share");
    expect(text).not.toContain("Flat CMess");
  });
});

describe("useAdminProperties", () => {
  it("asks the API for mess listings only when the filter is on", async () => {
    (getAdminProperties as jest.Mock).mockResolvedValue({ data: { items: [], total: 0, page: 1, limit: 20 } });
    function Probe({ subtype }: { subtype?: string }) {
      useAdminProperties({ subtype });
      return null;
    }
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          <Probe subtype="mess,seat_share" />
        </QueryClientProvider>,
      ),
    );
    expect(getAdminProperties).toHaveBeenCalledWith(expect.objectContaining({ subtype: "mess,seat_share", page: 1 }));

    (getAdminProperties as jest.Mock).mockClear();
    await act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          <Probe />
        </QueryClientProvider>,
      ),
    );
    expect(getAdminProperties).toHaveBeenCalledWith(expect.not.objectContaining({ subtype: expect.anything() }));
  });
});
