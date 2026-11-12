import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { TextInput } from "react-native";
import { MortgageCalculatorScreen } from "../screens/MortgageCalculatorScreen";
import { monthlyInstalment } from "../utils/mortgageMath";
import { en } from "@/i18n";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockPush = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));
jest.mock("@/components/AppChrome", () => ({
  AppChrome: (props: { children: React.ReactNode }) => props.children,
}));

const textOf = (node: ReactTestInstance | string | number | null | undefined): string => {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  return (node.children || []).map((child) => textOf(child as ReactTestInstance)).join("");
};

function setup() {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<MortgageCalculatorScreen />);
  });
  const root = tree!.root;
  const type = (label: string, value: string) => {
    const input = root.findAllByType(TextInput).find((node) => node.props.accessibilityLabel === label)!;
    act(() => input.props.onChangeText(value));
  };
  const pressTab = (label: string) => {
    const tab = root.findAll((n) => n.props.accessibilityRole === "tab" && n.props.accessibilityLabel === label)[0];
    act(() => tab.props.onPress());
  };
  return { root, type, pressTab, text: () => textOf(root) };
}

describe("MortgageCalculatorScreen", () => {
  it("has one h1 and starts with nothing filled in", () => {
    const { root, text } = setup();
    expect(root.findAll((n) => n.props.accessibilityRole === "header" && n.props["aria-level"] === 1)).toHaveLength(1);
    for (const input of root.findAllByType(TextInput)) expect(input.props.value).toBe("");
    expect(text()).toContain(en.mortgage.emptyPayment);
  });

  it("suggests no interest rate of its own", () => {
    const { root } = setup();
    const rate = root.findAllByType(TextInput).find((n) => n.props.accessibilityLabel === en.mortgage.rateLabel)!;
    expect(rate.props.value).toBe("");
    expect(rate.props.placeholder).toBeUndefined();
  });

  it("shows the monthly payment once price and rate are entered", () => {
    const { type, text } = setup();
    type(en.mortgage.priceLabel, "12000000");
    type(en.mortgage.downLabel, "3600000");
    type(en.mortgage.rateLabel, "9");

    const expected = Math.round(monthlyInstalment(8400000, 9, 20)).toLocaleString("en-IN");
    expect(text()).toContain(`৳ ${expected}`);
    expect(text()).toContain("৳ 84,00,000");
    expect(text()).toContain(en.mortgage.cashNote);
  });

  it("explains a down payment that leaves no loan", () => {
    const { type, text } = setup();
    type(en.mortgage.priceLabel, "5000000");
    type(en.mortgage.downLabel, "5000000");
    type(en.mortgage.rateLabel, "9");
    expect(text()).toContain(en.mortgage.downTooHigh);
    expect(text()).toContain(en.mortgage.emptyPayment);
  });

  it("works out an affordable price from income on the second tab", () => {
    const { type, pressTab, text } = setup();
    pressTab(en.mortgage.tabAfford);
    expect(text()).toContain(en.mortgage.emptyAfford);

    type(en.mortgage.incomeLabel, "150000");
    type(en.mortgage.rateLabel, "9");
    expect(text()).toContain(en.mortgage.affordPrice);
    expect(text()).toContain("৳ 60,000");
  });

  it("says so when other instalments leave nothing for a home loan", () => {
    const { type, pressTab, text } = setup();
    pressTab(en.mortgage.tabAfford);
    type(en.mortgage.incomeLabel, "100000");
    type(en.mortgage.existingLabel, "60000");
    type(en.mortgage.rateLabel, "9");
    expect(text()).toContain(en.mortgage.nothingLeft);
  });

  it("names no bank", () => {
    const { text } = setup();
    expect(text()).not.toMatch(/DBH|IDLC|BRAC|Eastern Bank/);
  });
});
