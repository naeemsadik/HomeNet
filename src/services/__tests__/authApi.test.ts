import apiClient from "@/services/apiClient";
import { loginWithGoogle, registerUser } from "@/services/authApi";

jest.mock("@/services/apiClient", () => ({ __esModule: true, default: { post: jest.fn() } }));

const post = apiClient.post as jest.Mock;
const TOKEN = "header.payload.signature";

beforeEach(() => post.mockReset());

describe("registerUser", () => {
  it("posts API-compliant fields to /v1/auth/register", async () => {
    const body = {
      success: true,
      data: {
        access_token: "mock-access",
        refresh_token: "mock-refresh",
        user: { id: "u-123", full_name: "Jane Doe", email: "jane@example.com", avatar_url: null },
      },
    };
    post.mockResolvedValue({ data: body });

    const result = await registerUser({
      full_name: "Jane Doe",
      email: "jane@example.com",
      password: "ValidPass123",
    });

    expect(result).toEqual(body);
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith("/v1/auth/register", {
      full_name: "Jane Doe",
      email: "jane@example.com",
      password: "ValidPass123",
    });
  });

  it("strips confirmPassword and extraneous fields prior to validation and API dispatch", async () => {
    const body = { success: true, data: { access_token: "a", refresh_token: "r", user: { id: "u1" } } };
    post.mockResolvedValue({ data: body });

    const payloadWithConfirm = {
      full_name: "John Doe",
      email: "john@example.com",
      password: "ValidPass123",
      confirmPassword: "ValidPass123",
      extraField: "ignored",
    } as any;

    await registerUser(payloadWithConfirm);

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith("/v1/auth/register", {
      full_name: "John Doe",
      email: "john@example.com",
      password: "ValidPass123",
    });
    // Ensure confirmPassword was not passed to the backend
    expect(post.mock.calls[0][1]).not.toHaveProperty("confirmPassword");
    expect(post.mock.calls[0][1]).not.toHaveProperty("extraField");
  });

  it("rejects invalid inputs without calling API", async () => {
    await expect(
      registerUser({
        full_name: "J",
        email: "not-an-email",
        password: "short",
      }),
    ).rejects.toThrow();

    expect(post).not.toHaveBeenCalled();
  });
});

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
