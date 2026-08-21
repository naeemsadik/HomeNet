import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR / Initial Hydration, return stable default values
  // so that server-rendered HTML matches the client's initial render.
  const width = mounted ? windowWidth : 1200;
  const height = mounted ? windowHeight : 800;
  //Osthir jinish!!

  const isPhone = mounted ? width <= 600 : false;
  const isTablet = mounted ? width <= 820 : false;
  const isCompact = mounted ? width <= 1100 : false;
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

