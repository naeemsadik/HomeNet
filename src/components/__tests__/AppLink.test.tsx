import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { Text } from "react-native";
import { AppLink } from "@/components/ui";

jest.mock("@/components/icons", () => ({
  ArrowRight: () => null,
  Check: () => null,
  ChevronDown: () => null,
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("AppLink on the web", () => {
  it("renders a real anchor with the page's address, which is what search engines follow", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <AppLink accessibilityLabel="Properties for sale in Gulshan" href="/buy/gulshan">
          <Text>Gulshan</Text>
        </AppLink>,
      );
    });

    const anchor = container.querySelector("a");
    expect(anchor).toBeTruthy();
    expect(anchor?.getAttribute("href")).toBe("/buy/gulshan");
    expect(anchor?.getAttribute("aria-label")).toBe("Properties for sale in Gulshan");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
