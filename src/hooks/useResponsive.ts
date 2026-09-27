import { useSyncExternalStore } from "react";
import { Dimensions } from "react-native";

/**
 * The size every page is pre-rendered at (expo export has no window). While
 * React hydrates that HTML, the first render must use the same size, or phones
 * produce different markup and React throws "Minified React error #418" and
 * discards the whole pre-rendered page.
 *
 * useSyncExternalStore does this by design: it renders with the server
 * snapshot while hydrating, then re-renders with the real window size.
 * Components that mount later, and native apps, get the real size at once.
 */
const STATIC_RENDER_WIDTH = 1200;
const STATIC_RENDER_HEIGHT = 800;

function subscribe(onChange: () => void) {
  const subscription = Dimensions.addEventListener("change", onChange);
  return () => subscription.remove();
}

const getWidth = () => Dimensions.get("window").width;
const getHeight = () => Dimensions.get("window").height;
const getStaticWidth = () => STATIC_RENDER_WIDTH;
const getStaticHeight = () => STATIC_RENDER_HEIGHT;

/** Window size, hydration-safe. Prefer this to useWindowDimensions in anything that renders on web. */
export function useWindowSize() {
  const width = useSyncExternalStore(subscribe, getWidth, getStaticWidth);
  const height = useSyncExternalStore(subscribe, getHeight, getStaticHeight);
  return { width, height };
}

export function useResponsive() {
  const { width, height } = useWindowSize();

  const isPhone = width <= 600;
  const isTablet = width <= 820;
  const isCompact = width <= 1100;
  const isDesktop = width > 1100 && width <= 1500;
  const isWide = width > 1500 && width <= 1920;
  const isUltrawide = width > 1920;
  const isLargeScreen = width > 1500;
  const isTall = height >= 900;

  const sidebarWidth = isCompact ? 204 : 226;
  const containerMaxWidth = isUltrawide ? 1600 : isWide ? 1440 : isDesktop ? 1280 : 1200;

  return {
    width,
    height,
    isPhone,
    isTablet,
    isCompact,
    isDesktop,
    isWide,
    isUltrawide,
    isLargeScreen,
    isTall,
    containerMaxWidth,
    sidebarWidth,
    contentPadding: isPhone ? 14 : isTablet ? 18 : isWide ? 44 : 36,
  };
}
