import { AxiosError } from "axios";
import apiClient from "@/services/apiClient";
import { submitPropertyFeedback } from "@/services/propertyApi";

jest.mock("@/services/apiClient", () => {
  const actual = jest.requireActual("@/services/apiClient");
  return {
    ...actual,
    __esModule: true,
    default: {
      post: jest.fn(),
      patch: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    },
  };
});

function axiosStatusError(status: number) {
  const err = new AxiosError(`HTTP ${status}`, String(status));
  (err as unknown as { response: { status: number; data: { message: string } } }).response = {
    status,
    data: { message: `Status ${status}` },
  };
  return err;
}

describe("submitPropertyFeedback service seam", () => {
  beforeEach(() => jest.clearAllMocks());

  it("posts directly to /v1/properties/:id/feedback when the endpoint exists", async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Feedback saved",
        data: {
          id: "prop-1",
          delivered: "api",
          status: "changes_requested",
          tags: ["image_quality"],
          notes: "Replace blurry living room shot",
        },
      },
    });

    const res = await submitPropertyFeedback("prop-1", {
      tags: ["image_quality"],
      notes: "  Replace blurry living room shot  ",
      requestChanges: true,
    });

    expect(apiClient.post).toHaveBeenCalledWith("/v1/properties/prop-1/feedback", {
      tags: ["image_quality"],
      notes: "Replace blurry living room shot",
      status: "changes_requested",
    });
    expect(apiClient.patch).not.toHaveBeenCalled();
    expect(res.data?.delivered).toBe("api");
  });

  it.each([404, 405, 501])("throws when the endpoint is missing (%s) and changes nothing", async (status) => {
    (apiClient.post as jest.Mock).mockRejectedValueOnce(axiosStatusError(status));

    await expect(
      submitPropertyFeedback("prop-1", {
        tags: ["unrealistic_pricing"],
        notes: "Asking price is well above the area",
        requestChanges: true,
      }),
    ).rejects.toBeTruthy();
    // The listing must not be unlisted while the seller's feedback is dropped.
    expect(apiClient.patch).not.toHaveBeenCalled();
  });

  it("rethrows real authorization failures (403) instead of swallowing them", async () => {
    (apiClient.post as jest.Mock).mockRejectedValueOnce(axiosStatusError(403));

    await expect(
      submitPropertyFeedback("prop-1", {
        tags: ["document_missing"],
        notes: "Missing deed",
      }),
    ).rejects.toBeTruthy();
    expect(apiClient.patch).not.toHaveBeenCalled();
  });
});
