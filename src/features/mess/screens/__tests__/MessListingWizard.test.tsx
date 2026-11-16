import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLanguageStore } from "@/i18n";
import { ApiError } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { getMessDetail, submitMess, uploadMessMedia, upsertMess } from "../../api/messApi";
import { useMessWizardStore } from "../../stores/messWizardStore";
import { emptyForm } from "../../utils/wizardForm";
import { MessListingWizard } from "../MessListingWizard";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});
jest.mock("@/components/AppChrome", () => ({ AppChrome: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
jest.mock("@/components/PageMeta", () => ({ PageMeta: () => null }));
jest.mock("@/hooks/useAllAreas", () => ({ useAllAreas: () => ({ data: { items: [] } }) }));
jest.mock("@/components/AreaPicker", () => {
  const { Pressable, Text } = require("react-native");
  return {
    AreaPicker: ({ visible, onSelect }: { visible: boolean; onSelect: (area: unknown) => void }) =>
      visible ? (
        <Pressable accessibilityLabel="Pick Badda" onPress={() => onSelect({ id: "a1", name: "Badda", city: "Dhaka", parent_area_id: null })}>
          <Text>Pick Badda</Text>
        </Pressable>
      ) : null,
  };
});
jest.mock("@/features/property/components/wizard/LocationPicker", () => {
  const { Pressable, Text } = require("react-native");
  return {
    LocationPicker: ({ onChange }: { onChange: (point: { lat: number; lng: number }) => void }) => (
      <Pressable accessibilityLabel="Drop pin" onPress={() => onChange({ lat: 23.79, lng: 90.44 })}>
        <Text>Drop pin</Text>
      </Pressable>
    ),
  };
});
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: "blob:photo", fileName: "photo.jpg", mimeType: "image/jpeg" }] })),
}));
jest.mock("@/lib/alert", () => ({ confirmAction: jest.fn(async () => true), notify: jest.fn() }));
jest.mock("@/services/userApi", () => ({ getUser: jest.fn(async () => ({ data: { id: "u1", auth_identities: [{ phone: "+8801700000009" }] } })) }));
jest.mock("expo-router", () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() } }));
jest.mock("../../api/messApi", () => ({
  getUniversities: jest.fn(async () => []),
  getMessDetail: jest.fn(),
  upsertMess: jest.fn(),
  submitMess: jest.fn(),
  uploadMessMedia: jest.fn(),
  deleteMessMedia: jest.fn(),
}));

const upsert = upsertMess as jest.Mock;
const upload = uploadMessMedia as jest.Mock;

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

const text = () => container.textContent ?? "";
const flush = () => act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
const byLabel = (label: string, nth = 0) => container.querySelectorAll(`[aria-label="${label}"]`)[nth] as HTMLElement | undefined;
const byText = (value: string) =>
  ([...container.querySelectorAll('[role="button"], button')] as HTMLElement[]).find((el) => el.textContent?.trim() === value);

async function press(target: HTMLElement | undefined) {
  if (!target) throw new Error("nothing to press");
  await act(async () => target.click());
  await flush();
}

async function type(label: string, value: string, nth = 0) {
  const input = byLabel(label, nth) as HTMLInputElement;
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  await act(async () => {
    setValue.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function render() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <MessListingWizard />
      </QueryClientProvider>,
    ),
  );
  await flush();
  await flush();
}

beforeEach(async () => {
  jest.clearAllMocks();
  useLanguageStore.getState().setLanguage("en");
  useAuthStore.setState({ user: { id: "u1", full_name: "Lister", email: "l@example.com", avatar_url: null } });
  await useMessWizardStore.persist.rehydrate();
  useMessWizardStore.getState().reset();
  upsert.mockResolvedValue({ id: "d1", status: "draft" });
  upload.mockImplementation(async (_id: string, _file: unknown, label: string, order: number) => ({ id: `p-${label}`, url: `https://x/${label}.jpg`, label, display_order: order }));
  (submitMess as jest.Mock).mockResolvedValue({ id: "d1", status: "pending" });
  window.scrollTo = jest.fn() as unknown as typeof window.scrollTo;
  global.fetch = jest.fn(async () => ({ blob: async () => new Blob(["x"], { type: "image/jpeg" }) })) as unknown as typeof fetch;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("MessListingWizard", () => {
  it("walks a new listing through all six steps, saving each one, and submits it", async () => {
    await render();
    expect(text()).toContain("Step 1 of 6");

    // Step 1 will not move on with required answers missing.
    await press(byText("Save and continue"));
    expect(upsert).not.toHaveBeenCalled();
    expect(text()).toContain("Choose who this mess is for");
    expect(text()).toContain("Place the pin on the map");

    await press(byLabel("Male"));
    await press(byLabel("Choose the area"));
    await press(byLabel("Pick Badda"));
    await type("Address", "Road 4, Badda");
    await press(byLabel("Drop pin"));
    await press(byText("Save and continue"));
    expect(upsert).toHaveBeenLastCalledWith(expect.objectContaining({ area_id: "a1", address: "Road 4, Badda", location_lat: 23.79, mess: { gender_policy: "male" } }));
    expect(text()).toContain("Step 2 of 6");

    // Step 2: one seat, named and priced. The draft id from step 1 is used from now on.
    await type("Room name", "Room B");
    await type("Rent per month", "5000");
    await press(byText("Save and continue"));
    expect(upsert).toHaveBeenLastCalledWith(expect.objectContaining({ property_id: "d1", seats: [expect.objectContaining({ room_label: "Room B", rent: 5000 })] }));
    expect(text()).toContain("Step 3 of 6");

    // Step 3: three bills answered, then the rest marked as included.
    expect(text()).toContain("8 bills still to answer");
    for (const nth of [0, 1, 2]) await press(byLabel("Included", nth));
    await press(byText("Mark the rest as included"));
    expect(text()).toContain("Every bill answered");
    await press(byText("Save and continue"));
    expect(upsert.mock.lastCall[0].charges).toHaveLength(8);

    // Step 4: the defaults stand; meals and who runs it are asked.
    await press(byText("Save and continue"));
    expect(text()).toContain("Step 4 of 6");
    await press(byLabel("Meal manager"));
    await press(byLabel("A resident manager"));
    await press(byText("Save and continue"));
    expect(text()).toContain("Step 5 of 6");

    // Step 5: room, washroom and building photos are required.
    await press(byText("Save and continue"));
    expect(text()).toContain("Add a photo of the washroom");
    for (const label of ["Room", "Washroom", "Building entrance"]) await press(byLabel(`Add photo: ${label}`));
    expect(upload).toHaveBeenCalledWith("d1", expect.anything(), "washroom", expect.any(Number));
    expect(text()).toContain("+8801700000009");
    await press(byText("Save and continue"));
    expect(text()).toContain("Step 6 of 6");

    // Step 6: the suggested title, then submit.
    await press(byText("Use: Shared seat in 4-person mess, Badda"));
    await press(byText("Submit for review"));
    expect(upsert).toHaveBeenLastCalledWith({ property_id: "d1", title: "Shared seat in 4-person mess, Badda", description: "" });
    expect(submitMess).toHaveBeenCalledWith("d1");
    expect(text()).toContain("Submitted for review");
    expect(useMessWizardStore.getState().values).toBeNull();
  });

  it("resumes an unfinished listing and shows the server's reasons when submit is refused", async () => {
    const values = {
      ...emptyForm(),
      gender_policy: "female" as const,
      area_id: "a1",
      area_name: "Badda",
      address: "Road 4",
      location: { lat: 23.79, lng: 90.44 },
      seats: [{ ...emptyForm().seats[0], room_label: "Room A", rent: 4000 }],
      charges: emptyForm().charges.map((charge) => ({ ...charge, billing: "included" as const })),
      meal_system: "none" as const,
      managed_by: "landlord" as const,
      title: "Seat in Badda",
    };
    useMessWizardStore.getState().save({ propertyId: "d1", step: "review", values });
    (getMessDetail as jest.Mock).mockResolvedValue({
      media: ["room", "washroom", "building"].map((label, i) => ({ id: `p${i}`, url: `https://x/${label}.jpg`, label, display_order: i })),
    });
    (submitMess as jest.Mock).mockRejectedValue(new ApiError("Incomplete", 422, null, ["Choose at least one way to be contacted."]));

    await render();
    expect(text()).toContain("Continuing your unfinished listing.");
    expect(text()).toContain("Step 6 of 6");

    await press(byText("Submit for review"));
    expect(submitMess).toHaveBeenCalledWith("d1");
    expect(text()).toContain("Fix these before submitting");
    expect(text()).toContain("Choose at least one way to be contacted.");
  });

  it("sends the lister back to the first incomplete step on submit", async () => {
    useMessWizardStore.getState().save({ propertyId: "d1", step: "review", values: { ...emptyForm(), title: "Seat in Badda" } });
    (getMessDetail as jest.Mock).mockResolvedValue({ media: [] });

    await render();
    await press(byText("Submit for review"));
    expect(submitMess).not.toHaveBeenCalled();
    expect(text()).toContain("Step 1 of 6");
    expect(text()).toContain("Choose who this mess is for");
  });
});
