import { router } from "expo-router";
import { LIST_PROPERTY_PATH, startListing } from "@/lib/startListing";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));

describe("startListing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null });
    useAuthModalStore.getState().close?.();
  });

  it("opens the listing form, not the /sell marketing page, for a signed-in person", () => {
    useAuthStore.setState({ user: { id: "u1", full_name: "A", email: "a@b.c", avatar_url: null } });
    startListing();
    expect(router.push).toHaveBeenCalledWith("/property/create");
    expect(LIST_PROPERTY_PATH).toBe("/property/create");
  });

  it("asks a signed-out person to sign in first, then opens the form", () => {
    const open = jest.spyOn(useAuthModalStore.getState(), "open");
    startListing();
    expect(router.push).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledTimes(1);

    const afterSignIn = open.mock.calls[0][0] as () => void;
    afterSignIn();
    expect(router.push).toHaveBeenCalledWith("/property/create");
  });
});
