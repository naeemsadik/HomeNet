import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLanguageStore } from "@/i18n";
import { getUniversities } from "../../api/messApi";
import type { University } from "../../types/mess";
import { UniversityPicker } from "../UniversityPicker";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});
jest.mock("../../api/messApi", () => ({ getUniversities: jest.fn() }));

const campus = (id: string, university_id: string, name: string) => ({ id, university_id, name, area_id: null, lat: 23.8, lng: 90.4, is_primary: true });
const UNIVERSITIES: University[] = [
  { id: "u-uiu", name: "United International University", short_name: "UIU", city: "Dhaka", campuses: [campus("c-uiu", "u-uiu", "United City")] },
  { id: "u-bracu", name: "BRAC University", short_name: "BRACU", city: "Dhaka", campuses: [campus("c-bracu", "u-bracu", "Merul Badda")] },
];

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

beforeEach(() => {
  useLanguageStore.getState().setLanguage("en");
  (getUniversities as jest.Mock).mockResolvedValue(UNIVERSITIES);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("UniversityPicker", () => {
  it("marks the chosen university with aria-checked", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          <UniversityPicker visible onClose={jest.fn()} selectedCampusId="c-uiu" onSelect={jest.fn()} />
        </QueryClientProvider>,
      ),
    );
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
    const row = (name: string) => document.body.querySelector(`[role="radio"][aria-label^="${name},"]`) as HTMLElement | null;
    expect(row("UIU")?.getAttribute("aria-checked")).toBe("true");
    expect(row("BRACU")?.getAttribute("aria-checked")).toBe("false");
  });
});
