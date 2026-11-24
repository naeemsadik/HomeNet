import {
  fallbackOn404,
  fixtureBackend,
  getUniversities,
  httpBackend,
  searchMess,
  shouldUseMockBackend,
} from "../api/messApi";

describe("messApi backend resolution and 404 fallback", () => {
  const origEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...origEnv };
  });

  afterAll(() => {
    process.env = origEnv;
  });

  describe("shouldUseMockBackend", () => {
    it("returns true by default when live API is not enabled", () => {
      delete process.env.EXPO_PUBLIC_MESS_LIVE_API;
      delete process.env.EXPO_PUBLIC_MESS_USE_MOCK;
      delete process.env.EXPO_PUBLIC_MESS_FIXTURES;
      expect(shouldUseMockBackend()).toBe(true);
    });

    it("returns true when EXPO_PUBLIC_MESS_USE_MOCK is set to true", () => {
      process.env.EXPO_PUBLIC_MESS_USE_MOCK = "true";
      delete process.env.EXPO_PUBLIC_MESS_LIVE_API;
      expect(shouldUseMockBackend()).toBe(true);
    });

    it("returns true when EXPO_PUBLIC_MESS_FIXTURES is set to true", () => {
      process.env.EXPO_PUBLIC_MESS_FIXTURES = "true";
      delete process.env.EXPO_PUBLIC_MESS_LIVE_API;
      expect(shouldUseMockBackend()).toBe(true);
    });

    it("returns false when EXPO_PUBLIC_MESS_LIVE_API is explicitly set to true", () => {
      process.env.EXPO_PUBLIC_MESS_LIVE_API = "true";
      delete process.env.EXPO_PUBLIC_MESS_USE_MOCK;
      delete process.env.EXPO_PUBLIC_MESS_FIXTURES;
      expect(shouldUseMockBackend()).toBe(false);
    });
  });

  describe("fallbackOn404", () => {
    it("returns primary result if primary call succeeds", async () => {
      const primary = jest.fn().mockResolvedValue("live-data");
      const fallback = jest.fn().mockResolvedValue("mock-data");

      const result = await fallbackOn404(primary, fallback);
      expect(result).toBe("live-data");
      expect(fallback).not.toHaveBeenCalled();
    });

    it("falls back to mock if primary call fails with status 404", async () => {
      const primary = jest.fn().mockRejectedValue({ status: 404, message: "Not Found" });
      const fallback = jest.fn().mockResolvedValue("mock-fallback");

      const result = await fallbackOn404(primary, fallback);
      expect(result).toBe("mock-fallback");
      expect(fallback).toHaveBeenCalled();
    });

    it("falls back to mock if primary call fails with response.status 404", async () => {
      const primary = jest.fn().mockRejectedValue({ response: { status: 404 } });
      const fallback = jest.fn().mockResolvedValue("mock-response-fallback");

      const result = await fallbackOn404(primary, fallback);
      expect(result).toBe("mock-response-fallback");
      expect(fallback).toHaveBeenCalled();
    });

    it("rethrows non-404 errors without falling back", async () => {
      const primary = jest.fn().mockRejectedValue({ status: 500, message: "Internal Server Error" });
      const fallback = jest.fn().mockResolvedValue("mock-data");

      await expect(fallbackOn404(primary, fallback)).rejects.toEqual(
        expect.objectContaining({ status: 500 }),
      );
      expect(fallback).not.toHaveBeenCalled();
    });
  });

  describe("default invocation with mock backend", () => {
    it("resolves universities from fixtureBackend without network errors", async () => {
      delete process.env.EXPO_PUBLIC_MESS_LIVE_API;
      const universities = await getUniversities();
      expect(Array.isArray(universities)).toBe(true);
      expect(universities.length).toBeGreaterThan(0);
      expect(universities.some((u) => u.short_name === "UIU")).toBe(true);
    });

    it("resolves mess search listings from fixtureBackend without network errors", async () => {
      delete process.env.EXPO_PUBLIC_MESS_LIVE_API;
      const result = await searchMess({}, 1, 20);
      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });
  });
});
