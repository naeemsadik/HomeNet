import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AreaPicker } from "@/components/AreaPicker";
import { fetchAreaChildren, fetchAreas } from "@/services/areaApi";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));
jest.mock("@/services/areaApi", () => ({ fetchAreas: jest.fn(), fetchAreaChildren: jest.fn() }));

const never = () => new Promise<never>(() => {});

/**
 * The picker opening before the area list arrives used to loop forever:
 * useAreaPicker handed it a new empty array on every render while loading, and
 * the picker resets its keyboard focus during render whenever that list
 * changes, so each render scheduled another ("Too many re-renders" on Android,
 * where the list is not cached on first use).
 */
describe("AreaPicker while the area list is loading", () => {
  let container: HTMLDivElement;
  let root: { render: (node: React.ReactNode) => void; unmount: () => void };
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    (fetchAreas as jest.Mock).mockImplementation(never);
    (fetchAreaChildren as jest.Mock).mockImplementation(never);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    errorSpy.mockRestore();
  });

  const picker = (visible: boolean) => (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <AreaPicker visible={visible} onClose={() => {}} onSelect={() => {}} selectedArea={null} />
    </QueryClientProvider>
  );

  it("opens without a render loop", () => {
    expect(() => act(() => root.render(picker(true)))).not.toThrow();
    const loopErrors = errorSpy.mock.calls.filter((args) => String(args[0]).includes("Too many re-renders"));
    expect(loopErrors).toHaveLength(0);
  });

  it("re-renders while still loading without a render loop", () => {
    act(() => root.render(picker(true)));
    expect(() => act(() => root.render(picker(true)))).not.toThrow();
  });
});
