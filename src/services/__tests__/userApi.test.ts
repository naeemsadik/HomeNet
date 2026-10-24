import apiClient, { ApiError } from "@/services/apiClient";
import { DELETE_ACCOUNT_CONFIRMATION, deleteMyAccount } from "@/services/userApi";

jest.mock("@/services/apiClient", () => {
  const actual = jest.requireActual("@/services/apiClient");
  return { __esModule: true, ApiError: actual.ApiError, default: { delete: jest.fn() } };
});

const del = apiClient.delete as jest.Mock;

beforeEach(() => del.mockReset());

describe("deleteMyAccount", () => {
  it("sends only the confirmation phrase in the body of DELETE /v1/users/me", async () => {
    del.mockResolvedValue({ data: { success: true, message: "deleted", data: null } });

    await expect(deleteMyAccount()).resolves.toBeUndefined();
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith("/v1/users/me", { data: { confirmation: "delete-my-account" } });
    expect(DELETE_ACCOUNT_CONFIRMATION).toBe("delete-my-account");
  });

  it("treats 404 (account already gone) as success", async () => {
    del.mockRejectedValue(new ApiError("User not found", 404, 1200));

    await expect(deleteMyAccount()).resolves.toBeUndefined();
  });

  it.each([400, 401, 403, 429, 500])("rethrows a %i", async (status) => {
    const error = new ApiError("nope", status);
    del.mockRejectedValue(error);

    await expect(deleteMyAccount()).rejects.toBe(error);
  });
});
