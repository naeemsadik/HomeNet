import { act } from "react";
// @ts-expect-error -- @types/react-dom is not a dependency; Jest loads the real module.
import { createRoot } from "react-dom/client";
import { LiveText } from "@/components/LiveText";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Google Translate replaces text nodes it has translated, so an in-place text
// update never reaches the screen in Bangla. LiveText must mount a new node.
describe("LiveText", () => {
  it("mounts a new element when its text changes", async () => {
    const container = document.createElement("div");
    const root = createRoot(container);

    await act(async () => root.render(<LiveText>{0} properties found</LiveText>));
    const before = container.firstElementChild;
    expect(before?.textContent).toBe("0 properties found");

    await act(async () => root.render(<LiveText>{12} properties found</LiveText>));
    const after = container.firstElementChild;
    expect(after?.textContent).toBe("12 properties found");
    expect(after).not.toBe(before);

    await act(async () => root.unmount());
  });

  it("keeps the same element while the text is unchanged", async () => {
    const container = document.createElement("div");
    const root = createRoot(container);

    await act(async () => root.render(<LiveText>{3} unread</LiveText>));
    const before = container.firstElementChild;
    await act(async () => root.render(<LiveText>{3} unread</LiveText>));
    expect(container.firstElementChild).toBe(before);

    await act(async () => root.unmount());
  });
});
