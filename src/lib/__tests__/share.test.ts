import { Platform, Share } from "react-native";
import { appShareUrl, shareLink } from "@/lib/share";

describe("appShareUrl", () => {
  it("points at the public page and tags the visit as coming from an app share", () => {
    expect(appShareUrl("/property/12")).toBe(
      "https://www.homenetbd.com/property/12?utm_source=homenet_app&utm_medium=share",
    );
  });
});

describe("shareLink on the phone app", () => {
  const originalOS = Platform.OS;
  beforeEach(() => {
    Platform.OS = "android";
    jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" } as never);
  });
  afterEach(() => {
    Platform.OS = originalOS;
    jest.restoreAllMocks();
  });

  it("sends the title and a link back to the page", async () => {
    await shareLink({ title: "2 bed flat in Dhanmondi", path: "/property/12" });
    expect(Share.share).toHaveBeenCalledWith({
      message: "2 bed flat in Dhanmondi\nhttps://www.homenetbd.com/property/12?utm_source=homenet_app&utm_medium=share",
    });
  });

  it("sends just the title when it has no page to point at", async () => {
    await shareLink({ title: "A title" });
    expect(Share.share).toHaveBeenCalledWith({ message: "A title" });
  });
});
