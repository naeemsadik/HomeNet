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

describe("WizardDetailsStep: WhatsApp same as contact phone", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  const mount = async (contact: { phone: string; whatsappNumber: string }) => {
    usePropertyWizardStore.getState().reset();
    usePropertyWizardStore.getState().setContact(contact);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<WizardDetailsStep activeTypeConfig={PROPERTY_TYPE_CONFIGS.residential} />);
    });
  };

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  const box = () => container.querySelector('[role="checkbox"][aria-label*="WhatsApp"]') as HTMLElement;
  const field = (label: string) => container.querySelector(`input[aria-label="${label}"]`) as HTMLInputElement;
  const type = async (input: HTMLInputElement, value: string) => {
    const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set!;
    await act(async () => {
      setValue.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };
  const stored = () => usePropertyWizardStore.getState().whatsappNumber;

  it("starts ticked on a fresh form and copies the phone in +880 form as it is typed", async () => {
    await mount({ phone: "", whatsappNumber: "" });
    expect(box().getAttribute("aria-checked")).toBe("true");

    await type(field("Phone number"), "01812345678");

    expect(stored()).toBe("+8801812345678");
    expect(field("WhatsApp number").value).toBe("+8801812345678");
  });

  it("opens unticked when a listing has a phone but no WhatsApp, so nothing unsaved is shown", async () => {
    await mount({ phone: "01711000000", whatsappNumber: "" });
    expect(box().getAttribute("aria-checked")).not.toBe("true");
    expect(field("WhatsApp number").value).toBe("");
    expect(stored()).toBe("");

    await act(async () => box().click());

    expect(box().getAttribute("aria-checked")).toBe("true");
    expect(stored()).toBe("+8801711000000");
    expect(field("WhatsApp number").value).toBe("+8801711000000");
  });

  it("re-ticking replaces a different WhatsApp number with the phone", async () => {
    await mount({ phone: "01711000000", whatsappNumber: "+8801999999999" });
    expect(box().getAttribute("aria-checked")).not.toBe("true");

    await act(async () => box().click());

    expect(stored()).toBe("+8801711000000");
  });
});
