import { avatarVersion, bumpAvatarVersion, withAvatarVersion } from "../avatarCache";

describe("withAvatarVersion", () => {
  it("leaves missing photos alone", () => {
    expect(withAvatarVersion(null)).toBeNull();
    expect(withAvatarVersion(undefined)).toBeNull();
    expect(withAvatarVersion("")).toBe("");
  });

  it("adds the version to a plain URL", () => {
    expect(withAvatarVersion("https://cdn.example.com/a.jpg")).toBe(
      `https://cdn.example.com/a.jpg?v=${avatarVersion()}`,
    );
  });

  it("keeps existing query parameters and a hash, and replaces an older version", () => {
    const url = withAvatarVersion("https://cdn.example.com/a.jpg?w=200&v=1#top");
    expect(url).toBe(`https://cdn.example.com/a.jpg?w=200&v=${avatarVersion()}#top`);
  });

  it("does not touch a photo picked from the phone", () => {
    expect(withAvatarVersion("file:///data/user/0/cache/pick.jpg")).toBe("file:///data/user/0/cache/pick.jpg");
  });

  it("gives a new URL after a photo is uploaded or removed", () => {
    const before = withAvatarVersion("https://cdn.example.com/a.jpg");
    bumpAvatarVersion();
    const after = withAvatarVersion("https://cdn.example.com/a.jpg");
    expect(after).not.toBe(before);
  });
});
