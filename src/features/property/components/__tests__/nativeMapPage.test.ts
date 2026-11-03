import { LEAFLET_VERSION, MARKERCLUSTER_VERSION } from "@/features/property/components/leafletAssets.generated";
import { buildMapPage, parsePageMessage } from "@/features/property/components/nativeMapPage";

describe("the app map's copy of Leaflet", () => {
  it("is the installed version: after upgrading leaflet or the cluster plugin, run npm run map:native", () => {
    expect(LEAFLET_VERSION).toBe(require("leaflet/package.json").version);
    expect(MARKERCLUSTER_VERSION).toBe(require("leaflet.markercluster/package.json").version);
  });
});

describe("the app map's page", () => {
  const page = buildMapPage({ touchDrag: true, zoomControlPosition: "bottomright" });

  it("runs Leaflet, the cluster plugin and the map script, in that order", () => {
    const leaflet = page.indexOf("Leaflet 1.9.4");
    const cluster = page.indexOf("leaflet.markercluster 1.5.3");
    const script = page.indexOf('L.map("map"');
    expect(leaflet).toBeGreaterThan(-1);
    expect(cluster).toBeGreaterThan(leaflet);
    expect(script).toBeGreaterThan(cluster);
  });

  it("passes its options as data, with nothing that could close the script early", () => {
    const options = page.match(/window\.__HN_MAP_OPTIONS__ = (.*);<\/script>/)?.[1];
    expect(options).toBeDefined();
    expect(options).not.toContain("</");
    expect(JSON.parse(options!)).toEqual(
      expect.objectContaining({ touchDrag: true, zoomControlPosition: "bottomright", center: { lat: 23.8103, lng: 90.4125 } }),
    );
  });

  it("has one <script> per piece and no stray closing tag inside Leaflet's code", () => {
    expect(page.match(/<script>/g)).toHaveLength(4);
    expect(page.match(/<\/script>/g)).toHaveLength(4);
  });
});

describe("messages from the page", () => {
  it("accepts ready and a tapped pin", () => {
    expect(parsePageMessage('{"type":"ready"}')).toEqual({ type: "ready" });
    expect(parsePageMessage('{"type":"select","id":"p1"}')).toEqual({ type: "select", id: "p1" });
  });

  it("drops anything else", () => {
    for (const data of ["", "null", "[]", "42", "not json", '{"type":"select"}', '{"type":"select","id":""}', '{"type":"select","id":3}', '{"type":"open","url":"x"}']) {
      expect(parsePageMessage(data)).toBeNull();
    }
  });
});
