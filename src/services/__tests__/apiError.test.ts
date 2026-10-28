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
  it("shows a plain sentence for a known code on a 403", () => {
    const error = toApiError(
      httpError(403, { success: false, message: "You do not have permission to modify this user", error_code: 1203, data: null }),
    );
    expect(error.message).toBe("You can't make changes to this account.");
    expect(error.status).toBe(403);
    expect(error.errorCode).toBe(1203);
  });

  it("keeps the generic text for the guard's plain 403", () => {
    const error = toApiError(httpError(403, { success: false, message: "Forbidden resource", error_code: 1003, data: null }));
    expect(error.message).toBe("You don't have access to this.");
    expect(error.rawMessage).toBe("Forbidden resource");
  });

  it("shows each validator problem once, in plain words", () => {
    const error = toApiError(
      httpError(400, {
        success: false,
        message: "area_id must be a UUID; price must be a number",
        error_code: 1001,
        data: { errors: ["area_id must be a UUID", "price must be a number"] },
      }),
    );
    expect(error.message).toBe("Some details aren't quite right. Please check them and try again.");
    expect(error.validationErrors).toEqual(["Some details aren't quite right. Please check them and try again."]);
  });
});
