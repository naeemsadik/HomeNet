import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { MobileFooter } from "@/components/MobileFooter";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => ({
  ArrowRight: () => null,
  Check: () => null,
  ChevronDown: () => null,
  Facebook: () => null,
  Linkedin: () => null,
  Youtube: () => null,
}));

describe("MobileFooter", () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });
  afterEach(() => container.remove());

  async function open(label: string) {
    const button = container.querySelector(`[aria-label="${label}"]`);
    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  it("shows the social links and the copyright notice, and no links to pages we do not have", async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(<MobileFooter />);
    });

    for (const name of ["Facebook", "LinkedIn", "YouTube"]) {
      expect(container.querySelector(`[aria-label="${name}"]`)).toBeTruthy();
    }
    expect(container.textContent).toContain("HomeNet Group Limited");
    // These used to all open /about.
    for (const word of ["Site map", "Safety and Security", "Accessibility"]) {
      expect(container.textContent).not.toContain(word);
    }

    await act(async () => root.unmount());
  });

  it("keeps the policies, account deletion and contact on screen with every section closed, each once", async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(<MobileFooter />);
    });

    const linkTo = (href: string) => container.querySelectorAll(`a[href="${href}"]`);
    // Contact is a mailto: link, which AppLink opens itself rather than rendering as an <a>.
    const contactLinks = () =>
      Array.from(container.querySelectorAll('[role="link"]')).filter((el) => el.textContent === "Contact us");
    const policyLinks = ["/privacy", "/terms", "/delete-account"];
    for (const href of policyLinks) expect(linkTo(href)).toHaveLength(1);
    expect(contactLinks()).toHaveLength(1);

    // Opening the Homenet section does not list them a second time.
    await open("Homenet");
    expect(linkTo("/about")).toHaveLength(1);
    for (const href of policyLinks) expect(linkTo(href)).toHaveLength(1);
    expect(contactLinks()).toHaveLength(1);

    await act(async () => root.unmount());
  });

  it("links the area names to their own pages and to the all-areas page", async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(<MobileFooter />);
    });
    await open("Locations");

    const hrefs = Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/buy/gulshan");
    expect(hrefs).toContain("/areas");
    expect(hrefs.some((href) => href?.includes("location="))).toBe(false);

    await act(async () => root.unmount());
  });
});
