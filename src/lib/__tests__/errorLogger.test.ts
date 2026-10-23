import { reportError } from "@/lib/errorLogger";

describe("errorLogger", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("captures full stack trace and error properties without throwing", () => {
    const error = new Error("Test error message");
    const report = reportError(error, { endpoint: "/api/v1/properties" });

    expect(report.name).toBe("Error");
    expect(report.message).toBe("Test error message");
    expect(report.stack).toBeDefined();
    expect(report.endpoint).toBe("/api/v1/properties");
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("handles non-Error objects safely", () => {
    const report = reportError("plain string failure", { contextKey: "value" });

    expect(report.name).toBe("UnknownError");
    expect(report.message).toBe("plain string failure");
    expect(report.context).toEqual({ contextKey: "value" });
    expect(consoleSpy).toHaveBeenCalled();
  });
});
