import { useEffect, useState } from "react";
import { Platform, useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width: rnWidth, height: rnHeight } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  /**
   * `useWindowDimensions` does not reliably re-emit on browser resize under
   * react-native-web here, which froze every breakpoint at first-paint width.
   * On web we track the viewport directly; native keeps the RN hook.
   */
  const [webSize, setWebSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!isWeb || typeof window === "undefined") return;

    const sync = () => setWebSize({ w: window.innerWidth, h: window.innerHeight });
    sync();

    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, [isWeb]);

  // The static export renders with no window. 1200 keeps the first paint
  // desktop-shaped; the effect above corrects it on mount.
  const width = isWeb ? (webSize?.w ?? 1200) : rnWidth;
  const height = isWeb ? (webSize?.h ?? 800) : rnHeight;

  const isPhone = width <= 600;
  const isTablet = width <= 820;
  const isCompact = width <= 1100;
  const sidebarWidth = isCompact ? 204 : 226;

  return {
    width,
    height,
    isPhone,
    isTablet,
    isCompact,
    sidebarWidth,
    contentPadding: isPhone ? 14 : isTablet ? 18 : 36,
  };
}
