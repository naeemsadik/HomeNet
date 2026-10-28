import { loadGoogleMaps, onGoogleMapsKeyRefused, resetGoogleMapsLoader } from "@/lib/googleMapsLoader";

jest.mock("@/lib/features", () => ({ GOOGLE_MAPS_API_KEY: "test-key" }));

type GoogleCallbacks = { __homenetMapsReady?: () => void; gm_authFailure?: () => void };
const callbacks = window as unknown as GoogleCallbacks;

describe("googleMapsLoader", () => {
  beforeEach(() => {
    resetGoogleMapsLoader();
    document.getElementById("google-maps-js")?.remove();
  });

  it("tells listeners when Google refuses the key after the map has loaded", async () => {
    const refused = jest.fn();
    const stop = onGoogleMapsKeyRefused(refused);

    // What Google does with a referrer the key does not allow: ready first, refusal after.
    const load = loadGoogleMaps();
    callbacks.__homenetMapsReady?.();
    await expect(load).resolves.toBeUndefined();
    expect(refused).not.toHaveBeenCalled();

    callbacks.gm_authFailure?.();
    expect(refused).toHaveBeenCalledTimes(1);
    stop();
  });

  it("refuses every later load, and tells a late listener at once", async () => {
    const load = loadGoogleMaps();
    callbacks.__homenetMapsReady?.();
    await load;
    callbacks.gm_authFailure?.();

    await expect(loadGoogleMaps()).rejects.toThrow("rejected the API key");
    const late = jest.fn();
    onGoogleMapsKeyRefused(late);
    expect(late).toHaveBeenCalledTimes(1);
  });

  it("does not call a listener that has stopped listening", async () => {
    const refused = jest.fn();
    const stop = onGoogleMapsKeyRefused(refused);
    const load = loadGoogleMaps();
    callbacks.__homenetMapsReady?.();
    await load;

    stop();
    callbacks.gm_authFailure?.();
    expect(refused).not.toHaveBeenCalled();
  });
});
