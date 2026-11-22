import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { PropertyAdminItemRow } from "../PropertyAdminItem";
import { useLanguageStore } from "@/i18n";
import type { PropertyAdminItem } from "../../types/admin";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

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

const samplePendingItem: PropertyAdminItem = ({
  id: "prop-saturn",
  title: "saturn house",
  price: 453,
  price_currency: "BDT",
  status: "pending",
  subtype: null,
  media: [{ id: "m1", url: "https://example.com/img.jpg", property_id: "prop-saturn" }],
  user: {
    id: "u-seller",
    full_name: "Ejaz Uddin Swaron",
    avatar_url: null,
  },
  created_at: "2026-11-19T10:00:00Z",
} as unknown) as PropertyAdminItem;

describe("PropertyAdminItemRow", () => {
  it("renders pending listing with Activate, Move to draft, Request Changes, View, and Delete", async () => {
    const onApprove = jest.fn();
    const onReject = jest.fn();
    const onDelete = jest.fn();
    const onView = jest.fn();
    const onRequestChanges = jest.fn();

    await act(async () => {
      root.render(
        <PropertyAdminItemRow
          item={samplePendingItem}
          onApprove={onApprove}
          onReject={onReject}
          onDelete={onDelete}
          onView={onView}
          onRequestChanges={onRequestChanges}
        />,
      );
    });

    const text = container.textContent || "";
    expect(text).toContain("saturn house");
    expect(text).toContain("453");
    expect(text).toContain("Ejaz Uddin Swaron");
    expect(text).toContain("Activate");
    expect(text).toContain("Move to draft");
    expect(text).toContain("Request changes");
    expect(text).toContain("View");

    // Strictly enforce Least Privilege: Admins must NEVER directly edit a seller listing
    expect(text).not.toContain("Edit Property");
    expect(text).not.toContain("Edit");
  });

  it("calls onRequestChanges when Request changes is pressed", async () => {
    const onRequestChanges = jest.fn();

    await act(async () => {
      root.render(
        <PropertyAdminItemRow
          item={samplePendingItem}
          onApprove={jest.fn()}
          onReject={jest.fn()}
          onDelete={jest.fn()}
          onView={jest.fn()}
          onRequestChanges={onRequestChanges}
        />,
      );
    });

    const reqBtn = Array.from(container.querySelectorAll("div, [role='button']")).find((el) =>
      el.textContent?.trim() === "Request changes",
    );
    expect(reqBtn).toBeDefined();

    await act(async () => {
      reqBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onRequestChanges).toHaveBeenCalledWith(samplePendingItem);
  });

  it("gives every action a button role and a 44 px target, so the delete icon is easy to hit and announced", async () => {
    await act(async () => {
      root.render(
        <PropertyAdminItemRow
          item={samplePendingItem}
          onApprove={jest.fn()}
          onReject={jest.fn()}
          onDelete={jest.fn()}
          onView={jest.fn()}
          onRequestChanges={jest.fn()}
        />,
      );
    });

    const labels = ["Activate property", "Move property to draft", "Request changes on property", "View property", "Delete property"];
    for (const label of labels) {
      const button = container.querySelector(`[aria-label="${label}"]`) as HTMLElement;
      expect(button).not.toBeNull();
      expect(button.getAttribute("role")).toBe("button");
      const style = getComputedStyle(button);
      expect(Math.max(parseFloat(style.minHeight) || 0, parseFloat(style.height) || 0)).toBeGreaterThanOrEqual(44);
    }
  });

  it("does not say it is reviewing the listing on the card itself; the list banner says it once", async () => {
    await act(async () => {
      root.render(
        <PropertyAdminItemRow
          item={samplePendingItem}
          onApprove={jest.fn()}
          onReject={jest.fn()}
          onDelete={jest.fn()}
          onView={jest.fn()}
          isHighlighted={true}
        />,
      );
    });

    expect(container.textContent).not.toContain("Reviewing listing for moderation");
  });
});
