import { useState, useCallback } from "react";
import type { LayoutChangeEvent } from "react-native";

interface UseInViewOptions {
  threshold?: number;
  triggerOnce?: boolean;
}

export function useInView(options: UseInViewOptions = {}) {
  const { threshold = 50, triggerOnce = true } = options;
  const [inView, setInView] = useState(false);
  const [layoutY, setLayoutY] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setLayoutY(y);
    setLayoutHeight(height);
  }, []);

  const checkInView = useCallback(
    (scrollOffsetY: number, viewportHeight: number) => {
      if (inView && triggerOnce) return;

      const topVisible = scrollOffsetY + viewportHeight > layoutY + threshold;
      const bottomVisible = scrollOffsetY < layoutY + layoutHeight - threshold;

      if (topVisible && bottomVisible) {
        setInView(true);
      } else if (!triggerOnce) {
        setInView(false);
      }
    },
    [inView, layoutY, layoutHeight, threshold, triggerOnce]
  );

  return { inView, onLayout, checkInView };
}
