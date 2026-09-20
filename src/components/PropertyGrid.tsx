import type { ReactNode } from "react";
import { Children, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import type { DimensionValue } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";

export function PropertyGrid({
  children,
  desktopColumns = 3,
  tabletColumns = 2,
  horizontalOnPhone = true,
  gap = 15,
}: {
  children: ReactNode;
  desktopColumns?: number;
  tabletColumns?: number;
  horizontalOnPhone?: boolean;
  gap?: number;
}) {
  const { isPhone, isCompact, width } = useResponsive();
  const [containerWidth, setContainerWidth] = useState(0);
  const items = Children.toArray(children);

  if (isPhone && horizontalOnPhone) {
    return (
      <ScrollView
        contentContainerStyle={[styles.horizontalContent, { gap }]}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {items.map((child, index) => (
          <View key={index} style={{ width: Math.min(width * 0.78, 302) }}>{child}</View>
        ))}
      </ScrollView>
    );
  }

  const columns = isPhone ? 1 : isCompact ? tabletColumns : desktopColumns;
  // The row gap eats into the available width, so a plain 100/columns% makes
  // every row overflow by gap*(columns-1) and wrap to one item per line. Web
  // can express the correction directly; native falls back to the measured
  // width from onLayout.
  const itemWidth: DimensionValue = containerWidth
    ? (containerWidth - gap * (columns - 1)) / columns
    : (Platform.select({
        web: `calc((100% - ${gap * (columns - 1)}px) / ${columns})`,
        default: `${100 / columns}%`,
      }) as DimensionValue);

  return (
    <View onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)} style={[styles.grid, { gap }]}>
      {items.map((child, index) => (
        <View key={index} style={{ width: itemWidth }}>{child}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  horizontalContent: { paddingRight: 14, paddingBottom: 20 },
});
