import React from "react";
import { Modal, Text, View } from "react-native";
import renderer, { act, type ReactTestRenderer, type ReactTestInstance } from "react-test-renderer";
import { OptionPicker } from "@/components/OptionPicker";
import { OverlayHost } from "@/components/OverlayModal";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function render(element: React.ReactElement): ReactTestRenderer {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
}

const textOf = (node: ReactTestInstance): string =>
  node.children.map((child) => (typeof child === "string" ? child : textOf(child))).join("");
const press = (node: ReactTestInstance) => act(() => node.props.onPress());
const buttons = (tree: ReactTestRenderer) =>
  tree.root.findAll((n) => n.props.accessibilityRole === "button" && typeof n.props.onPress === "function");
const rows = (tree: ReactTestRenderer) =>
  tree.root.findAll((n) => n.props.accessibilityRole === "menuitem" && typeof n.props.onPress === "function");
const modals = (tree: ReactTestRenderer) => tree.root.findAllByType(Modal);

const OPTIONS = [
  { label: "Any", value: "" },
  { label: "2 beds", value: "2" },
  { label: "3 beds", value: "3" },
];

describe("a drop-down inside another Modal on Android", () => {
  it("opens its options in the window it is already in, not in a second Modal", () => {
    const onChange = jest.fn();
    // The filters sheet: a Modal whose content is an OverlayHost.
    const tree = render(
      <Modal visible transparent>
        <OverlayHost>
          <View>
            <Text>Filters</Text>
            <OptionPicker value="" options={OPTIONS} onChange={onChange} />
          </View>
        </OverlayHost>
      </Modal>,
    );
    expect(modals(tree)).toHaveLength(1);

    press(buttons(tree)[0]);

    expect(rows(tree).map(textOf)).toEqual(["Any", "2 beds", "3 beds"]);
    expect(modals(tree)).toHaveLength(1);

    press(rows(tree)[2]);
    expect(onChange).toHaveBeenCalledWith("3");
    expect(rows(tree)).toHaveLength(0);
  });

  it("draws the options above the rest of the screen", () => {
    const tree = render(
      <OverlayHost>
        <OptionPicker value="" options={OPTIONS} onChange={() => undefined} />
      </OverlayHost>,
    );
    press(buttons(tree)[0]);

    const layer = rows(tree)[0].parent;
    let node: ReactTestInstance | null = layer;
    let styleOfLayers: Record<string, unknown> | undefined;
    while (node) {
      const style = Array.isArray(node.props.style) ? Object.assign({}, ...node.props.style.flat()) : node.props.style;
      if (style && style.zIndex === 999) styleOfLayers = style;
      node = node.parent;
    }
    expect(styleOfLayers).toMatchObject({ zIndex: 999, elevation: 999 });
  });

  it("keeps the options current when the picker re-renders", () => {
    const Harness = () => {
      const [value, setValue] = React.useState("");
      return (
        <OverlayHost>
          <OptionPicker value={value} options={OPTIONS} onChange={setValue} />
        </OverlayHost>
      );
    };
    const tree = render(<Harness />);
    press(buttons(tree)[0]);
    press(rows(tree)[1]);
    expect(textOf(tree.root)).toContain("2 beds");
    press(buttons(tree)[0]);
    expect(rows(tree).find((r) => r.props.accessibilityState?.selected)).toBeDefined();
    expect(textOf(rows(tree).find((r) => r.props.accessibilityState?.selected)!)).toBe("2 beds");
  });

  it("is an ordinary Modal when there is no host above it", () => {
    const tree = render(<OptionPicker value="" options={OPTIONS} onChange={() => undefined} />);
    press(buttons(tree)[0]);
    expect(modals(tree)).toHaveLength(1);
    expect(modals(tree)[0].props.visible).toBe(true);
    expect(rows(tree)).toHaveLength(3);
  });
});
