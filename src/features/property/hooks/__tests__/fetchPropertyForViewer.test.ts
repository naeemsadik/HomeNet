import { ApiError } from "@/services/apiClient";
import { getAdminPropertyById, getMyPropertyById, getPropertyById } from "@/services/propertyApi";
import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types/api";
import { fetchPropertyForViewer } from "../usePropertyDetail";

jest.mock("@/services/propertyApi", () => ({
  getProperties: jest.fn(),
  getPropertyById: jest.fn(),
  getMyPropertyById: jest.fn(),
  getAdminPropertyById: jest.fn(),
}));

const publicRead = getPropertyById as jest.Mock;
const myRead = getMyPropertyById as jest.Mock;
const adminRead = getAdminPropertyById as jest.Mock;

const notFound = () => new ApiError("Property not found", 404, 1500);
const listing = (source: string) => ({ success: true, message: "OK", data: { id: "p1", title: source } });
const staff = [{ role: { name: "admin", role_permissions: [{ permission: { name: "manage_properties" } }] } }] as unknown as UserRole[];

function signIn(userRoles: UserRole[] = []) {
  useAuthStore.setState({ hydrated: true, user: { id: "u1", email: "a@b.c" } as never, userRoles });
}

beforeEach(() => {
  jest.resetAllMocks();
  useAuthStore.setState({ hydrated: true, user: null, userRoles: [] });
});

describe("fetchPropertyForViewer", () => {
  it("returns the public listing without asking for anything else", async () => {
    signIn();
    publicRead.mockResolvedValue(listing("public"));

    await expect(fetchPropertyForViewer("p1")).resolves.toMatchObject({ title: "public" });
    expect(myRead).not.toHaveBeenCalled();
    expect(adminRead).not.toHaveBeenCalled();
  });

  it("gives the owner their pending listing, which the public route hides", async () => {
    signIn();
    publicRead.mockRejectedValue(notFound());
    myRead.mockResolvedValue(listing("mine"));

    await expect(fetchPropertyForViewer("p1")).resolves.toMatchObject({ title: "mine" });
    expect(adminRead).not.toHaveBeenCalled();
  });

  it("gives staff someone else's pending listing", async () => {
    signIn(staff);
    publicRead.mockRejectedValue(notFound());
    myRead.mockRejectedValue(notFound());
    adminRead.mockResolvedValue(listing("admin"));

    await expect(fetchPropertyForViewer("p1")).resolves.toMatchObject({ title: "admin" });
  });

  it("keeps the original not-found for a signed-in user who is neither owner nor staff, without asking the admin route", async () => {
    signIn();
    const original = notFound();
    publicRead.mockRejectedValue(original);
    myRead.mockRejectedValue(notFound());

    await expect(fetchPropertyForViewer("p1")).rejects.toBe(original);
    expect(adminRead).not.toHaveBeenCalled();
  });

  it("keeps the original not-found when staff are refused too", async () => {
    signIn(staff);
    const original = notFound();
    publicRead.mockRejectedValue(original);
    myRead.mockRejectedValue(notFound());
    adminRead.mockRejectedValue(new ApiError("Forbidden", 403));

    await expect(fetchPropertyForViewer("p1")).rejects.toBe(original);
  });

  it("does not ask a signed-out visitor for anything more", async () => {
    const original = notFound();
    publicRead.mockRejectedValue(original);

    await expect(fetchPropertyForViewer("p1")).rejects.toBe(original);
    expect(myRead).not.toHaveBeenCalled();
  });

  it("passes a server failure on instead of treating the listing as missing", async () => {
    signIn();
    const outage = new ApiError("Server error", 500);
    publicRead.mockRejectedValue(outage);

    await expect(fetchPropertyForViewer("p1")).rejects.toBe(outage);
    expect(myRead).not.toHaveBeenCalled();
  });

  it("surfaces a failure of the owner route that is not a refusal", async () => {
    signIn();
    const outage = new ApiError("Server error", 500);
    publicRead.mockRejectedValue(notFound());
    myRead.mockRejectedValue(outage);

    await expect(fetchPropertyForViewer("p1")).rejects.toBe(outage);
  });

  it("waits for the stored session before deciding nobody is signed in", async () => {
    useAuthStore.setState({ hydrated: false, user: null, userRoles: [] });
    publicRead.mockRejectedValue(notFound());
    myRead.mockResolvedValue(listing("mine"));

    const pending = fetchPropertyForViewer("p1");
    await Promise.resolve();
    signIn();

    await expect(pending).resolves.toMatchObject({ title: "mine" });
  });
});
