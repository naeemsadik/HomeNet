import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { useLanguageStore } from "@/i18n";
import MessRoute from "../../../../app/mess";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockPageMeta = jest.fn();
jest.mock("@/components/PageMeta", () => ({
  PageMeta: (props: any) => {
    mockPageMeta(props);
    return null;
  },
}));

jest.mock("@/features/mess/screens/MessBrowseScreen", () => ({
  MessBrowseScreen: () => <div data-testid="mess-browse-screen">Mess Browse Screen</div>,
}));

jest.mock("@/screens/NotFoundScreen", () => ({
  NotFoundScreen: () => <div>Page not found</div>,
}));

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

beforeEach(() => {
  jest.clearAllMocks();
  useLanguageStore.getState().setLanguage("en");
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("/mess route", () => {
  it("renders MessBrowseScreen with SEO metadata and never falls back to 404", async () => {
    await act(async () => root.render(<MessRoute />));

    expect(container.textContent).toContain("Mess Browse Screen");
    expect(container.textContent).not.toContain("Page not found");

    expect(mockPageMeta).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Shared living near your campus | HomeNet",
        description: expect.stringContaining("Find a seat in a mess or a shared room near your university in Dhaka"),
      }),
    );
  });
});
