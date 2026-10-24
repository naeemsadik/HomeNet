import axios from "axios";
import { toApiError } from "@/services/apiClient";

function httpError(status: number, body: Record<string, unknown>) {
  return new axios.AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    statusText: "",
    headers: {},
    config: {} as never,
    data: body,
  });
}

describe("toApiError", () => {
  it("shows the backend's message for a user-facing code on a 403", () => {
    const error = toApiError(
      httpError(403, { success: false, message: "You do not have permission to modify this user", error_code: 1203, data: null }),
    );
    expect(error.message).toBe("You do not have permission to modify this user");
    expect(error.status).toBe(403);
    expect(error.errorCode).toBe(1203);
  });

  it("keeps the generic text for the guard's plain 403", () => {
    const error = toApiError(httpError(403, { success: false, message: "Forbidden resource", error_code: 1003, data: null }));
    expect(error.message).toBe("You do not have permission to perform this action.");
    expect(error.rawMessage).toBe("Forbidden resource");
  });
});
