import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { useLanguageStore } from "@/i18n";
import { MessFilterSheet } from "../MessFilterSheet";
import type { MessFilters } from "../../types/mess";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

/** The sheet renders in a portal, so look in the whole document. */
const byLabel = (label: string) => document.querySelector(`[aria-label="${label}"]`) as HTMLElement | null;
/** AppButton has no aria-label of its own: its text names it. */
const byText = (text: string) =>
  ([...document.querySelectorAll('[role="button"], button')] as HTMLElement[]).find((el) => el.textContent?.trim() === text) ?? null;
const press = (label: string) => act(async () => (byLabel(label) ?? byText(label))!.click());

async function open(filters: MessFilters, campusName: string | null = "UIU") {
  const onApply = jest.fn();
  const onClose = jest.fn();
  await act(async () =>
    root.render(<MessFilterSheet visible onClose={onClose} filters={filters} onApply={onApply} campusName={campusName} onPickCampus={jest.fn()} />),
  );
  return { onApply, onClose };
}

beforeEach(() => {
  useLanguageStore.getState().setLanguage("en");
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("MessFilterSheet", () => {
  it("edits a draft and commits it only on Show results", async () => {
    const { onApply, onClose } = await open({ campus_id: "c-uiu" });
    await press("15 min");
    await press("No smoking indoors");
    await press("Female");
    expect(onApply).not.toHaveBeenCalled();

    await press("Show results");
    expect(onApply).toHaveBeenCalledWith({ campus_id: "c-uiu", max_walk_min: 15, no_smoking: true, gender: "female" });
    expect(onClose).toHaveBeenCalled();
  });

  it("applies a budget preset to the all-in maximum", async () => {
    const { onApply } = await open({});
    await press("Up to ৳ 8,000");
    await press("Show results");
    expect(onApply).toHaveBeenCalledWith({ max_all_in: 8000 });
  });

  it("orders a typed budget the right way round", async () => {
    const { onApply } = await open({});
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    await act(async () => {
      const min = byLabel("Min") as HTMLInputElement;
      setValue.call(min, "9000");
      min.dispatchEvent(new Event("input", { bubbles: true }));
      const max = byLabel("Max") as HTMLInputElement;
      setValue.call(max, "4000");
      max.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await press("Show results");
    expect(onApply).toHaveBeenCalledWith({ min_all_in: 4000, max_all_in: 9000 });
  });

  it("keeps the campus and sort when clearing everything else", async () => {
    const { onApply } = await open({ campus_id: "c-uiu", sort_by: "newest", no_smoking: true, max_all_in: 5000, meal_system: ["self_cook"] });
    await press("Clear all");
    await press("Show results");
    expect(onApply).toHaveBeenCalledWith({ campus_id: "c-uiu", sort_by: "newest" });
  });

  it("asks for a university before offering walk times", async () => {
    await open({}, null);
    expect(document.body.textContent).toContain("Choose your university first.");
    expect(byLabel("15 min")).toBeNull();
  });
});

describe("MessFilterSheet state for screen readers", () => {
  it("marks the chosen option in each group with aria-checked", async () => {
    await open({ campus_id: "c-uiu", gender: "female" });
    const female = byLabel("Female")!;
    const male = byLabel("Male")!;
    expect(female.getAttribute("role")).toBe("radio");
    expect(female.getAttribute("aria-checked")).toBe("true");
    expect(male.getAttribute("aria-checked")).toBe("false");

    await press("Male");
    expect(byLabel("Male")!.getAttribute("aria-checked")).toBe("true");
    expect(byLabel("Female")!.getAttribute("aria-checked")).toBe("false");
  });
});
