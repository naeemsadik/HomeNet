import { Building2, X } from "lucide-react-native";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppLink } from "@/components/ui";
import { fonts, webPointer } from "@/theme";
import type { SellerNavKey } from "../screens/SellerDashboardScreen";

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
          accessibilityLabel="Close drawer overlay"
          onPress={onClose}
          style={styles.backdrop}
        />

        {/* Drawer Sheet */}
        <View style={styles.drawerCard}>
          {/* Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.brandRow}>
              <View style={styles.brandIconBg}>
                <Building2 color="#FFFFFF" size={18} />
              </View>
              <Text style={styles.brandText}>
                Home<Text style={styles.brandTextAccent}>net</Text>
              </Text>
            </View>

            <Pressable
              accessibilityLabel="Close navigation menu"
              onPress={onClose}
              style={[styles.closeBtn, webPointer]}
            >
              <X color="#5C6B66" size={18} />
            </Pressable>
          </View>

          {/* Seller Role Pill */}
          <View style={styles.rolePillWrap}>
            <View style={styles.sellerRolePill}>
              <Text style={styles.sellerRoleText}>Seller Dashboard</Text>
            </View>
          </View>

          {/* Navigation Links List */}
          <ScrollView
            contentContainerStyle={styles.navScroll}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => {
              const IconComp = item.icon;
              const isActive = activeNav === item.key;

              return (
                <AppLink
                  href={item.href || "#"}
                  key={item.key}
                  onPress={() => {
                    onSelectNav(item.key);
                    onClose();
                  }}
                  style={[
                    styles.navItem,
                    isActive && styles.navItemActive,
                    item.danger && styles.navItemDanger,
                  ]}
                >
                  <IconComp
                    color={
                      item.danger
                        ? "#D4183D"
                        : isActive
                        ? "#04cf92"
                        : "#5C6B66"
                    }
                    size={20}
                  />
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
            })}
          </ScrollView>
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
    width: 280,
    maxWidth: "85%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    shadowColor: "#0B1A17",
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
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#04cf92",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 17,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
  },
  brandTextAccent: {
    color: "#04cf92",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F4F6F5",
    alignItems: "center",
    justifyContent: "center",
  },
  rolePillWrap: {
    paddingBottom: 14,
  },
  sellerRolePill: {
    backgroundColor: "#E8EEFC",
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  sellerRoleText: {
    color: "#2251D6",
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  navScroll: {
    gap: 2,
    paddingVertical: 4,
  },
  navItem: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: "#E6FAF4",
  },
  navItemDanger: {
    marginTop: 8,
  },
  navItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  navItemTextActive: {
    color: "#04cf92",
    fontFamily: fonts.bold,
  },
  navItemTextDanger: {
    color: "#D4183D",
  },
  badgeCountPill: {
    backgroundColor: "#F4823A",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.bold,
  },
});
