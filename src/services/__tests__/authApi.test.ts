import apiClient from "@/services/apiClient";
import { loginWithGoogle } from "@/services/authApi";

jest.mock("@/services/apiClient", () => ({ __esModule: true, default: { post: jest.fn() } }));

const post = apiClient.post as jest.Mock;
const TOKEN = "header.payload.signature";

beforeEach(() => post.mockReset());

describe("loginWithGoogle", () => {
  it("posts the credential to the Google sign-in route and returns the body", async () => {
    const body = { success: true, data: { access_token: "a", refresh_token: "r", user: { id: "u1" } } };
    post.mockResolvedValue({ data: body });

    await expect(loginWithGoogle(TOKEN)).resolves.toEqual(body);
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith("/v1/auth/google", { id_token: TOKEN });
  });

  it.each([
    ["empty", ""],
    ["not a JWT", "not-a-token"],
    ["two parts", "a.b"],
    ["spaces", "a.b.c d"],
    ["far too long", `${"a".repeat(4100)}.b.c`],
  ])("refuses a credential that is %s without calling the API", async (_label, value) => {
    await expect(loginWithGoogle(value)).rejects.toThrow();
    expect(post).not.toHaveBeenCalled();
  });
});
