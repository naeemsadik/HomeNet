import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // On client web, window dimensions are available immediately so responsive states are accurate on initial render
  const isClientWeb = typeof window !== "undefined";
  const width = isClientWeb ? windowWidth : (mounted ? windowWidth : 1200);
  const height = isClientWeb ? windowHeight : (mounted ? windowHeight : 800);

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
