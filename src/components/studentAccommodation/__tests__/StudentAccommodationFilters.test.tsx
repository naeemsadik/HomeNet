import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { StudentAccommodationFilters } from "@/components/studentAccommodation/StudentAccommodationFilters";
import { useLanguageStore } from "@/i18n";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => ({
  Check: () => "CheckIcon",
  RotateCcw: () => "RotateCcwIcon",
}));

describe("StudentAccommodationFilters", () => {
  let container: HTMLDivElement;

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

  it("renders all filter sections and controls in English", async () => {
    const onApplyMock = jest.fn();
    const root = createRoot(container);

    await act(async () => {
      root.render(<StudentAccommodationFilters onApply={onApplyMock} />);
    });

    expect(container.textContent).toContain("Filters");
    expect(container.textContent).toContain("Gender Policy");
    expect(container.textContent).toContain("Accommodation Type");
    expect(container.textContent).toContain("Max walking distance");
    expect(container.textContent).toContain("Safety & Amenities");
    expect(container.textContent).toContain("Apply Filters");

    await act(async () => root.unmount());
  });

  it("toggles gender policy and applies filters", async () => {
    const onApplyMock = jest.fn();
    const root = createRoot(container);

    await act(async () => {
      root.render(<StudentAccommodationFilters onApply={onApplyMock} />);
    });

    // Select "Female Students"
    const femaleBtn = container.querySelector(
      `[aria-label="Female Students"]`,
    );
    expect(femaleBtn).toBeTruthy();

    await act(async () => {
      femaleBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Click Apply Filters
    const applyBtn = container.querySelector(
      `[aria-label="Apply Filters"]`,
    );
    expect(applyBtn).toBeTruthy();

    await act(async () => {
      applyBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onApplyMock).toHaveBeenCalledWith({
      gender_policy: "female",
    });

    await act(async () => root.unmount());
  });

  it("toggles subtype, walking distance, safety chips and resets cleanly", async () => {
    const onApplyMock = jest.fn();
    const onResetMock = jest.fn();
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <StudentAccommodationFilters
          onApply={onApplyMock}
          onReset={onResetMock}
        />,
      );
    });

    // Toggle "Mess"
    const messChip = container.querySelector(`[aria-label="Mess"]`);
    await act(async () => {
      messChip?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Toggle 10 min
    const walk10Chip = container.querySelector(`[aria-label="10 min"]`);
    await act(async () => {
      walk10Chip?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Toggle Lift
    const liftChip = container.querySelector(`[aria-label="Lift"]`);
    await act(async () => {
      liftChip?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Apply
    const applyBtn = container.querySelector(`[aria-label="Apply Filters"]`);
    await act(async () => {
      applyBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onApplyMock).toHaveBeenCalledWith({
      subtype: "mess",
      max_walking_time: 10,
      has_lift: true,
    });

    // Reset
    const resetBtn = container.querySelector(`[aria-label="Reset"]`);
    await act(async () => {
      resetBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onResetMock).toHaveBeenCalledTimes(1);

    // Apply again to verify empty filters after reset
    await act(async () => {
      applyBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onApplyMock).toHaveBeenLastCalledWith({});

    await act(async () => root.unmount());
  });
});

