import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { router } from "expo-router";
import { useLanguageStore } from "@/i18n";
// jest.mock calls below are hoisted above this import.
import { PropertyDetailScreen } from "../PropertyDetailScreen";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * A mess listing is a Property row, so /property/:id can be asked for one (an
 * old link, a saved listing). Its page is /mess/:id: the generic page would
 * print the lister's number to anyone, which the mess page reveals only to a
 * signed-in seeker (PRD D6).
 */
jest.mock("@/lib/features", () => ({ ...jest.requireActual("@/lib/features"), MESS_ENABLED: true }));
jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});
let mockSegment = "m1";
// The address of whatever page is on top, which is not always this one.
let mockPathname: string | null = null;
let mockFocused = true;
let mockReturnTo: string | undefined;
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: mockSegment, returnTo: mockReturnTo }),
  usePathname: () => mockPathname ?? `/property/${mockSegment}`,
  useIsFocused: () => mockFocused,
}));
jest.mock("@/components/AppChrome", () => ({
  AppChrome: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("@/components/PageMeta", () => ({ PageMeta: () => null }));
jest.mock("@/components/JsonLd", () => ({ JsonLd: () => null }));

const detail = (subtype: string, id = "m1") => ({
  id,
  title: "Single seat in a 4-person mess",
  description: null,
  type: "residential",
  subtype,
  listing_type: "rent",
  status: "active",
  price: 6050,
  price_currency: "BDT",
  is_verified: false,
  address: "Notun Bazar",
  location_lat: null,
  location_lng: null,
  area: null,
  media: [],
  amenities: {},
  phone: ["01711000000"],
  whatsapp_number: null,
  user: { id: "u1", full_name: "Lister", avatar_url: null, auth_identities: [] },
  created_at: "2026-11-01T00:00:00Z",
  updated_at: "2026-11-01T00:00:00Z",
});

let mockCurrent: ReturnType<typeof detail>;
const mockAskedFor = jest.fn();
jest.mock("../../hooks/usePropertyDetail", () => ({
  usePropertyDetail: (id: string) => {
    mockAskedFor(id);
    return { data: mockCurrent, error: null, isLoading: false, refetch: jest.fn() };
  },
  useSimilarProperties: () => ({ data: [], error: null, isLoading: false, refetch: jest.fn() }),
}));

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

beforeEach(() => {
  jest.clearAllMocks();
  mockSegment = "m1";
  mockPathname = null;
  mockFocused = true;
  mockReturnTo = undefined;
  useLanguageStore.getState().setLanguage("en");
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("PropertyDetailScreen with a mess listing", () => {
  it.each([["mess"], ["seat_share"]])("sends a %s listing to /mess/:id without printing the number", async (subtype) => {
    mockCurrent = detail(subtype);
    await act(async () => root.render(<PropertyDetailScreen />));
    expect(router.replace).toHaveBeenCalledWith("/mess/m1");
    expect(container.textContent).not.toContain("01711000000");
  });

  it("leaves an ordinary listing where it is", async () => {
    mockCurrent = detail("apartment");
    await act(async () => root.render(<PropertyDetailScreen />));
    expect(router.replace).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Single seat in a 4-person mess");
  });
});

describe("PropertyDetailScreen URLs", () => {
  const ID = "0b6f3c1e-1234-4abc-8def-0123456789ab";
  const READABLE = `/property/single-seat-in-a-4-person-mess-${ID}`;

  it("asks the API for the uuid at the end of a readable URL, and stays there", async () => {
    mockSegment = READABLE.slice("/property/".length);
    mockCurrent = detail("apartment", ID);
    await act(async () => root.render(<PropertyDetailScreen />));
    expect(mockAskedFor).toHaveBeenCalledWith(ID);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("moves an old /property/<uuid> link to the readable URL", async () => {
    mockSegment = ID;
    mockCurrent = detail("apartment", ID);
    await act(async () => root.render(<PropertyDetailScreen />));
    expect(mockAskedFor).toHaveBeenCalledWith(ID);
    expect(router.replace).toHaveBeenCalledWith(READABLE);
  });

  // The listing stays mounted under whatever is opened from it. It must not drag
  // the visitor back: that made every menu item and Back look dead.
  it("leaves the visitor alone after they move on to another page", async () => {
    mockSegment = READABLE.slice("/property/".length);
    mockCurrent = detail("apartment", ID);
    await act(async () => root.render(<PropertyDetailScreen />));

    mockPathname = "/rent";
    mockFocused = false;
    await act(async () => root.render(<PropertyDetailScreen />));

    expect(router.replace).not.toHaveBeenCalled();
  });

  it("does not rewrite the address from a screen that is not on top", async () => {
    mockSegment = ID;
    mockFocused = false;
    mockCurrent = detail("apartment", ID);
    await act(async () => root.render(<PropertyDetailScreen />));
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("keeps the return address when it moves to the readable URL", async () => {
    mockSegment = ID;
    mockReturnTo = "/admin/properties";
    mockCurrent = detail("apartment", ID);
    await act(async () => root.render(<PropertyDetailScreen />));
    expect(router.replace).toHaveBeenCalledWith(`${READABLE}?returnTo=%2Fadmin%2Fproperties`);
  });

  it("moves a link with an outdated title to the current one", async () => {
    mockSegment = `old-title-${ID}`;
    mockCurrent = detail("apartment", ID);
    await act(async () => root.render(<PropertyDetailScreen />));
    expect(router.replace).toHaveBeenCalledWith(READABLE);
  });
});
