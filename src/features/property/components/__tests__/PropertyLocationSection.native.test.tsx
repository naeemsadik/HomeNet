import React from "react";
import renderer, { act } from "react-test-renderer";
import { Image } from "react-native";
import { PropertyLocationSection } from "../PropertyLocationSection";

jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));

/**
 * In the app the location card showed a stock photo of a wooden world map with a pin drawn on
 * it, whatever the listing. It now shows the address and the Google Maps link, never a picture
 * of a map.
 */
describe("the listing's location in the app", () => {
  it("shows the address and the Google Maps link, and no picture of a map", () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <PropertyLocationSection
          title="Flat in Mohammadpur"
          address="26/1 Jafrabad, Rayerbazar"
          location="Mohammadpur"
          nearbyPlaces={[]}
          mapEmbedUrl="https://maps.google.com/maps?q=x&output=embed"
          mapExternalUrl="https://www.google.com/maps/search/?api=1&query=x"
        />,
      );
    });
    expect(tree.root.findAllByType(Image)).toHaveLength(0);
    expect(JSON.stringify(tree.toJSON())).toContain("26/1 Jafrabad");
    expect(tree.root.findAll((n) => n.props.accessibilityRole === "link" && typeof n.props.onPress === "function")).toHaveLength(1);
    act(() => tree.unmount());
  });
});
