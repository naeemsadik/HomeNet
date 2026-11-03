import React from "react";
import { Linking } from "react-native";
import renderer, { act, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { HomeMapCanvas, allowMapNavigation } from "@/features/property/components/HomeMapCanvas";
import type { HomeMapMarker } from "@/features/property/components/HomeMapCanvas.types";
import { MAP_TILE_URL } from "@/features/property/constants/map";
import { SITE_URL } from "@/lib/seo";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const { postMessage, reload } = (
  jest.requireMock("react-native-webview") as { __mock: { postMessage: jest.Mock; reload: jest.Mock } }
).__mock;

const flat: HomeMapMarker = { id: "p1", lat: 23.79, lng: 90.41, label: "৳1.2 Cr", variant: "sale" };
const room: HomeMapMarker = { id: "p2", lat: 23.75, lng: 90.39, label: "<b>৳20k</b>", variant: "rent" };

let tree: ReactTestRenderer;
const onSelect = jest.fn();

function mount(markers: HomeMapMarker[], selectedId: string | null = null) {
  act(() => {
    tree = renderer.create(
      <HomeMapCanvas accessibilityLabel="Dhaka properties map" markers={markers} onSelect={onSelect} selectedId={selectedId} touchDrag />,
    );
  });
}

const webView = (): ReactTestInstance => tree.root.find((n) => (n.type as unknown) === "RNCWebView");
/** What the page would send. */
const fromPage = (message: unknown) =>
  act(() => webView().props.onMessage({ nativeEvent: { data: typeof message === "string" ? message : JSON.stringify(message) } }));
const posted = () => postMessage.mock.calls.map(([data]) => JSON.parse(data as string));

beforeEach(() => jest.clearAllMocks());
afterEach(() => act(() => tree.unmount()));

describe("the listings map in the app", () => {
  it("is the website's Leaflet map with its tiles, served as the site's page and named in the User-Agent", () => {
    mount([flat]);
    const props = webView().props;
    expect(props.source.baseUrl).toBe(`${SITE_URL}/`);
    expect(props.source.html).toContain("Leaflet 1.9.4");
    expect(props.source.html).toContain("leaflet.markercluster 1.5.3");
    expect(props.source.html).toContain(JSON.stringify(MAP_TILE_URL).slice(1, -1));
    expect(props.applicationNameForUserAgent).toMatch(/Homenet/);
    expect(props.accessibilityLabel).toBe("Dhaka properties map");
    // A map that pans with one finger keeps the drag from the page's scroll view.
    expect(props.nestedScrollEnabled).toBe(true);
    expect(props.allowFileAccess).toBe(false);
  });

  it("sends nothing until the page is ready, then the pins and the selected one", () => {
    mount([flat, room], "p2");
    expect(postMessage).not.toHaveBeenCalled();

    fromPage({ type: "ready" });
    const [markers, select] = posted();
    expect(markers.type).toBe("markers");
    expect(markers.selectedId).toBe("p2");
    expect(markers.markers.map((m: { id: string }) => m.id)).toEqual(["p1", "p2"]);
    // The pin's HTML is built and escaped by the app, the same as on the website.
    expect(markers.markers[1].html).toContain("&lt;b&gt;৳20k&lt;/b&gt;");
    expect(markers.markers[1].htmlActive).toContain("hn-price rent active");
    expect(select).toEqual({ type: "select", id: "p2" });
  });

  it("sends a new list and a new selection to a page that is ready", () => {
    mount([flat]);
    fromPage({ type: "ready" });
    postMessage.mockClear();

    act(() =>
      tree.update(
        <HomeMapCanvas accessibilityLabel="Dhaka properties map" markers={[flat, room]} onSelect={onSelect} selectedId="p1" touchDrag />,
      ),
    );
    expect(posted()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "markers", markers: expect.arrayContaining([expect.objectContaining({ id: "p2" })]) }),
        { type: "select", id: "p1" },
      ]),
    );
  });

  it("selects a pin tapped on the map, and ignores anything else the page sends", () => {
    mount([flat, room]);
    fromPage({ type: "ready" });

    fromPage({ type: "select", id: "p2" });
    expect(onSelect).toHaveBeenCalledWith("p2");

    fromPage({ type: "select", id: "not-on-the-map" });
    fromPage({ type: "select", id: 7 });
    fromPage("not json");
    fromPage({ type: "navigate", url: "https://example.com" });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("loads the page again if Android stops its renderer, and waits for it to be ready", () => {
    mount([flat]);
    fromPage({ type: "ready" });
    act(() => webView().props.onRenderProcessGone({ nativeEvent: { didCrash: false } }));
    expect(reload).toHaveBeenCalledTimes(1);

    postMessage.mockClear();
    act(() =>
      tree.update(<HomeMapCanvas accessibilityLabel="Dhaka properties map" markers={[flat]} onSelect={onSelect} selectedId="p1" touchDrag />),
    );
    expect(postMessage).not.toHaveBeenCalled();
  });
});

describe("links inside the map", () => {
  beforeEach(() => jest.spyOn(Linking, "openURL").mockResolvedValue(true));
  afterEach(() => jest.restoreAllMocks());

  it("stays on the map page, and opens the attribution links in the browser", () => {
    expect(allowMapNavigation({ url: `${SITE_URL}/` })).toBe(true);
    expect(allowMapNavigation({ url: "about:blank" })).toBe(true);

    expect(allowMapNavigation({ url: "https://www.openstreetmap.org/copyright" })).toBe(false);
    expect(Linking.openURL).toHaveBeenCalledWith("https://www.openstreetmap.org/copyright");
  });

  it("opens nothing that is not a web link", () => {
    for (const url of ["javascript:alert(1)", "intent://scan/#Intent;end", "file:///data/local/tmp/x.html"]) {
      expect(allowMapNavigation({ url })).toBe(false);
    }
    expect(Linking.openURL).not.toHaveBeenCalled();
  });
});
