import React from "react";
import renderer, { act } from "react-test-renderer";
import { FormFooter } from "../FormFooter";

jest.mock("@/components/Footer", () => ({
  Footer: () => {
    throw new Error("the app must not draw the footer under a form");
  },
}));

describe("a form's footer in the app", () => {
  it("draws nothing", () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<FormFooter />);
    });
    expect(tree.toJSON()).toBeNull();
    act(() => tree.unmount());
  });
});
