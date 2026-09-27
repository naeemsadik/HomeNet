import { confirmAction, notify } from "@/lib/alert";

// The jest-expo web preset runs with Platform.OS === "web", which is exactly
// the platform where Alert.alert does nothing.
describe("alert helpers on web", () => {
  afterEach(() => jest.restoreAllMocks());

  it("confirmAction resolves true when the user confirms", async () => {
    const confirm = jest.spyOn(window, "confirm").mockReturnValue(true);
    await expect(confirmAction("Log Out", "Are you sure?")).resolves.toBe(true);
    expect(confirm).toHaveBeenCalledWith("Log Out\n\nAre you sure?");
  });

  it("confirmAction resolves false when the user cancels", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);
    await expect(confirmAction("Delete Property", "Delete it?", { destructive: true })).resolves.toBe(false);
  });

  it("notify shows the message and then runs onConfirm", () => {
    const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
    const onConfirm = jest.fn();
    notify("Success", "Profile updated.", { onConfirm });
    expect(alert).toHaveBeenCalledWith("Success\n\nProfile updated.");
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("notify with only a title shows just the title", () => {
    const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
    notify("Link copied");
    expect(alert).toHaveBeenCalledWith("Link copied");
  });
});
