import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { PROPERTY_TYPE_CONFIGS } from "../../../constants/propertyCategories";
import { usePropertyWizardStore } from "../../../stores/propertyWizardStore";
import { WizardDetailsStep } from "../WizardDetailsStep";

// The icon package ships ES modules Jest does not transform; every icon renders nothing here.
jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("WizardDetailsStep: Contact for price", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(async () => {
    usePropertyWizardStore.getState().reset();
    usePropertyWizardStore.getState().setDetails({ price: "18500000" });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<WizardDetailsStep activeTypeConfig={PROPERTY_TYPE_CONFIGS.residential} />);
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  const tick = () => container.querySelector('[role="checkbox"]') as HTMLElement;
  const priceBox = () => container.querySelector("input") as HTMLInputElement;

  it("locks the price box and shows the words buyers will see", async () => {
    expect(tick().getAttribute("aria-checked")).not.toBe("true");
    await act(async () => tick().click());

    expect(usePropertyWizardStore.getState().priceOnRequest).toBe(true);
    expect(tick().getAttribute("aria-checked")).toBe("true");
    expect(priceBox().readOnly || priceBox().disabled).toBe(true);
    expect(priceBox().value).toBe("");
    expect(priceBox().placeholder).toBe("Contact for price");
  });

  it("brings the typed price back when the tick is removed", async () => {
    await act(async () => tick().click());
    await act(async () => tick().click());

    expect(usePropertyWizardStore.getState().priceOnRequest).toBe(false);
    expect(priceBox().value).toBe("18500000");
  });
});
