import { useSavedStore } from "@/stores/savedStore";
import { saveProperty, unsaveProperty } from "@/services/propertyApi";

const mockUser: { current: { id: string } | null } = { current: null };

jest.mock("@/stores/authStore", () => ({
  useAuthStore: { getState: () => ({ user: mockUser.current }) },
}));

jest.mock("@/services/propertyApi", () => ({
  getSavedProperties: jest.fn(),
  saveProperty: jest.fn(),
  unsaveProperty: jest.fn(),
}));

const mockSave = saveProperty as jest.Mock;
const mockUnsave = unsaveProperty as jest.Mock;

beforeEach(() => {
  mockUser.current = null;
  jest.clearAllMocks();
  useSavedStore.setState({ savedIds: [] });
});

describe("savedStore.isSaved", () => {
  it("matches an id whether it is given as a string or a number", () => {
    useSavedStore.setState({ savedIds: ["42"] });
    const { isSaved } = useSavedStore.getState();
    expect(isSaved("42")).toBe(true);
    expect(isSaved(42)).toBe(true);
    expect(isSaved("43")).toBe(false);
  });

  it("matches numeric ids left in older persisted state", () => {
    // Earlier versions could persist numbers; the store is typed string[] now.
    useSavedStore.setState({ savedIds: [7 as unknown as string] });
    expect(useSavedStore.getState().isSaved("7")).toBe(true);
  });

  it("is false for null and undefined", () => {
    useSavedStore.setState({ savedIds: ["1"] });
    const { isSaved } = useSavedStore.getState();
    expect(isSaved(null)).toBe(false);
    expect(isSaved(undefined)).toBe(false);
  });
});

describe("savedStore.toggleSaved", () => {
  it("saves and unsaves locally for a guest, without calling the API", async () => {
    const { toggleSaved } = useSavedStore.getState();

    await expect(toggleSaved({ id: 5 })).resolves.toBe(true);
    expect(useSavedStore.getState().savedIds).toEqual(["5"]);

    await expect(toggleSaved("5")).resolves.toBe(false);
    expect(useSavedStore.getState().savedIds).toEqual([]);

    expect(mockSave).not.toHaveBeenCalled();
    expect(mockUnsave).not.toHaveBeenCalled();
  });

  it("saves through the API when signed in", async () => {
    mockUser.current = { id: "u1" };
    mockSave.mockResolvedValue(undefined);

    await expect(useSavedStore.getState().toggleSaved("9")).resolves.toBe(true);
    expect(mockSave).toHaveBeenCalledWith("9");
    expect(useSavedStore.getState().savedIds).toEqual(["9"]);
  });

  it("rolls back and reports the old state when the API save fails", async () => {
    mockUser.current = { id: "u1" };
    mockSave.mockRejectedValue(new Error("offline"));
    // The store logs the rollback in development; keep test output clean.
    const log = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(useSavedStore.getState().toggleSaved("9")).resolves.toBe(false);
    expect(useSavedStore.getState().savedIds).toEqual([]);
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
