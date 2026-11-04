import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { StudentAccommodationCard } from "@/components/studentAccommodation/StudentAccommodationCard";
import { useLanguageStore } from "@/i18n";
import type { StudentAccommodationCardItem } from "@/types/studentAccommodation";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/api/studentAccommodationApi", () => ({
  toggleSave: jest.fn().mockResolvedValue({ is_saved: true }),
}));

jest.mock("@/components/icons", () => ({
  Building: () => "BuildingIcon",
  Clock: () => "ClockIcon",
  Heart: () => "HeartIcon",
}));

describe("StudentAccommodationCard", () => {
  let container: HTMLDivElement;

  const mockItem: StudentAccommodationCardItem = {
    id: "acc-101",
    title: "Green View Student Hostel",
    category: "student_accommodation",
    subtype: "hostel",
    gender_policy: "male",
    total_rent: 8500,
    currency: "BDT",
    primary_image_url: "https://example.com/hostel.jpg",
    nearest_campus: {
      university_id: "uiu",
      university_name: "UIU",
      walking_time_minutes: 12,
      distance_meters: 800,
      is_approximate: true,
    },
    available_seats: 2,
    total_seats: 10,
    is_saved: false,
    updated_at: "2026-11-04T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useLanguageStore.getState().setLanguage("en");
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    useLanguageStore.getState().setLanguage("en");
  });

  it("1. Renders title, formatted rent in BDT, and seats left", async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(<StudentAccommodationCard item={mockItem} />);
    });

    expect(container.textContent).toContain("Green View Student Hostel");
    expect(container.textContent).toContain("8,500");
    expect(container.textContent).toContain("/ month");
    expect(container.textContent).toContain("2 seats left");

    await act(async () => root.unmount());
  });

  it("2. Displays the correct localized gender policy badge", async () => {
    // English male policy
    const root = createRoot(container);
    await act(async () => {
      root.render(<StudentAccommodationCard item={mockItem} />);
    });
    expect(container.textContent).toContain("Male Students");

    // English female policy
    await act(async () => {
      root.render(
        <StudentAccommodationCard
          item={{ ...mockItem, id: "acc-102", gender_policy: "female" }}
        />,
      );
    });
    expect(container.textContent).toContain("Female Students");

    // Bengali localized gender policy
    await act(async () => {
      useLanguageStore.getState().setLanguage("bn");
    });
    await act(async () => {
      root.render(
        <StudentAccommodationCard
          item={{ ...mockItem, id: "acc-103", gender_policy: "mixed" }}
        />,
      );
    });
    expect(container.textContent).toContain("উভয় / মিশ্র");

    await act(async () => root.unmount());
  });

  it("3. Renders campus walking distance and handles the approximate flag cleanly", async () => {
    const root = createRoot(container);

    // Approximate is true -> displays "(approx)"
    await act(async () => {
      root.render(<StudentAccommodationCard item={mockItem} />);
    });
    expect(container.textContent).toContain("12 min walk to UIU (approx)");

    // Approximate is false -> does NOT display "(approx)"
    await act(async () => {
      root.render(
        <StudentAccommodationCard
          item={{
            ...mockItem,
            id: "acc-104",
            nearest_campus: {
              ...mockItem.nearest_campus,
              is_approximate: false,
            },
          }}
        />,
      );
    });
    expect(container.textContent).toContain("12 min walk to UIU");
    expect(container.textContent).not.toContain("(approx)");

    await act(async () => root.unmount());
  });

  it("4. Save button toggles state and calls the save handler", async () => {
    const onSaveMock = jest.fn().mockResolvedValue(undefined);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <StudentAccommodationCard
          item={{ ...mockItem, is_saved: false }}
          onSave={onSaveMock}
        />,
      );
    });

    const saveBtn = container.querySelector(
      `[aria-label="Save accommodation"]`,
    );
    expect(saveBtn).toBeTruthy();

    await act(async () => {
      saveBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onSaveMock).toHaveBeenCalledTimes(1);
    expect(onSaveMock).toHaveBeenCalledWith("acc-101", true);

    // After toggling, the accessible label reflects the saved state
    const unsaveBtn = container.querySelector(
      `[aria-label="Remove from saved"]`,
    );
    expect(unsaveBtn).toBeTruthy();

    await act(async () => root.unmount());
  });

  it("5. Confirms NO phone number or email fields exist in the rendered output (Privacy Invariant)", async () => {
    const root = createRoot(container);

    await act(async () => {
      root.render(<StudentAccommodationCard item={mockItem} />);
    });

    const renderedText = container.textContent || "";

    // Regex check for Bangladeshi phone numbers (e.g. +8801..., 017..., 018...)
    expect(renderedText).not.toMatch(/(?:\+?880|0)1[3-9]\d{8}/);
    // Generic email address regex check
    expect(renderedText).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    // Contact keywords check
    expect(renderedText.toLowerCase()).not.toContain("phone");
    expect(renderedText.toLowerCase()).not.toContain("email");
    expect(renderedText.toLowerCase()).not.toContain("whatsapp");

    await act(async () => root.unmount());
  });
});
