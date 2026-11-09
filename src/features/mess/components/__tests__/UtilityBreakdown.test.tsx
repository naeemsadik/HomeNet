import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { useLanguageStore } from "@/i18n";
import { UtilityBreakdownTable } from "../UtilityBreakdown";
import type { UtilityCharge } from "../../types/mess";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

const charge = (partial: Partial<UtilityCharge> & Pick<UtilityCharge, "category" | "billing">): UtilityCharge => ({
  amount_min: null,
  amount_max: null,
  note: null,
  ...partial,
});

const ALL: UtilityCharge[] = [
  charge({ category: "electricity", billing: "variable", amount_min: 400, amount_max: 550, note: "Split by meter reading" }),
  charge({ category: "gas", billing: "fixed", amount_min: 250 }),
  charge({ category: "water", billing: "included" }),
  charge({ category: "waste", billing: "fixed", amount_min: 50 }),
  charge({ category: "internet", billing: "fixed", amount_min: 150 }),
  charge({ category: "maid", billing: "fixed", amount_min: 200 }),
  charge({ category: "meal", billing: "not_applicable" }),
  charge({ category: "service_charge", billing: "not_applicable" }),
];

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

async function render(node: React.ReactNode) {
  await act(async () => root.render(node));
  return container.textContent ?? "";
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

describe("UtilityBreakdownTable", () => {
  it("lists every bill with how it is billed, then the all-in total", async () => {
    const text = await render(<UtilityBreakdownTable rent={5000} charges={ALL} deposit={5000} advanceMonths={1} />);
    expect(text).toContain("Electricity");
    expect(text).toContain("Split by meter reading");
    expect(text).toContain("৳ 400 to ৳ 550");
    expect(text).toContain("Varies");
    expect(text).toContain("Included in rent");
    expect(text).toContain("Not applicable");
    expect(text).toContain("All-in total৳ 6,050 to ৳ 6,200");
    expect(text).toContain("Security deposit৳ 5,000");
    expect(text).toContain("1 month's rent");
  });

  it("says which bills the lister left out", async () => {
    const text = await render(<UtilityBreakdownTable rent={5000} charges={ALL.filter((row) => row.category !== "gas" && row.category !== "maid")} />);
    expect(text).toContain("The lister has not answered every bill. Ask about: Gas, Maid (bua).");
    expect(text).toContain("Not given");
  });

  it("shows no deposit as None rather than ৳ 0", async () => {
    const text = await render(<UtilityBreakdownTable rent={5000} charges={ALL} deposit={null} advanceMonths={0} />);
    expect(text).toContain("Security depositNone");
    expect(text).toContain("AdvanceNone");
    expect(text).not.toContain("৳ 0");
  });
});
