import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { ResultListingCard } from "@/components/ResultListingCard";
import type { Property } from "@/features/property/types/property";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

const listing = (media: { url: string; media_type?: string; display_order?: number }[]) =>
  ({
    id: "p1",
    title: "3 bed apartment in Badda",
    listing_type: "sale",
    type: "residential",
    status: "active",
    price: 8500000,
    price_currency: "BDT",
    media,
    created_at: "2026-10-23T00:00:00Z",
  }) as unknown as Property;

async function render(property: Property) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(<ResultListingCard property={property} saved={false} onSave={() => undefined} />);
  });
  return { container, done: async () => { await act(async () => root.unmount()); container.remove(); } };
}

describe("ResultListingCard photos (the wide search result card)", () => {
  it.each([["IMAGE"], ["photo"], [undefined]])("shows the photo when the API calls its type %s", async (mediaType) => {
    const { container, done } = await render(listing([{ url: "https://res.cloudinary.com/x/image/upload/a.jpg", media_type: mediaType }]));
    expect(container.textContent).not.toContain("No photo provided");
    expect(container.innerHTML).toContain("a.jpg");
    await done();
  });

  it("still says so when the listing really has no photo", async () => {
    const { container, done } = await render(listing([]));
    expect(container.textContent).toContain("No photo provided");
    await done();
  });
});
