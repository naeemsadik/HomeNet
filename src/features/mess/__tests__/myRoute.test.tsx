import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import MyMessListingsRedirect from "../../../../app/mess/my";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("expo-router", () => ({ Redirect: ({ href }: { href: string }) => <p>{`redirect to ${href}`}</p> }));

/** The old My seat listings address, kept so saved links still land somewhere (issue 197). */
describe("/mess/my", () => {
  it("sends the seller to My listings, where their seat listings now are", async () => {
    const container = document.createElement("div");
    const root = createRoot(container);
    await act(async () => root.render(<MyMessListingsRedirect />));
    expect(container.textContent).toBe("redirect to /my-properties");
    await act(async () => root.unmount());
  });
});
