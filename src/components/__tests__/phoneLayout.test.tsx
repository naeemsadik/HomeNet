import fs from "node:fs";
import path from "node:path";
import React from "react";
import renderer, { act } from "react-test-renderer";
import { StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { ModalSafeView } from "@/components/ModalSafeView";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Layout faults seen on real phones (Android, edge to edge, large system font)
 * that a check at one width with normal text did not show.
 */
const SRC = path.join(process.cwd(), "src");
const sources = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "__tests__") return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sources(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
const read = (file: string) => fs.readFileSync(path.join(SRC, file), "utf8");
const relative = (file: string) => path.relative(SRC, file).split(path.sep).join("/");

describe("pop-up windows stay clear of the status bar and navigation buttons", () => {
  // OverlayModal is the wrapper itself; the actions menu is a small popover placed beside its button.
  const exempt = ["components/OverlayModal.tsx", "features/property/components/myListings/ListingActionsMenu.tsx"];

  // The header's drawer places itself between the insets, with its own strips behind the system bars.
  exempt.push("components/AppChrome.tsx");

  it("each one has a ModalSafeView as its outer layer", () => {
    const count = (text: string, tag: RegExp) => text.match(tag)?.length ?? 0;
    const missing = sources(SRC)
      .filter((file) => !exempt.includes(relative(file)))
      .filter((file) => {
        const text = fs.readFileSync(file, "utf8");
        return count(text, /<(Overlay)?Modal[\s>]/g) > count(text, /<ModalSafeView[\s>]/g);
      })
      .map(relative);
    expect(missing).toEqual([]);
  });

  // It writes its own paddingBottom over the style's, which would drop the bottom inset.
  it("never makes a KeyboardAvoidingView the safe-area layer itself", () => {
    const wrong = sources(SRC).filter((file) => fs.readFileSync(file, "utf8").includes("as={KeyboardAvoidingView}"));
    expect(wrong.map(relative)).toEqual([]);
  });

  const render = (insets: { top: number; bottom: number } | null) => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <SafeAreaInsetsContext.Provider value={insets ? { ...insets, left: 0, right: 0 } : null}>
          <ModalSafeView style={{ padding: 16, paddingBottom: 24 }} />
        </SafeAreaInsetsContext.Provider>,
      );
    });
    return StyleSheet.flatten(tree.root.findByType(View).props.style);
  };

  it("adds the insets on top of the style's own padding", () => {
    expect(render({ top: 32, bottom: 48 })).toMatchObject({ padding: 16, paddingTop: 48, paddingBottom: 72 });
  });

  it("leaves the style alone where there are no insets", () => {
    expect(render({ top: 0, bottom: 0 })).toEqual({ padding: 16, paddingBottom: 24 });
    expect(render(null)).toEqual({ padding: 16, paddingBottom: 24 });
  });
});

describe("narrow screens and large text", () => {
  it("lets the footer's policy rows wrap instead of breaking a word", () => {
    expect(read("components/MobileFooter.tsx")).toMatch(/legalRow: \{[^}]*flexWrap: "wrap"/);
  });

  it("reads the window size through the hook that is safe for the pre-rendered website", () => {
    // OptionPicker only reads the height, for a list that opens on a tap, long after hydration.
    const unsafe = sources(SRC)
      .filter((file) => /useWindowDimensions\(\)/.test(fs.readFileSync(file, "utf8")))
      .map(relative)
      .filter((file) => file !== "components/OptionPicker.tsx" && file !== "hooks/useResponsive.ts");
    expect(unsafe).toEqual([]);
  });

  it("scales the wordmark down rather than cutting off the BD", () => {
    expect(read("components/BrandArt.tsx")).toContain('maxWidth: "100%"');
  });

  it("lets the listing purpose labels take two lines", () => {
    const step = read("features/property/components/wizard/WizardBasicsStep.tsx");
    const control = step.slice(step.indexOf("Listing Purpose */}"), step.indexOf("Description */}"));
    expect(control).not.toContain("numberOfLines");
    expect(read("features/property/screens/PropertyCreateWizard.styles.ts")).toMatch(/toggleRow: \{[^}]*minHeight: 48/);
  });
});
