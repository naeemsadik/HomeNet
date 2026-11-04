import { ChevronRight, Store, X } from "@/components/icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppLink } from "@/components/ui";
import { Brand } from "@/components/Brand";
import { DrawerLanguageDropdown } from "@/components/DrawerLanguageDropdown";
import { colorTokens, fonts, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";
import type { SellerNavKey } from "./SellerShell";

export interface SellerNavItem {
  key: SellerNavKey;
  label: string;
  icon: any;
  badgeCount?: number;
  danger?: boolean;
  href?: string;
}

export interface SellerMobileDrawerProps {
  visible: boolean;
  onClose: () => void;
  activeNav: SellerNavKey;
  onSelectNav: (key: SellerNavKey) => void;
  items: SellerNavItem[];
}

export function SellerMobileDrawer({
  visible,
  onClose,
  activeNav,
  onSelectNav,
  items,
}: SellerMobileDrawerProps) {
  const { t } = useTranslation();

  function renderItem(item: SellerNavItem) {
    const IconComp = item.icon;
    const isActive = activeNav === item.key;
    const iconColor = item.danger
      ? colorTokens.errorText
      : isActive
        ? colorTokens.brandText
        : colorTokens.muted;

    return (
      <AppLink
        href={item.href || "#"}
        key={item.key}
        onPress={() => {
          onSelectNav(item.key);
          onClose();
        }}
        style={[styles.navItem, isActive && styles.navItemActive]}
      >
        <IconComp color={iconColor} size={20} />
        <Text
          style={[
            styles.navItemText,
            isActive && styles.navItemTextActive,
            item.danger && styles.navItemTextDanger,
          ]}
        >
          {item.label}
        </Text>
        {item.badgeCount ? (
          <View style={styles.badgeCountPill}>
            <Text style={styles.badgeCountText}>{item.badgeCount}</Text>
          </View>
        ) : null}
      </AppLink>
    );
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop */}
        <Pressable
          accessibilityLabel={t("seller.drawer.closeOverlayAria")}
          onPress={onClose}
          style={styles.backdrop}
        />

        {/* Drawer Sheet */}
        <View style={styles.drawerCard}>
          {/* Header */}
          <View style={styles.drawerHeader}>
            <Brand compact onPress={onClose} />

            <Pressable
              accessibilityLabel={t("seller.drawer.closeMenuAria")}
              onPress={onClose}
              style={[styles.closeBtn, webPointer]}
            >
              <X color={colorTokens.muted} size={18} />
            </Pressable>
          </View>

          {/* Seller Role Pill */}
          <View style={styles.rolePillWrap}>
            <View style={styles.sellerRolePill}>
              <Text style={styles.sellerRoleText}>{t("seller.drawer.rolePill")}</Text>
            </View>
          </View>

          {/* Back to the buyer site, with its full label: on phones the header shows only the icon. */}
          <AppLink
            accessibilityLabel={t("seller.toggleView.aria")}
            href="/"
            onPress={onClose}
            style={styles.switchToBuyer}
          >
            <Store color={colorTokens.brandText} size={20} />
            <Text style={styles.switchToBuyerText}>{t("seller.toggleView.label")}</Text>
            <ChevronRight color={colorTokens.muted} size={18} />
          </AppLink>

          {/* Navigation Links List */}
          <ScrollView
            contentContainerStyle={styles.navScroll}
            showsVerticalScrollIndicator={false}
            style={styles.navList}
          >
            {items.filter((item) => !item.danger).map(renderItem)}
          </ScrollView>

          {/* Account actions, pinned to the bottom and set apart from the pages above. */}
          <View style={styles.drawerFooter}>
            <DrawerLanguageDropdown />
            {items.filter((item) => item.danger).map(renderItem)}
          </View>
        </View>
      </View>
    </Modal>
  );

}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(11,26,23,0.45)",
  },
  backdrop: {
    position: "absolute",
    inset: 0,
  },
  drawerCard: {
    flexDirection: "column",
    width: 280,
    maxWidth: "85%",
    height: "100%",
    backgroundColor: colorTokens.surface,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    shadowColor: colorTokens.ink,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colorTokens.surfaceSunken,
    alignItems: "center",
    justifyContent: "center",
  },
  rolePillWrap: {
    paddingBottom: 14,
  },
  sellerRolePill: {
    // Blue is kept for the verified badge (docs/COLOR_SYSTEM.md); this is a plain label.
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  sellerRoleText: {
    color: colorTokens.muted,
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  navList: {
    flex: 1,
  },
  drawerFooter: {
    marginTop: 12,
    paddingTop: 12,
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
  },
  navScroll: {
    gap: 2,
    paddingVertical: 4,
  },
  switchToBuyer: {
    minHeight: 48,
    marginBottom: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    // An action, not the current page: only the current page is mint.
    backgroundColor: colorTokens.surface,
    borderWidth: 1,
    borderColor: colorTokens.border,
  },
  switchToBuyerText: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colorTokens.ink,
  },
  navItem: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: colorTokens.brandSurface,
  },
  navItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colorTokens.muted,
  },
  navItemTextActive: {
    // Brand green fails contrast as text (2:1); brandText is 6.3:1.
    color: colorTokens.brandText,
    fontFamily: fonts.bold,
  },
  navItemTextDanger: {
    color: colorTokens.errorText,
  },
  badgeCountPill: {
    backgroundColor: colorTokens.notification,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCountText: {
    color: colorTokens.onAccent,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
});
