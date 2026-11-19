import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLanguageStore } from "@/i18n";
import type { MessCard } from "../../types/mess";
import { MessBrowseScreen } from "../MessBrowseScreen";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});
jest.mock("@/components/AppChrome", () => ({ AppChrome: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
jest.mock("@/components/PageMeta", () => ({ PageMeta: () => null }));
jest.mock("expo-router", () => ({ router: { push: jest.fn() }, useLocalSearchParams: () => ({}) }));
// Leaflet is not loadable in Jest; the stub records how many pins the page asked for.
jest.mock("@/components/PropertyResultsMap", () => ({
  PropertyResultsMap: ({ properties }: { properties: unknown[] }) => <div data-testid="results-map" data-pins={properties.length} />,
}));
jest.mock("../../components/MessListingCard", () => ({
  MessListingCard: ({ item }: { item: MessCard }) => <div data-testid="card">{item.title}</div>,
}));
jest.mock("../../components/MessFilterSheet", () => ({ MessFilterSheet: () => null }));
jest.mock("../../components/UniversityPicker", () => ({ UniversityPicker: () => null }));
jest.mock("../../components/UtilityBreakdown", () => ({ CardBreakdownModal: () => null }));
jest.mock("../../components/DemoNotice", () => ({ DemoNotice: () => null }));
jest.mock("../../hooks/useSeatPreferences", () => ({ useSyncSeatPreferences: () => undefined }));
jest.mock("../../hooks/useUniversities", () => ({
  useUniversities: () => ({ data: [], isSuccess: true }),
  findCampus: () => null,
  campusLabel: () => "",
}));
jest.mock("../../hooks/useMessFilters", () => ({ useMessFilters: () => ({ filters: {}, commit: jest.fn() }) }));
jest.mock("../../hooks/useMessQueries", () => ({ useMessFeed: jest.fn(), prefetchMessDetail: jest.fn() }));

const { useMessFeed } = jest.requireMock("../../hooks/useMessQueries") as { useMessFeed: jest.Mock };

const card = (id: string, pinned: boolean): MessCard =>
  ({
    id,
    title: `Seat ${id}`,
    subtype: "mess",
    area: null,
    location_lat: pinned ? 23.8 : null,
    location_lng: pinned ? 90.4 : null,
    cover: null,
    cost: { all_in_min: 5000, all_in_max: 6000, rent_from: 4000, costs_complete: true },
    rules: [],
    is_verified: false,
    last_confirmed_at: "2026-11-01T00:00:00Z",
  }) as unknown as MessCard;

const feed = (items: MessCard[], total = items.length) => ({
  items,
  total,
  loading: false,
  isError: false,
  hasMore: false,
  fetchingNextPage: false,
  loadMore: jest.fn(),
  refresh: jest.fn(),
});

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

async function render() {
  await act(async () =>
    root.render(
      <QueryClientProvider client={new QueryClient()}>
        <MessBrowseScreen />
      </QueryClientProvider>,
    ),
  );
}

const switchButton = () =>
  [...container.querySelectorAll('[role="button"]')].find((node) => ["Map", "List"].includes(node.textContent?.trim() ?? "")) as
    | HTMLElement
    | undefined;

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

describe("Shared living results map", () => {
  it("offers the map only when a result has a pin", async () => {
    useMessFeed.mockReturnValue(feed([card("a", false), card("b", false)]));
    await render();

    expect(switchButton()).toBeUndefined();
  });

  it("switches to a map of the pinned results and says how many of the listings are on it", async () => {
    useMessFeed.mockReturnValue(feed([card("a", true), card("b", true), card("c", false)], 3));
    await render();
    expect(container.querySelector('[data-testid="results-map"]')).toBeNull();

    await act(async () => switchButton()!.click());

    expect(container.querySelector('[data-testid="results-map"]')?.getAttribute("data-pins")).toBe("2");
    expect(container.textContent).toContain("Showing 2 of 3 listings on the map");
    expect(container.querySelectorAll('[data-testid="card"]')).toHaveLength(0);

    await act(async () => switchButton()!.click());
    expect(container.querySelectorAll('[data-testid="card"]')).toHaveLength(3);
  });

  it("goes back to the list when the pins disappear, and stays there when they return", async () => {
    useMessFeed.mockReturnValue(feed([card("a", true)]));
    await render();
    await act(async () => switchButton()!.click());
    expect(container.querySelector('[data-testid="results-map"]')).not.toBeNull();

    useMessFeed.mockReturnValue(feed([card("a", false)]));
    await render();
    expect(container.querySelector('[data-testid="results-map"]')).toBeNull();

    useMessFeed.mockReturnValue(feed([card("a", true)]));
    await render();
    expect(container.querySelector('[data-testid="results-map"]')).toBeNull();
  });
});
