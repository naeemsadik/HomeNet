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

  it("logs in a release build too, where it used to log nothing and a crash left no trace", () => {
    const globals = globalThis as { __DEV__?: boolean };
    const wasDev = globals.__DEV__;
    globals.__DEV__ = false;
    try {
      reportError(new Error("Release crash"), { endpoint: "/buy" });
    } finally {
      globals.__DEV__ = wasDev;
    }

    const line = consoleSpy.mock.calls.map((call) => String(call[0])).join("\n");
    expect(JSON.parse(line)).toMatchObject({ level: "error", message: "Release crash", endpoint: "/buy" });
  });

  it("downgrades HTTP 429 rate limit logging from console.error to console.warn in __DEV__", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const error = Object.assign(new Error("Too Many Requests"), { status: 429 });
      const report = reportError(error, { endpoint: "/v1/properties" });

      expect(report.status).toBe(429);
      expect(warnSpy).toHaveBeenCalledWith("[HomeNet Rate Limit 429]", report);
      expect(consoleSpy).not.toHaveBeenCalled();
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("extracts status 429 from response.status and logs warn in release mode", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const globals = globalThis as { __DEV__?: boolean };
    const wasDev = globals.__DEV__;
    globals.__DEV__ = false;
    try {
      const axiosLikeError = {
        name: "AxiosError",
        message: "Request failed with status code 429",
        response: { status: 429, data: { message: "Too many requests" } },
      };
      const report = reportError(axiosLikeError, { endpoint: "/v1/properties" });

      expect(report.status).toBe(429);
      expect(warnSpy).toHaveBeenCalled();
      const line = warnSpy.mock.calls.map((call) => String(call[0])).join("\n");
      expect(JSON.parse(line)).toMatchObject({ level: "warn", status: 429 });
      expect(consoleSpy).not.toHaveBeenCalled();
    } finally {
      globals.__DEV__ = wasDev;
      warnSpy.mockRestore();
    }
  });
});
