import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLanguageStore } from "@/i18n";
import { ApiError } from "@/services/apiClient";
import {
  createCampus,
  createUniversity,
  deleteCampus,
  getAdminUniversities,
  updateCampus,
} from "@/features/mess/api/messApi";
import type { University } from "@/features/mess/types/mess";
import { AdminUniversitiesScreen } from "../AdminUniversitiesScreen";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});
jest.mock("@/features/property/components/wizard/LocationPicker", () => ({ LocationPicker: () => null }));
jest.mock("@/features/mess/api/messApi", () => ({
  getAdminUniversities: jest.fn(),
  createUniversity: jest.fn(),
  updateUniversity: jest.fn(),
  deleteUniversity: jest.fn(),
  createCampus: jest.fn(),
  updateCampus: jest.fn(),
  deleteCampus: jest.fn(),
}));

const CATALOGUE: University[] = [
  {
    id: "u-uiu",
    name: "United International University",
    short_name: "UIU",
    city: "Dhaka",
    is_active: true,
    campuses: [{ id: "c-uiu", university_id: "u-uiu", name: "United City", area_id: null, lat: 23.7977, lng: 90.4497, is_primary: true }],
  },
  { id: "u-new", name: "New University", short_name: "NEWU", city: "Dhaka", is_active: false, campuses: [] },
];

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

beforeEach(() => {
  jest.clearAllMocks();
  useLanguageStore.getState().setLanguage("en");
  (getAdminUniversities as jest.Mock).mockResolvedValue(CATALOGUE);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

const settle = () => act(async () => new Promise((resolve) => setTimeout(resolve, 0)));

async function render() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <AdminUniversitiesScreen />
      </QueryClientProvider>,
    ),
  );
  await settle();
}

const byText = (text: string) =>
  [...document.body.querySelectorAll<HTMLElement>("[role=button], button, div[tabindex]")].find((el) => el.textContent === text) ??
  [...document.body.querySelectorAll<HTMLElement>("*")].find((el) => el.textContent === text && el.children.length === 0);
const byLabel = (label: string) => document.body.querySelector<HTMLElement>(`[aria-label="${label}"]`);

/** React tracks an input's value itself, so set it through the native setter before the event. */
function type(input: HTMLElement | null, value: string) {
  if (!input) throw new Error("input not found");
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

async function press(el: HTMLElement | null | undefined) {
  if (!el) throw new Error("element not found");
  await act(async () => el.click());
  await settle();
}

describe("AdminUniversitiesScreen", () => {
  it("lists universities with their campuses, and says which are hidden or have no campus", async () => {
    await render();
    const text = container.textContent ?? "";
    expect(text).toContain("UIU");
    expect(text).toContain("United City");
    expect(text).toContain("Main campus");
    expect(text).toContain("23.7977, 90.4497");
    expect(text).toContain("Hidden from students");
    expect(text).toContain("No campus yet");
  });

  it("adds a university", async () => {
    (createUniversity as jest.Mock).mockResolvedValue({ ...CATALOGUE[1], id: "u-ewu", short_name: "EWU" });
    await render();
    await press(byText("Add university"));
    await act(async () => {
      type(byLabel("Full name"), "East West University");
      type(byLabel("Short name"), " EWU ");
    });
    const submit = [...document.body.querySelectorAll<HTMLElement>("*")].filter((el) => el.textContent === "Add university").pop();
    await press(submit);
    expect(createUniversity).toHaveBeenCalledWith({ name: "East West University", short_name: "EWU", city: "Dhaka", is_active: true });
  });

  it("explains a duplicate short name instead of failing silently", async () => {
    (createUniversity as jest.Mock).mockRejectedValue(new ApiError("Conflict", 409));
    await render();
    await press(byText("Add university"));
    await act(async () => {
      type(byLabel("Full name"), "United International University");
      type(byLabel("Short name"), "UIU");
    });
    const submit = [...document.body.querySelectorAll<HTMLElement>("*")].filter((el) => el.textContent === "Add university").pop();
    await press(submit);
    expect(document.body.textContent).toContain("Another university already uses this short name.");
  });

  it("adds a campus from typed coordinates, as the university's main campus when it is the first", async () => {
    (createCampus as jest.Mock).mockResolvedValue({});
    await render();
    const addCampusButtons = [...container.querySelectorAll<HTMLElement>("*")].filter((el) => el.textContent === "Add campus" && el.children.length === 0);
    // Sorted by short name, NEWU (no campus yet) comes first.
    await press(addCampusButtons[0]);
    expect(byLabel("Main campus")?.getAttribute("aria-checked")).toBe("true");
    await act(async () => {
      type(byLabel("Campus or gate"), "Main gate");
      type(byLabel("Latitude"), "23.75");
      type(byLabel("Longitude"), "90.39");
    });
    const submit = [...document.body.querySelectorAll<HTMLElement>("*")].filter((el) => el.textContent === "Add campus").pop();
    await press(submit);
    expect(createCampus).toHaveBeenCalledWith({ university_id: "u-new", name: "Main gate", lat: 23.75, lng: 90.39, is_primary: true });
  });

  it("will not save a campus with coordinates it cannot read", async () => {
    await render();
    await press(byLabel("Edit United City"));
    await act(async () => type(byLabel("Latitude"), "23.79abc"));
    expect(document.body.textContent).toContain("Enter a latitude and longitude in decimal degrees");
    const save = [...document.body.querySelectorAll<HTMLElement>("*")].filter((el) => el.textContent === "Save").pop();
    await press(save);
    expect(updateCampus).not.toHaveBeenCalled();
  });

  it("deletes a campus after confirming", async () => {
    (deleteCampus as jest.Mock).mockResolvedValue(undefined);
    await render();
    await press(byLabel("Delete United City"));
    expect(document.body.textContent).toContain("Walking times to it disappear from every listing.");
    const confirm = [...document.body.querySelectorAll<HTMLElement>("*")].filter((el) => el.textContent === "Delete").pop();
    await press(confirm);
    expect(deleteCampus).toHaveBeenCalledWith("c-uiu");
  });
});
