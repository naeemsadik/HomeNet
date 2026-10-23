import { loginWithGoogle } from "@/services/authApi";
import { getUserRoles } from "@/services/roleApi";
import { saveTokens } from "@/services/tokenStorage";
import { useAuthStore } from "@/stores/authStore";

jest.mock("@/services/authApi", () => ({
  changePassword: jest.fn(),
  getCurrentUser: jest.fn(),
  loginUser: jest.fn(),
  loginWithGoogle: jest.fn(),
  logoutUser: jest.fn(),
  registerUser: jest.fn(),
}));
jest.mock("@/services/roleApi", () => ({ getUserRoles: jest.fn() }));
jest.mock("@/services/tokenStorage", () => ({
  clearTokens: jest.fn(),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  saveTokens: jest.fn(),
}));
jest.mock("@/stores/savedStore", () => ({
  useSavedStore: { getState: () => ({ syncGuestSaves: jest.fn(), clearSaved: jest.fn() }) },
}));

const google = loginWithGoogle as jest.Mock;
const roles = getUserRoles as jest.Mock;
const save = saveTokens as jest.Mock;

const USER = { id: "u1", full_name: "Gina", email: "gina@gmail.com", avatar_url: null };

beforeEach(() => {
  jest.clearAllMocks();
  // The error logger prints every failure; these tests cause failures on purpose.
  jest.spyOn(console, "error").mockImplementation(() => undefined);
  roles.mockResolvedValue({ data: [] });
  useAuthStore.setState({ user: null, loading: false, error: null, errorCode: null, userRoles: [] });
});

describe("authStore.googleLogin", () => {
  it("stores the session and the user, and reports success", async () => {
    google.mockResolvedValue({ data: { access_token: "acc", refresh_token: "ref", user: USER } });

    await expect(useAuthStore.getState().googleLogin("a.b.c")).resolves.toBe(true);

    expect(google).toHaveBeenCalledWith("a.b.c");
    expect(save).toHaveBeenCalledWith("acc", "ref");
    expect(useAuthStore.getState().user).toEqual(USER);
    expect(useAuthStore.getState().loading).toBe(false);
    expect(useAuthStore.getState().error).toBeNull();
  });

  it("keeps the person signed out and shows the API's message when the email is taken", async () => {
    google.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: { error_code: 1112, message: "An account with this email already exists. Sign in with your email and password instead" },
      },
    });

    await expect(useAuthStore.getState().googleLogin("a.b.c")).resolves.toBe(false);

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.errorCode).toBe(1112);
    expect(state.error).toContain("already exists");
    expect(save).not.toHaveBeenCalled();
  });

  it("treats an empty success body as a failure", async () => {
    google.mockResolvedValue({ message: "nothing" });

    await expect(useAuthStore.getState().googleLogin("a.b.c")).resolves.toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(save).not.toHaveBeenCalled();
  });

  it("clears an earlier error when a new attempt starts", async () => {
    useAuthStore.setState({ error: "old", errorCode: 1100 });
    google.mockResolvedValue({ data: { access_token: "acc", refresh_token: "ref", user: USER } });

    await useAuthStore.getState().googleLogin("a.b.c");

    expect(useAuthStore.getState().error).toBeNull();
    expect(useAuthStore.getState().errorCode).toBeNull();
  });
});
