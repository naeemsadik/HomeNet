import { stepValidity } from "../hooks/useInstantValuation";
import { useInstantValuationStore } from "../stores/useInstantValuationStore";

beforeEach(() => useInstantValuationStore.getState().reset());

describe("the valuation form starts empty", () => {
  it("has no sample flat filled in", () => {
    const { form } = useInstantValuationStore.getState();
    expect(form.areaName).toBe("");
    expect(form.roadOrBlock).toBe("");
    expect(form.sizeInput).toBe("");
    expect(form.bedrooms).toBeNull();
    expect(form.bathrooms).toBeNull();
    expect(form.floorLevel).toBe("");
    expect(form.facing).toBe("");
    expect(form.propertyAge).toBe("");
  });

  it("has no amenity ticked", () => {
    const { amenities } = useInstantValuationStore.getState().form;
    expect(Object.values(amenities).every((on) => on === false)).toBe(true);
  });
});

describe("when each step can go on", () => {
  it("step 1 needs an area and nothing else", () => {
    expect(stepValidity({ areaName: "", sizeInput: "" }).isStep1Valid).toBe(false);
    expect(stepValidity({ areaName: "  ", sizeInput: "" }).isStep1Valid).toBe(false);
    expect(stepValidity({ areaName: "Gulshan", sizeInput: "" }).isStep1Valid).toBe(true);
  });

  it("step 2 needs a size above zero, and nothing else", () => {
    expect(stepValidity({ areaName: "Gulshan", sizeInput: "" }).isStep2Valid).toBe(false);
    expect(stepValidity({ areaName: "Gulshan", sizeInput: "0" }).isStep2Valid).toBe(false);
    expect(stepValidity({ areaName: "Gulshan", sizeInput: "abc" }).isStep2Valid).toBe(false);
    expect(stepValidity({ areaName: "Gulshan", sizeInput: "1450" }).isStep2Valid).toBe(true);
  });

  it("step 3 can always go on", () => {
    expect(stepValidity({ areaName: "", sizeInput: "" }).isStep3Valid).toBe(true);
  });
});

describe("working out the estimate", () => {
  it("sends the owner back to step 2 instead of guessing a size", async () => {
    const store = useInstantValuationStore;
    store.getState().setFormField("areaName", "Gulshan");
    await store.getState().executeValuation();
    expect(store.getState().currentStep).toBe(2);
    expect(store.getState().error).toMatch(/size/i);
    expect(store.getState().result).toBeNull();
  });
});
