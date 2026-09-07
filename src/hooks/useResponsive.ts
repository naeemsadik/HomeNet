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

