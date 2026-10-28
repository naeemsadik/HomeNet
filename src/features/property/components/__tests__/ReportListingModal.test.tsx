import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { useLanguageStore } from "@/i18n/useTranslation";
import { ReportListingModal } from "../ReportListingModal";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => ({
  Check: () => "Check",
  CheckCircle2: () => "CheckCircle2",
  Flag: () => "Flag",
  X: () => "X",
}));

describe("ReportListingModal", () => {
  it("renders when visible is true with report reasons", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ReportListingModal
          onClose={jest.fn()}
          propertyId="prop-123"
          propertyTitle="Gulshan 3 Bed Luxury Flat"
          visible={true}
        />
      );
    });

    expect(document.body.textContent).toContain("Report This Listing");
    expect(document.body.textContent).toContain("Fake or unavailable listing");
    expect(document.body.textContent).toContain("Broker spam or 0% brokerage violation");
    expect(document.body.textContent).toContain("Submit Report");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("does not render modal contents when visible is false", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ReportListingModal
          onClose={jest.fn()}
          propertyId="prop-123"
          propertyTitle="Gulshan 3 Bed Luxury Flat"
          visible={false}
        />
      );
    });

    expect(container.textContent).not.toContain("Report This Listing");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("renders authentic Bengali terminology when language is bn", async () => {
    useLanguageStore.getState().setLanguage("bn");

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ReportListingModal
          onClose={jest.fn()}
          propertyId="prop-123"
          propertyTitle="Gulshan 3 Bed Luxury Flat"
          visible={true}
        />
      );
    });

    expect(document.body.textContent).toContain("ভুয়া বিজ্ঞাপন বা সমস্যা রিপোর্ট করুন");
    expect(document.body.textContent).toContain("ভুয়া বা অবাস্তব লিস্টিং");
    expect(document.body.textContent).toContain("রিপোর্ট জমা দিন");

    await act(async () => {
      root.unmount();
    });
    container.remove();
    useLanguageStore.getState().setLanguage("en");
  });
});
