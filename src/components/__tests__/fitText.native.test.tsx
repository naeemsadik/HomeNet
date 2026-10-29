import React from "react";
import { Text } from "react-native";
import renderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { FitText } from "@/components/FitText";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const flat = (style: unknown): Record<string, number> =>
  Array.isArray(style) ? Object.assign({}, ...style.map(flat)) : ((style as Record<string, number>) ?? {});
const layout = (width: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width, height: 40 } } });

function setup() {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <FitText accessibilityRole="header" style={{ fontSize: 28, lineHeight: 33, letterSpacing: -0.6 }}>
        Find Your Dream With Trust
      </FitText>,
    );
  });
  const texts = tree.root.findAllByType(Text);
  const visible = texts.find((t) => t.props.numberOfLines === 1)!;
  const measuring = texts.find((t) => typeof t.props.onLayout === "function")!;
  const box = tree.root.find((n) => typeof n.props.onLayout === "function" && n.type !== Text);
  return { tree, visible: () => tree.root.findAllByType(Text).find((t) => t.props.numberOfLines === 1)!, measuring, box, first: visible };
}

describe("FitText", () => {
  it("shows the style's own size until it knows both widths", () => {
    const { first } = setup();
    expect(flat(first.props.style).fontSize).toBe(28);
  });

  it("sizes the line to run the full width of its box, on any screen", () => {
    for (const boxWidth of [288, 328, 380, 568, 735]) {
      const { visible, measuring, box } = setup();
      // At the 100-point measuring size the line is 1160 wide.
      act(() => measuring.props.onLayout(layout(1160)));
      act(() => box.props.onLayout(layout(boxWidth)));

      const style = flat(visible().props.style);
      const linePx = (1160 * style.fontSize) / 100;
      // Ends within 1% of the right edge, never past it.
      expect(linePx).toBeLessThanOrEqual(boxWidth);
      expect(linePx).toBeGreaterThan(boxWidth * 0.995);
      // Spacing and line height keep the style's proportions.
      expect(style.letterSpacing).toBeCloseTo((-0.6 / 28) * style.fontSize, 5);
      expect(style.lineHeight).toBe(Math.round((33 / 28) * style.fontSize));
    }
  });

  it("is read once: the measuring copy is hidden from screen readers", () => {
    const { tree, visible } = setup();
    expect(visible().props.accessibilityRole).toBe("header");
    const hidden = tree.root.find((n) => n.props.importantForAccessibility === "no-hide-descendants");
    expect(hidden.props.accessibilityElementsHidden).toBe(true);
  });
});
