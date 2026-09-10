import { Bell, Globe, Menu, Search } from "lucide-react-native";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppLink } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { fonts, webPointer } from "@/theme";

export interface SellerTopHeaderProps {
  title?: string;
  onPressMenu?: () => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  showSearch?: boolean;
  showViewSite?: boolean;
  hasUnreadNotifications?: boolean;
}

/**
 * Clean, responsive top navigation header for the Seller portal.
 *
 * - Mobile / Small Screens:
 *   - Left: 3-bar hamburger button (40x40 circle) to open navigation drawer.
 *   - Center: Screen title (e.g., "Dashboard").
 *   - Right: Notification bell with unread badge + "View site" quick link.
 *
 * - Desktop / PC Screens:
 *   - Left: Clean title without 3-bar button (sidebar is always visible on PC).
 *   - Right: Search input + Notification bell + "View site" quick link.
 */
export function SellerTopHeader({
  title = "Dashboard",
  onPressMenu,
  searchQuery,
  onSearchQueryChange,
  showSearch = true,
  showViewSite = true,
  hasUnreadNotifications = true,
}: SellerTopHeaderProps) {
  const { isTablet } = useResponsive();

  return (
    <View style={[styles.header, isTablet ? styles.headerMobile : styles.headerDesktop]}>
      {/* 3-bar Hamburger Button: strictly for mobile / small screen devices */}
      {isTablet && (
        <Pressable
          accessibilityLabel="Open navigation menu"
          accessibilityRole="button"
          onPress={onPressMenu}
          style={({ pressed }) => [
            styles.iconCircleBtn,
            webPointer,
            pressed && styles.pressed,
          ]}
        >
          <Menu color="#0B1A17" size={20} strokeWidth={1.8} />
        </Pressable>
      )}

      {/* Screen Title */}
      <View style={styles.titleContainer}>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {title}
        </Text>
      </View>

      {/* Right Actions */}
      <View style={styles.headerActions}>
        {/* Search Input (Desktop PC only) */}
        {showSearch && !isTablet && onSearchQueryChange && (
          <View style={styles.searchContainer}>
            <Search color="rgba(11,26,23,0.5)" size={16} />
            <TextInput
              onChangeText={onSearchQueryChange}
              placeholder="Search listings…"
              placeholderTextColor="rgba(11,26,23,0.5)"
              style={styles.searchInput}
              value={searchQuery ?? ""}
            />
          </View>
        )}

        {/* Notification Bell Button with orange badge */}
        <AppLink
          accessibilityLabel="Notifications"
          href="/notifications"
          style={[styles.iconCircleBtn, webPointer]}
        >
          <Bell color="#0B1A17" size={20} strokeWidth={1.8} />
          {hasUnreadNotifications && <View style={styles.notificationDot} />}
        </AppLink>

        {/* View Site Button (kept visible on both PC and mobile) */}
        {showViewSite && (
          <AppLink
            accessibilityLabel="View live site"
            href="/"
            style={[styles.viewSiteBtn, webPointer]}
          >
            <Globe color="#0B1A17" size={16} strokeWidth={1.8} />
            <Text style={styles.viewSiteText}>View site</Text>
          </AppLink>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    minHeight: 64,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11,26,23,0.08)",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    zIndex: 10,
    ...(Platform.OS === "web"
      ? ({ backdropFilter: "blur(8px)" } as any)
      : {}),
  },
  headerMobile: {
    paddingHorizontal: 16,
    gap: 12,
  },
  headerDesktop: {
    paddingHorizontal: 24,
    gap: 16,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 19.2,
    lineHeight: 26,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
    letterSpacing: -0.384,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.08)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pressed: {
    backgroundColor: "rgba(11,26,23,0.05)",
    transform: [{ scale: 0.96 }],
  },
  searchContainer: {
    width: 220,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F4F6F5",
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    paddingHorizontal: 13,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#0B1A17",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  viewSiteBtn: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.08)",
  },
  viewSiteText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F4823A",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
