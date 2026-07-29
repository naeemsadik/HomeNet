import { useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isPhone = width <= 600;
  const isTablet = width <= 820;
  const isCompact = width <= 1100;
  const sidebarWidth = width <= 1100 ? 204 : 226;

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
