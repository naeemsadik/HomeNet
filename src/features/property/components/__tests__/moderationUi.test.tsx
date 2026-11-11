import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dimensions } from "react-native";
import { router } from "expo-router";
import { AdminContextBar } from "@/components/AdminContextBar";
import { AdminListingActions } from "@/features/property/components/AdminListingActions";
import { AdminPropertyCommandDeck } from "@/features/property/components/AdminPropertyCommandDeck";
import { ListingFeedbackModal } from "@/features/property/components/ListingFeedbackModal";
import { useAuthStore } from "@/stores/authStore";
import { useAdminContextStore } from "@/stores/useAdminContextStore";
import { confirmAction } from "@/lib/alert";
import { useToastStore } from "@/lib/toast";
import {
  adminDeleteProperty,
  adminUpdateProperty,
  getAdminProperties,
  staffArchiveProperty,
  submitPropertyFeedback,
} from "@/services/propertyApi";
import type { Property } from "@/features/property/types/property";
import type { UserRole } from "@/types/api";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  usePathname: jest.fn(() => "/buy"),
}));

jest.mock("@/lib/alert", () => ({
  confirmAction: jest.fn(),
  notify: jest.fn(),
}));

jest.mock("@/services/propertyApi", () => ({
  getAdminProperties: jest.fn().mockResolvedValue({ data: { items: [], total: 4 } }),
  staffArchiveProperty: jest.fn().mockResolvedValue({ data: { id: "prop-1" } }),
  staffRestoreProperty: jest.fn().mockResolvedValue({ data: { id: "prop-1", status: "active" } }),
  adminUpdateProperty: jest.fn().mockResolvedValue({ data: { id: "prop-1" } }),
  adminDeleteProperty: jest.fn().mockResolvedValue({ data: null }),
  submitPropertyFeedback: jest.fn().mockResolvedValue({
    success: true,
    message: "Revision request queued for seller",
    data: {
      id: "prop-1",
      delivered: "fallback",
      status: "changes_requested",
      tags: ["image_quality"],
      notes: "Image 2 is blurry",
    },
  }),
}));

const MODERATOR_ROLES: UserRole[] = [
  {
    id: "ur-1",
    user_id: "staff-1",
    role_id: "role-mod",
    role: {
      id: "role-mod",
      name: "moderator",
      role_permissions: [
        { permission: { id: "p-mod", name: "moderate_listing", description: null } },
      ],
    },
  },
];

const NON_MODERATOR_ROLES: UserRole[] = [
  {
    id: "ur-2",
    user_id: "user-1",
    role_id: "role-buyer",
    role: {
      id: "role-buyer",
      name: "buyer_seller",
      role_permissions: [
        { permission: { id: "p-own", name: "manage_properties", description: null } },
      ],
    },
  },
];

const SAMPLE_PROPERTY: Property = {
  id: "prop-1",
  user_id: "owner-1",
  area_id: "area-gulshan",
  title: "3 Bed Residence in Gulshan 2",
  description: "Bright corner unit",
  type: "residential",
  subtype: "apartment",
  listing_type: "sale",
  price: 25000000,
  price_currency: "BDT",
  area_size: 2100,
  area_unit: "sqft",
  location_lat: 23.79,
  location_lng: 90.41,
  address: "Road 71, Gulshan 2",
  amenities: null,
  status: "active",
  is_verified: true,
  virtual_tour_url: null,
  view_count: 10,
  published_at: "2026-10-01T00:00:00Z",
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-10-01T00:00:00Z",
  area: { id: "area-gulshan", name: "Gulshan", parent_area_id: null, city: "Dhaka" },
  user: { id: "owner-1", full_name: "Tariq Hasan", avatar_url: null },
};

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

async function renderDom(node: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  await act(async () => {
    root.render(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
  });
}

async function flushAsync() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 15));
  });
}

function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const tracker = (textarea as unknown as { _valueTracker?: { setValue: (v: string) => void } })._valueTracker;
  if (tracker) tracker.setValue("");
  const descriptor = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  );
  descriptor?.set?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.dispatchEvent(new Event("change", { bubbles: true }));
}

function setStaffAuth(hydrated = true, roles: UserRole[] = MODERATOR_ROLES) {
  act(() => {
    useAuthStore.setState({
      hydrated,
      user: {
        id: "staff-1",
        full_name: "Ops Moderator",
        email: "ops@homenetbd.com",
        avatar_url: null,
      },
      userRoles: roles,
    });
  });
}

function findByAriaLabel(labelPart: string): HTMLElement {
  const all = Array.from(document.body.querySelectorAll("[aria-label]")) as HTMLElement[];
  const found = all.find((el) => (el.getAttribute("aria-label") ?? "").includes(labelPart));
  if (!found) {
    throw new Error(`Unable to find element with aria-label containing "${labelPart}"`);
  }
  return found;
}

beforeEach(() => {
  jest.spyOn(Dimensions, "get").mockReturnValue({
    width: 1280,
    height: 800,
    scale: 1,
    fontScale: 1,
  });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    useAuthStore.setState({ hydrated: false, user: null, userRoles: [] });
    useAdminContextStore.setState({ armed: false });
  });
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe("AdminContextBar", () => {
  it("renders nothing before hydration or for non-staff users", async () => {
    setStaffAuth(false, MODERATOR_ROLES);
    await renderDom(<AdminContextBar />);
    expect(container.innerHTML).toBe("");

    setStaffAuth(true, NON_MODERATOR_ROLES);
    await renderDom(<AdminContextBar />);
    expect(container.innerHTML).toBe("");
  });

  it("shows staff role, public mode context, pending count, and arms moderation", async () => {
    (getAdminProperties as jest.Mock).mockResolvedValue({ data: { items: [], total: 3 } });
    setStaffAuth(true, MODERATOR_ROLES);

    await renderDom(<AdminContextBar />);
    await flushAsync();

    expect(container.textContent).toContain("moderator");
    expect(container.textContent).toContain("Staff · Public view");
    expect(container.textContent).toContain("3 pending");

    const switchBtn = container.querySelector('[role="switch"]') as HTMLElement;
    expect(switchBtn).toBeTruthy();
    expect(useAdminContextStore.getState().armed).toBe(false);
    expect(container.textContent).toContain("Off");

    await act(async () => {
      switchBtn.click();
    });
    expect(useAdminContextStore.getState().armed).toBe(true);
    expect(container.textContent).toContain("Moderation active");
    expect(container.textContent).toContain("On");
  });

  it("collapses into a compact micro-pill bar on phone screens", async () => {
    jest.spyOn(Dimensions, "get").mockReturnValue({
      width: 375,
      height: 812,
      scale: 2,
      fontScale: 1,
    });
    (getAdminProperties as jest.Mock).mockResolvedValue({ data: { items: [], total: 2 } });
    setStaffAuth(true, MODERATOR_ROLES);

    await renderDom(<AdminContextBar />);
    await flushAsync();

    expect(container.textContent).toContain("moderator");
    expect(container.textContent).toContain("2");
    expect(container.textContent).not.toContain("Staff · Public view");
    expect(container.textContent).not.toContain("Admin Console");
  });
});

describe("AdminListingActions", () => {
  it("remains hidden until moderation is armed and user holds moderate_listing", async () => {
    setStaffAuth(true, MODERATOR_ROLES);
    await renderDom(<AdminListingActions property={SAMPLE_PROPERTY} />);
    expect(container.innerHTML).toBe("");

    act(() => useAdminContextStore.getState().arm());
    setStaffAuth(true, NON_MODERATOR_ROLES);
    await renderDom(<AdminListingActions property={SAMPLE_PROPERTY} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders only Suggest and Quick Archive actions (no direct Edit) when armed and permitted", async () => {
    setStaffAuth(true, MODERATOR_ROLES);
    act(() => useAdminContextStore.getState().arm());

    await renderDom(<AdminListingActions property={SAMPLE_PROPERTY} />);

    // Least privilege: direct Edit touchpoint must not exist for moderators.
    const editBtn = Array.from(document.body.querySelectorAll("[aria-label]")).find((el) =>
      (el.getAttribute("aria-label") ?? "").toLowerCase().includes("edit property"),
    );
    expect(editBtn).toBeUndefined();

    const suggestBtn = findByAriaLabel("Suggest changes");
    await act(async () => {
      suggestBtn.click();
    });
    expect(document.body.textContent).toContain("Why does this listing need changes?");

    const archiveBtn = findByAriaLabel("Archive");
    await act(async () => {
      archiveBtn.click();
    });
    await flushAsync();
    expect(staffArchiveProperty).toHaveBeenCalledWith("prop-1");
  });
});

describe("AdminPropertyCommandDeck", () => {
  const deckProps = {
    id: SAMPLE_PROPERTY.id,
    title: SAMPLE_PROPERTY.title,
    status: SAMPLE_PROPERTY.status,
    areaName: "Gulshan, Dhaka",
    sellerName: "Tariq Hasan",
  };

  it("is completely hidden before hydration and without moderate_listing", async () => {
    setStaffAuth(false, MODERATOR_ROLES);
    await renderDom(<AdminPropertyCommandDeck property={deckProps} />);
    expect(container.innerHTML).toBe("");

    setStaffAuth(true, NON_MODERATOR_ROLES);
    await renderDom(<AdminPropertyCommandDeck property={deckProps} />);
    expect(container.innerHTML).toBe("");
  });

  it("supports Status switching, Request Changes, and guarded Delete with zero Edit touchpoints", async () => {
    setStaffAuth(true, MODERATOR_ROLES);
    (confirmAction as jest.Mock).mockResolvedValue(true);

    await renderDom(<AdminPropertyCommandDeck property={deckProps} />);
    expect(container.textContent).toContain("Staff Deck");

    // Least privilege: no Edit Property action in Command Deck.
    const editBtn = Array.from(document.body.querySelectorAll("[aria-label]")).find((el) =>
      (el.getAttribute("aria-label") ?? "").toLowerCase().includes("edit property"),
    );
    expect(editBtn).toBeUndefined();

    // Request Changes opens ListingFeedbackModal
    await act(async () => {
      findByAriaLabel("Suggest changes").click();
    });
    expect(document.body.textContent).toContain("Why does this listing need changes?");
    await act(async () => {
      findByAriaLabel("Cancel").click();
    });

    // Status switcher
    await act(async () => {
      findByAriaLabel("Change listing status").click();
    });

    await act(async () => {
      findByAriaLabel("Under Review").click();
    });
    await flushAsync();
    expect(adminUpdateProperty).toHaveBeenCalledWith("prop-1", { status: "pending" });

    // Guarded delete
    await act(async () => {
      findByAriaLabel("Delete").click();
    });
    await flushAsync();
    expect(confirmAction).toHaveBeenCalled();
    expect(adminDeleteProperty).toHaveBeenCalledWith("prop-1");
    expect(router.back).toHaveBeenCalled();
  });
});

describe("ListingFeedbackModal", () => {
  it("validates empty form and sends structured QA tags + coaching note", async () => {
    const onClose = jest.fn();
    const onSuccess = jest.fn();

    await renderDom(
      <ListingFeedbackModal
        onClose={onClose}
        onSuccess={onSuccess}
        property={{
          id: "prop-1",
          title: "3 Bed Residence in Gulshan 2",
          status: "active",
          areaName: "Gulshan",
          sellerName: "Tariq Hasan",
        }}
        visible
      />,
    );

    const submitBtn = findByAriaLabel("Send to seller");

    // Submitting empty shows inline validation error
    await act(async () => {
      submitBtn.click();
    });
    expect(submitPropertyFeedback).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("Pick at least one reason");

    // Toggle Image quality tag + enter seller note
    await act(async () => {
      findByAriaLabel("Image quality").click();
    });

    const textarea = findByAriaLabel("Notes for seller") as HTMLTextAreaElement;
    await act(async () => {
      setTextareaValue(textarea, "Image 2 is blurry and lacks living room light.");
    });

    await act(async () => {
      submitBtn.click();
    });
    await flushAsync();

    expect(submitPropertyFeedback).toHaveBeenCalledWith("prop-1", {
      tags: ["image_quality"],
      notes: "Image 2 is blurry and lacks living room light.",
      requestChanges: true,
    });
    expect(useToastStore.getState().toast?.message).toContain("Notes sent to seller");
    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
