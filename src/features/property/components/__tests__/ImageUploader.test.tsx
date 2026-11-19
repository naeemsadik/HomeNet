import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { ImageUploader } from "../ImageUploader";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("expo-image-picker", () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({ __esModule: true }, { get: (target, key) => (key in target ? target[key as "__esModule"] : Icon) });
});

const removeButtons = (container: HTMLElement) => container.querySelectorAll('[aria-label^="Remove"], [aria-label*="emove"]');

function render(props: Partial<React.ComponentProps<typeof ImageUploader>> & { count: number }) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const images = Array.from({ length: props.count }, (_, i) => ({ uri: `https://img/${i}.jpg` }));
  act(() => {
    root.render(<ImageUploader images={images} onAdd={jest.fn()} onRemove={jest.fn()} keepLast={props.keepLast} />);
  });
  return { container, unmount: () => act(() => root.unmount()) };
}

describe("ImageUploader keepLast", () => {
  it("hides the remove button of the only photo and says why", () => {
    const { container, unmount } = render({ count: 1, keepLast: true });

    expect(removeButtons(container)).toHaveLength(0);
    expect(container.textContent).toContain("at least one photo");
    unmount();
  });

  it("lets the owner remove a photo once another is there", () => {
    const { container, unmount } = render({ count: 2, keepLast: true });

    expect(removeButtons(container)).toHaveLength(2);
    expect(container.textContent).not.toContain("at least one photo");
    unmount();
  });

  it("does not lock anything by default, as in a draft", () => {
    const { container, unmount } = render({ count: 1 });

    expect(removeButtons(container)).toHaveLength(1);
    unmount();
  });
});
