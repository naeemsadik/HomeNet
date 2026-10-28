import React from "react";
import renderer, { act, type ReactTestRenderer, type ReactTestInstance } from "react-test-renderer";
import { OptionPicker } from "@/components/OptionPicker";
import { RightmoveFilterCard, type RightmoveFilters } from "@/components/RightmoveFilterCard";
import { defaultSearchFilters } from "@/features/property/utils/searchFilters";

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

const OPTIONS = [
  { label: "This area only", value: "" },
  { label: "+ 1 km", value: "1" },
  { label: "+ 5 km", value: "5" },
];

describe("OptionPicker on Android", () => {
  it("shows the current choice and opens a list of every option when tapped", () => {
    const tree = render(<OptionPicker value="1" options={OPTIONS} onChange={() => undefined} />);
    expect(textOf(tree.root)).toContain("+ 1 km");
    expect(rows(tree)).toHaveLength(0);

    press(buttons(tree)[0]);

    expect(rows(tree).map(textOf)).toEqual(["This area only", "+ 1 km", "+ 5 km"]);
    expect(rows(tree)[1].props.accessibilityState.selected).toBe(true);
  });

  it("reports the chosen value and closes the list", () => {
    const onChange = jest.fn();
    const tree = render(<OptionPicker value="" options={OPTIONS} onChange={onChange} />);
    press(buttons(tree)[0]);

    press(rows(tree)[2]);

    expect(onChange).toHaveBeenCalledWith("5");
    expect(rows(tree)).toHaveLength(0);
  });

  it("does not report a change when the current option is chosen again", () => {
    const onChange = jest.fn();
    const tree = render(<OptionPicker value="1" options={OPTIONS} onChange={onChange} />);
    press(buttons(tree)[0]);
    press(rows(tree)[1]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("falls back to the first option when the value is unknown", () => {
    const tree = render(<OptionPicker value="nope" options={OPTIONS} onChange={() => undefined} />);
    expect(textOf(tree.root)).toContain("This area only");
  });

  it("cannot be opened while disabled", () => {
    const tree = render(<OptionPicker value="" options={OPTIONS} onChange={() => undefined} disabled />);
    const box = buttons(tree)[0];
    expect(box.props.disabled).toBe(true);
    expect(box.props.accessibilityState.disabled).toBe(true);
  });

  it("trims the indent used to nest sub-areas in the closed box but keeps it in the list", () => {
    const nested = [
      { label: "All areas", value: "" },
      { label: "  Gulshan-1", value: "Gulshan-1" },
    ];
    const tree = render(<OptionPicker value="Gulshan-1" options={nested} onChange={() => undefined} />);
    expect(textOf(buttons(tree)[0])).toBe("Gulshan-1");
    press(buttons(tree)[0]);
    expect(textOf(rows(tree)[1])).toBe("  Gulshan-1");
  });
});

describe("the search filters on Android", () => {
  const filters: RightmoveFilters = {
    // The filter model gained bathrooms, size and amenities; spreading the
    // defaults keeps this fixture to what the test actually cares about.
    ...defaultSearchFilters,
    area: "Gulshan",
    radius: "",
    propertyType: "all",
    addedToSite: "",
    includeSold: false,
    verifiedOnly: false,
    minPrice: "",
    maxPrice: "",
    minBedrooms: "",
    maxBedrooms: "",
    query: "",
    purpose: "sale",
  };
  const areaOptions = [
    { label: "All areas", value: "" },
    { label: "Gulshan", value: "Gulshan" },
    { label: "Banani", value: "Banani" },
  ];

  const open = (tree: ReactTestRenderer, label: string) => {
    const box = buttons(tree).find((b) => textOf(b).includes(label));
    if (!box) throw new Error(`no filter box showing "${label}"`);
    press(box);
  };

  it("lets the person pick a distance", () => {
    const onFilterChange = jest.fn();
    const tree = render(
      <RightmoveFilterCard
        filters={filters}
        onFilterChange={onFilterChange}
        onSearch={() => undefined}
        areaOptions={areaOptions}
        radiusAvailable
      />,
    );

    open(tree, "This area only");
    press(rows(tree).find((r) => textOf(r) === "+ 5 km")!);
    expect(onFilterChange).toHaveBeenLastCalledWith(expect.objectContaining({ radius: "5", area: "Gulshan" }));
  });

  it("lets the person pick an area, and a new place resets the distance", () => {
    const onFilterChange = jest.fn();
    const tree = render(
      <RightmoveFilterCard
        filters={{ ...filters, radius: "5" }}
        onFilterChange={onFilterChange}
        onSearch={() => undefined}
        areaOptions={areaOptions}
        radiusAvailable
      />,
    );

    open(tree, "Gulshan");
    press(rows(tree).find((r) => textOf(r) === "Banani")!);
    expect(onFilterChange).toHaveBeenLastCalledWith(expect.objectContaining({ area: "Banani", radius: "" }));
  });

  it("lets the person choose when a listing was added", () => {
    const onFilterChange = jest.fn();
    const tree = render(
      <RightmoveFilterCard filters={filters} onFilterChange={onFilterChange} onSearch={() => undefined} />,
    );

    open(tree, "Anytime");
    press(rows(tree).find((r) => /7 days/.test(textOf(r)))!);
    expect(onFilterChange).toHaveBeenLastCalledWith(expect.objectContaining({ addedToSite: "7d" }));
  });

  it("keeps the distance box shut, with its reason shown, when there is no centre to measure from", () => {
    const tree = render(
      <RightmoveFilterCard
        filters={filters}
        onFilterChange={() => undefined}
        onSearch={() => undefined}
        areaOptions={areaOptions}
        radiusAvailable={false}
        radiusHint="Distance search is not available for this area yet."
      />,
    );
    const box = buttons(tree).find((b) => textOf(b).includes("This area only"))!;
    expect(box.props.disabled).toBe(true);
    expect(textOf(tree.root)).toContain("Distance search is not available for this area yet.");
  });
});
