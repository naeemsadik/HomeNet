import React from "react";
import renderer, { act } from "react-test-renderer";
import { Image } from "react-native";
import { WebView } from "react-native-webview";
import { PropertyLocationSection } from "../PropertyLocationSection";
import { allowEmbedNavigation, mapPage } from "../GoogleMapEmbed.native";
import { SITE_URL } from "@/lib/seo";

jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));
const mockOpen = jest.fn();
jest.mock("@/lib/safeUrl", () => ({ openExternalUrl: (...args: unknown[]) => mockOpen(...args) }));

const EMBED = "https://maps.google.com/maps?q=26%2F1%20Jafrabad&output=embed";

/**
 * In the app the location card showed a stock photo of a wooden world map with a pin drawn on
 * it, whatever the listing. It now shows Google's map, the same one the website shows.
 */
describe("the listing's location in the app", () => {
  beforeEach(() => mockOpen.mockClear());

  it("shows Google's embedded map from the listing's embed address, and no stock picture", () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <PropertyLocationSection
          title="Flat in Mohammadpur"
          address="26/1 Jafrabad, Rayerbazar"
          location="Mohammadpur"
          nearbyPlaces={[]}
          mapEmbedUrl={EMBED}
          mapExternalUrl="https://www.google.com/maps/search/?api=1&query=x"
        />,
      );
    });
    const source = tree.root.findByType(WebView).props.source;
    expect(source.baseUrl).toBe(`${SITE_URL}/`);
    expect(source.html).toContain("<iframe");
    expect(source.html).toContain("maps?q=26%2F1%20Jafrabad&amp;output=embed");
    expect(tree.root.findAllByType(Image)).toHaveLength(0);
    expect(JSON.stringify(tree.toJSON())).toContain("26/1 Jafrabad");
    act(() => tree.unmount());
  });

  it("escapes the address and title so a listing cannot break out of the page", () => {
    const html = mapPage('https://maps.google.com/maps?q="><script>x</script>&output=embed', 'a"b<c');
    expect(html).not.toContain("<script>");
    expect(html).toContain("a&quot;b&lt;c");
  });

  it("keeps the map on the card and sends any other link to the phone's browser", () => {
    expect(allowEmbedNavigation(EMBED, { url: EMBED })).toBe(true);
    expect(mockOpen).not.toHaveBeenCalled();
    expect(allowEmbedNavigation(EMBED, { url: "https://www.google.com/maps/place/x" })).toBe(false);
    expect(mockOpen).toHaveBeenCalledWith("https://www.google.com/maps/place/x");
    expect(allowEmbedNavigation(EMBED, { url: "intent://maps#Intent;scheme=geo;end" })).toBe(false);
    expect(mockOpen).toHaveBeenCalledTimes(1);
    // A load inside the map's own frame is Google's redirect, not a tapped link.
    expect(allowEmbedNavigation(EMBED, { url: "https://www.google.com/maps/embed?x", isTopFrame: false })).toBe(true);
    expect(mockOpen).toHaveBeenCalledTimes(1);
  });
});
