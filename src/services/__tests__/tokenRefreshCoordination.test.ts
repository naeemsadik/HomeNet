import axios, { type AxiosResponse } from "axios";
import apiClient, { setUnauthorizedHandler } from "@/services/apiClient";
import * as tokenStorage from "@/services/tokenStorage";

describe("Token Refresh Coordination (Single-Flight & Cross-Tab)", () => {
  const originalNavigator = globalThis.navigator;
  let mockUnauthorized = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUnauthorized = jest.fn();
    setUnauthorizedHandler(mockUnauthorized);

    // Mock axios adapter so re-dispatched requests don't hit real network
    apiClient.defaults.adapter = jest.fn().mockImplementation(async (config) => ({
      data: { success: true, message: "OK", data: null },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }));
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it("fast-path: does NOT call /v1/auth/refresh if another tab has already rotated the access token", async () => {
    jest.spyOn(tokenStorage, "getAccessToken").mockResolvedValue("new-token-from-other-tab");
    jest.spyOn(tokenStorage, "getRefreshToken").mockResolvedValue("refresh-token-2");
    const saveSpy = jest.spyOn(tokenStorage, "saveTokens").mockResolvedValue();

    const postSpy = jest.spyOn(axios, "post");

    // Mock response interceptor execution for a 401 error with an old token
    const interceptor = (apiClient.interceptors.response as any).handlers[0].rejected;

    const mockRequest = {
      url: "/v1/properties",
      headers: { Authorization: "Bearer old-expired-token" },
    };

    const mock401Error = {
      response: { status: 401 },
      config: mockRequest,
    };

    // Simulate interceptor catching the 401
    await interceptor(mock401Error);

    // Assert: /v1/auth/refresh was NEVER called because storage already had a newer access token
    expect(postSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    // The request was updated with the new token from storage
    expect(mockRequest.headers.Authorization).toBe("Bearer new-token-from-other-tab");
    expect((mockRequest as any)._retry).toBe(true);
  });

  it("in-tab single-flight: parallel 401 requests trigger only ONE /v1/auth/refresh call", async () => {
    let accessToken = "expired-token-1";
    let refreshToken = "refresh-token-1";

    jest.spyOn(tokenStorage, "getAccessToken").mockImplementation(async () => accessToken);
    jest.spyOn(tokenStorage, "getRefreshToken").mockImplementation(async () => refreshToken);
    jest.spyOn(tokenStorage, "saveTokens").mockImplementation(async (newAccess, newRefresh) => {
      accessToken = newAccess;
      refreshToken = newRefresh;
    });

    const postSpy = jest.spyOn(axios, "post").mockResolvedValue({
      data: {
        success: true,
        data: {
          access_token: "new-access-token-2",
          refresh_token: "new-refresh-token-2",
        },
      },
    } as AxiosResponse);

    const interceptor = (apiClient.interceptors.response as any).handlers[0].rejected;

    const req1 = { url: "/v1/properties", headers: { Authorization: "Bearer expired-token-1" } };
    const req2 = { url: "/v1/users/me", headers: { Authorization: "Bearer expired-token-1" } };
    const req3 = { url: "/v1/notifications", headers: { Authorization: "Bearer expired-token-1" } };

    // Fire 3 simultaneous 401 errors in the same tab
    const p1 = interceptor({ response: { status: 401 }, config: req1 });
    const p2 = interceptor({ response: { status: 401 }, config: req2 });
    const p3 = interceptor({ response: { status: 401 }, config: req3 });

    await Promise.all([p1, p2, p3]);

    // Exactly one refresh call was made across all 3 parallel 401s
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith(
      expect.stringContaining("/v1/auth/refresh"),
      { refresh_token: "refresh-token-1" },
      expect.any(Object),
    );

    // All 3 requests were updated to the new token
    expect(req1.headers.Authorization).toBe("Bearer new-access-token-2");
    expect(req2.headers.Authorization).toBe("Bearer new-access-token-2");
    expect(req3.headers.Authorization).toBe("Bearer new-access-token-2");
  });

  it("cross-tab Web Locks: prevents duplicate refresh when two tabs trigger refresh simultaneously", async () => {
    let storedAccessToken = "expired-token";
    let storedRefreshToken = "refresh-1";

    jest.spyOn(tokenStorage, "getAccessToken").mockImplementation(async () => storedAccessToken);
    jest.spyOn(tokenStorage, "getRefreshToken").mockImplementation(async () => storedRefreshToken);
    jest.spyOn(tokenStorage, "saveTokens").mockImplementation(async (newAccess, newRefresh) => {
      storedAccessToken = newAccess;
      storedRefreshToken = newRefresh;
    });

    const postSpy = jest.spyOn(axios, "post").mockImplementation(async () => {
      // Simulate network latency for Tab 1's refresh call
      await new Promise((r) => setTimeout(r, 20));
      return {
        data: {
          success: true,
          data: { access_token: "rotated-access-2", refresh_token: "rotated-refresh-2" },
        },
      } as AxiosResponse;
    });

    // Mock Web Locks API to serialize execution
    let activeLock: Promise<any> = Promise.resolve();
    const mockLocks = {
      request: jest.fn().mockImplementation(async (_name: string, callback: () => Promise<any>) => {
        const prev = activeLock;
        let release!: () => void;
        activeLock = new Promise<void>((resolve) => {
          release = resolve;
        });
        await prev;
        try {
          return await callback();
        } finally {
          release!();
        }
      }),
    };

    Object.defineProperty(globalThis, "navigator", {
      value: { locks: mockLocks },
      configurable: true,
      writable: true,
    });

    const interceptor = (apiClient.interceptors.response as any).handlers[0].rejected;

    const tab1Req = { url: "/v1/properties", headers: { Authorization: "Bearer expired-token" } };
    const tab2Req = { url: "/v1/profile", headers: { Authorization: "Bearer expired-token" } };

    // Tab 1 and Tab 2 enter interceptor simultaneously
    const tab1Promise = interceptor({ response: { status: 401 }, config: tab1Req });
    const tab2Promise = interceptor({ response: { status: 401 }, config: tab2Req });

    await Promise.all([tab1Promise, tab2Promise]);

    // navigator.locks was used
    expect(mockLocks.request).toHaveBeenCalled();

    // Exactly ONE network refresh call was made! Tab 2 waited for Tab 1, saw the new token, and did not call API!
    expect(postSpy).toHaveBeenCalledTimes(1);

    expect(tab1Req.headers.Authorization).toBe("Bearer rotated-access-2");
    expect(tab2Req.headers.Authorization).toBe("Bearer rotated-access-2");
  });

  it("handles failed refresh cleanly: clears tokens, notifies unauthorized, does not retry", async () => {
    jest.spyOn(tokenStorage, "getAccessToken").mockResolvedValue("expired-access");
    jest.spyOn(tokenStorage, "getRefreshToken").mockResolvedValue("revoked-refresh");
    const clearSpy = jest.spyOn(tokenStorage, "clearTokens").mockResolvedValue();

    jest.spyOn(axios, "post").mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 401,
        data: { success: false, error_code: 1103, message: "Invalid refresh token" },
      },
    });

    const interceptor = (apiClient.interceptors.response as any).handlers[0].rejected;

    const mockRequest = { url: "/v1/properties", headers: { Authorization: "Bearer expired-access" } };

    await expect(
      interceptor({ response: { status: 401 }, config: mockRequest }),
    ).rejects.toThrow();

    expect(clearSpy).toHaveBeenCalled();
    expect(mockUnauthorized).toHaveBeenCalled();
    expect((mockRequest as any)._retry).toBe(true);
  });
});
