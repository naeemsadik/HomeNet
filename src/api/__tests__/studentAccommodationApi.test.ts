import apiClient from "@/services/apiClient";
import {
  BASE_PATH,
  createDraft,
  deleteAccommodation,
  getAccommodationDetail,
  getAccommodations,
  getMyAccommodations,
  publishAccommodation,
  revealContact,
  toggleSave,
  updateDraft,
  uploadMedia,
} from "@/api/studentAccommodationApi";
import type {
  CreateAccommodationDraftPayload,
  StudentAccommodationSearchParams,
} from "@/types/studentAccommodation";

jest.mock("@/services/apiClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.Mock;
const mockPost = apiClient.post as jest.Mock;
const mockPatch = apiClient.patch as jest.Mock;
const mockDelete = apiClient.delete as jest.Mock;

describe("studentAccommodationApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("BASE_PATH", () => {
    it("is strictly /v1/student-accommodation", () => {
      expect(BASE_PATH).toBe("/v1/student-accommodation");
    });
  });

  describe("getAccommodations", () => {
    it("calls GET /v1/student-accommodation with serialized search params", async () => {
      const searchParams: StudentAccommodationSearchParams = {
        university_id: "univ-du",
        max_walking_time: 15,
        gender_policy: "male",
        subtype: "hostel",
        min_rent: 3000,
        max_rent: 7000,
        has_lift: true,
        has_meal: true,
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        items: [],
        total: 0,
        has_more: false,
      };

      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Success",
          data: mockResponse,
        },
      });

      const result = await getAccommodations(searchParams);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith("/v1/student-accommodation", {
        params: searchParams,
      });
      expect(result).toEqual(mockResponse);
    });

    it("handles direct unwrapped response payload", async () => {
      const mockResponse = {
        items: [],
        total: 0,
        has_more: false,
      };

      mockGet.mockResolvedValueOnce({ data: mockResponse });

      const result = await getAccommodations();
      expect(mockGet).toHaveBeenCalledWith("/v1/student-accommodation", {
        params: undefined,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getAccommodationDetail", () => {
    it("calls GET /v1/student-accommodation/:id and returns details", async () => {
      const mockDetail = {
        id: "acc-101",
        title: "Green Hall Mess",
        category: "student_accommodation",
        subtype: "mess",
        gender_policy: "male",
        total_rent: 4500,
        currency: "BDT",
      };

      mockGet.mockResolvedValueOnce({
        data: { success: true, message: "OK", data: mockDetail },
      });

      const result = await getAccommodationDetail("acc-101");
      expect(mockGet).toHaveBeenCalledWith("/v1/student-accommodation/acc-101");
      expect(result).toEqual(mockDetail);
    });
  });

  describe("createDraft", () => {
    it("calls POST /v1/student-accommodation/draft with payload", async () => {
      const payload: CreateAccommodationDraftPayload = {
        category: "student_accommodation",
        subtype: "hostel",
        gender_policy: "male",
        title: "Dhaka Student Hostel",
        description: "Close to DU",
        rent: 5000,
        total_seats: 10,
        available_seats: 2,
        safety: {
          floor_level: 3,
          has_lift: true,
          has_security_guard: true,
          has_cctv: true,
          has_generator: true,
          has_wifi: true,
        },
        governance: {
          rent: 5000,
          security_deposit: 5000,
          advance_months: 1,
          notice_period_days: 30,
        },
        rules: {
          smoking_policy: "not_allowed",
          guest_policy: "day_only",
          meal_system: "included",
        },
        university_id: "univ-du",
        latitude: 23.734,
        longitude: 90.392,
      };

      const mockDraftResponse = { id: "draft-1", status: "draft" as const };
      mockPost.mockResolvedValueOnce({
        data: { success: true, data: mockDraftResponse },
      });

      const result = await createDraft(payload);
      expect(mockPost).toHaveBeenCalledWith(
        "/v1/student-accommodation/draft",
        payload,
      );
      expect(result).toEqual(mockDraftResponse);
    });
  });

  describe("updateDraft", () => {
    it("calls PATCH /v1/student-accommodation/:id/draft with partial payload", async () => {
      const partialPayload = { rent: 5500, available_seats: 1 };
      const mockUpdateResponse = { id: "draft-1", status: "draft" as const };

      mockPatch.mockResolvedValueOnce({
        data: { success: true, data: mockUpdateResponse },
      });

      const result = await updateDraft("draft-1", partialPayload);
      expect(mockPatch).toHaveBeenCalledWith(
        "/v1/student-accommodation/draft-1/draft",
        partialPayload,
      );
      expect(result).toEqual(mockUpdateResponse);
    });
  });

  describe("uploadMedia", () => {
    it("appends label, file, and is_primary to FormData and POSTs to /v1/student-accommodation/:id/media", async () => {
      const mockFile = new Blob(["dummy-image-bytes"], { type: "image/jpeg" });
      const mockMediaItem = {
        id: "media-1",
        url: "https://cdn.homenet.com/media-1.jpg",
        label: "room" as const,
        is_primary: true,
      };

      mockPost.mockResolvedValueOnce({
        data: { success: true, data: mockMediaItem },
      });

      const result = await uploadMedia("acc-1", mockFile, "room", true);

      expect(mockPost).toHaveBeenCalledTimes(1);
      const [endpoint, formData, config] = mockPost.mock.calls[0];

      expect(endpoint).toBe("/v1/student-accommodation/acc-1/media");
      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get("label")).toBe("room");
      expect(formData.get("is_primary")).toBe("true");
      expect(formData.get("file")).toBeDefined();
      expect(config).toEqual({
        headers: {
          "Content-Type": undefined,
        },
      });
      expect(result).toEqual(mockMediaItem);
    });

    it("uploads media without is_primary flag when not provided", async () => {
      const mockFile = new Blob(["dummy-bytes"], { type: "image/jpeg" });
      const mockMediaItem = {
        id: "media-2",
        url: "https://cdn.homenet.com/media-2.jpg",
        label: "washroom" as const,
      };

      mockPost.mockResolvedValueOnce({
        data: { success: true, data: mockMediaItem },
      });

      const result = await uploadMedia("acc-2", mockFile, "washroom");

      const [, formData] = mockPost.mock.calls[0];
      expect(formData.get("label")).toBe("washroom");
      expect(formData.get("is_primary")).toBeNull();
      expect(result).toEqual(mockMediaItem);
    });
  });

  describe("publishAccommodation", () => {
    it("calls POST /v1/student-accommodation/:id/publish", async () => {
      const mockPublishResponse = { id: "acc-1", status: "published" as const };
      mockPost.mockResolvedValueOnce({
        data: { success: true, data: mockPublishResponse },
      });

      const result = await publishAccommodation("acc-1");
      expect(mockPost).toHaveBeenCalledWith(
        "/v1/student-accommodation/acc-1/publish",
      );
      expect(result).toEqual(mockPublishResponse);
    });
  });

  describe("deleteAccommodation", () => {
    it("calls DELETE /v1/student-accommodation/:id", async () => {
      mockDelete.mockResolvedValueOnce({
        data: { success: true, message: "Deleted" },
      });

      await expect(deleteAccommodation("acc-1")).resolves.toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith("/v1/student-accommodation/acc-1");
    });
  });

  describe("toggleSave", () => {
    it("calls POST /v1/student-accommodation/:id/save", async () => {
      mockPost.mockResolvedValueOnce({
        data: { success: true, data: { is_saved: true } },
      });

      const result = await toggleSave("acc-1");
      expect(mockPost).toHaveBeenCalledWith(
        "/v1/student-accommodation/acc-1/save",
      );
      expect(result).toEqual({ is_saved: true });
    });
  });

  describe("revealContact", () => {
    it("calls POST /v1/student-accommodation/:id/reveal-contact", async () => {
      const mockRevealData = {
        contact_revealed: true,
        contact_channels: {
          allows_call: true,
          allows_whatsapp: true,
          masked_phone: "+88017****5678",
        },
      };

      mockPost.mockResolvedValueOnce({
        data: { success: true, data: mockRevealData },
      });

      const result = await revealContact("acc-1");
      expect(mockPost).toHaveBeenCalledWith(
        "/v1/student-accommodation/acc-1/reveal-contact",
      );
      expect(result).toEqual(mockRevealData);
    });
  });

  describe("getMyAccommodations", () => {
    it("calls GET /v1/student-accommodation/my", async () => {
      const mockMyAccommodations = [
        {
          id: "acc-1",
          title: "My Hostel Listing",
          category: "student_accommodation",
          subtype: "hostel",
          gender_policy: "male",
          total_rent: 4000,
          currency: "BDT",
          primary_image_url: "https://example.com/img.jpg",
          nearest_campus: {
            university_id: "du",
            university_name: "Dhaka University",
            walking_time_minutes: 5,
            distance_meters: 400,
          },
          available_seats: 1,
          total_seats: 4,
          updated_at: "2026-11-04T00:00:00Z",
        },
      ];

      mockGet.mockResolvedValueOnce({
        data: { success: true, data: mockMyAccommodations },
      });

      const result = await getMyAccommodations();
      expect(mockGet).toHaveBeenCalledWith("/v1/student-accommodation/my");
      expect(result).toEqual(mockMyAccommodations);
    });
  });
});

