import React, { act } from "react";
// @ts-expect-error -- @types/react-dom is not in dependencies, Jest loads react-dom
import { createRoot } from "react-dom/client";
import { AiFlagshipSection } from "@/components/landing/AiFlagshipSection";
import { useLanguageStore } from "@/i18n";
import { useResponsive } from "@/hooks/useResponsive";
import { radius } from "@/theme";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: jest.fn(),
}));

jest.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({ user: null }),
}));

jest.mock("@/stores/useAuthModalStore", () => ({
  useAuthModalStore: { getState: () => ({ open: jest.fn() }) },
}));

jest.mock("@/components/icons", () => {
  const mockReact = require("react");
  const icon = (name: string) => (props: { color?: string }) =>
    mockReact.createElement("span", { "data-icon": name, "data-color": props.color });
  return {
    Search: icon("Search"),
    FileText: icon("FileText"),
    ArrowRight: icon("ArrowRight"),
    Check: icon("Check"),
    AlertTriangle: icon("AlertTriangle"),
    RotateCcw: icon("RotateCcw"),
    Edit3: icon("Edit3"),
    Languages: icon("Languages"),
    CheckCircle2: icon("CheckCircle2"),
    ShieldAlert: icon("ShieldAlert"),
    Sliders: icon("Sliders"),
    Play: icon("Play"),
  };
});

describe("AiFlagshipSection", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    useLanguageStore.getState().setLanguage("en");
    (useResponsive as jest.MockedFunction<typeof useResponsive>).mockReturnValue({
      width: 1440,
      height: 900,
      isPhone: false,
      isTablet: false,
      isCompact: false,
      isDesktop: true,
      isWide: true,
      isUltrawide: false,
      isLargeScreen: true,
      isTall: false,
      containerMaxWidth: 1280,
      sidebarWidth: 260,
      contentPadding: 24,
    });
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    jest.useRealTimers();
    container.remove();
  });

  it("uses exact #04cf92 brand green and dark text on the analyze and apply CTA buttons", () => {
    const root = createRoot(container);
    act(() => {
      root.render(<AiFlagshipSection />);
    });

    const analyzeBtn = container.querySelector('[role="button"]') as HTMLElement | null;
    expect(analyzeBtn).toBeTruthy();
    expect(getComputedStyle(analyzeBtn as HTMLElement).backgroundColor).toBe("rgb(4, 207, 146)");
    expect(getComputedStyle(analyzeBtn as HTMLElement).borderTopLeftRadius).toBe(`${radius.lg}px`);

    const analyzeLabel = Array.from((analyzeBtn as HTMLElement).querySelectorAll("*")).find(
      (el) => el.textContent === "Analyze with AI",
    ) as HTMLElement | undefined;
    expect(analyzeLabel).toBeTruthy();
    expect(getComputedStyle(analyzeLabel as HTMLElement).color).toBe("rgb(11, 26, 23)");

    // Advance past the initial typing/analyzing demo sequence into the preview stage
    act(() => {
      jest.runOnlyPendingTimers();
      analyzeBtn?.click();
      jest.advanceTimersByTime(15000);
    });

    const buttons = Array.from(container.querySelectorAll('[role="button"]')) as HTMLElement[];
    const applyBtn = buttons.find((el) => el.textContent?.includes("Apply & Continue"));
    expect(applyBtn).toBeTruthy();
    expect(getComputedStyle(applyBtn as HTMLElement).backgroundColor).toBe("rgb(4, 207, 146)");
    expect(getComputedStyle(applyBtn as HTMLElement).borderTopLeftRadius).toBe(`${radius.lg}px`);

    const applyLabel = Array.from((applyBtn as HTMLElement).querySelectorAll("*")).find(
      (el) => el.textContent === "Apply & Continue",
    ) as HTMLElement | undefined;
    expect(applyLabel).toBeTruthy();
    expect(getComputedStyle(applyLabel as HTMLElement).color).toBe("rgb(11, 26, 23)");

    act(() => {
      root.unmount();
    });
  });
});
