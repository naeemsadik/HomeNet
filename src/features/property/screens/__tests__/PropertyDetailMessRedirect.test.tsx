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
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: "m1" }),
}));
jest.mock("@/components/AppChrome", () => ({
  AppChrome: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("@/components/PageMeta", () => ({ PageMeta: () => null }));
jest.mock("@/components/JsonLd", () => ({ JsonLd: () => null }));

const detail = (subtype: string) => ({
  id: "m1",
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
jest.mock("../../hooks/usePropertyDetail", () => ({
  usePropertyDetail: () => ({ data: mockCurrent, error: null, isLoading: false, refetch: jest.fn() }),
  useSimilarProperties: () => ({ data: [], error: null, isLoading: false, refetch: jest.fn() }),
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
