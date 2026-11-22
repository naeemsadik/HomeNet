import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { useLanguageStore } from "@/i18n";
import type { PropertyAdminItem } from "../../types/admin";
import { PropertyAdminList } from "../PropertyAdminList";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

let container: HTMLDivElement;
let root: { render: (node: React.ReactNode) => void; unmount: () => void };

beforeEach(() => {
  useLanguageStore.getState().setLanguage("en");
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

const row = (id: string, title: string) =>
  ({ id, title, price: 100, price_currency: "BDT", status: "pending", subtype: null, media: [], created_at: "2026-11-01T00:00:00Z" }) as unknown as PropertyAdminItem;

const render = (highlightId: string | null, properties: PropertyAdminItem[]) =>
  act(async () =>
    root.render(
      <PropertyAdminList
        properties={properties}
        total={properties.length}
        isLoading={false}
        isMutating={false}
        activeStatus="pending"
        searchQuery=""
        onStatusChange={jest.fn()}
        onSearchChange={jest.fn()}
        onApprove={jest.fn()}
        onReject={jest.fn()}
        onDelete={jest.fn()}
        onView={jest.fn()}
        highlightId={highlightId}
        onClearHighlight={jest.fn()}
      />,
    ),
  );

describe("PropertyAdminList highlight", () => {
  it("shows the listing a notification pointed at first, and says it is being reviewed once", async () => {
    await render("p2", [row("p1", "First flat"), row("p2", "Second flat")]);

    const text = container.textContent ?? "";
    expect(text.indexOf("Second flat")).toBeLessThan(text.indexOf("First flat"));
    expect(text.match(/Reviewing listing for moderation/g)).toHaveLength(1);
  });

  it("says so when the listing is not in this list, instead of claiming it is being reviewed", async () => {
    await render("gone", [row("p1", "First flat")]);

    expect(container.textContent).toContain("That listing is not in this list");
    expect(container.textContent).not.toContain("Reviewing listing for moderation");
  });

  it("has a filter for rejected listings, which the badge already shows", async () => {
    await render(null, [row("p1", "First flat")]);

    expect(container.textContent).toContain("Rejected");
  });
});
