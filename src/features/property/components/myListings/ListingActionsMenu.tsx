import { Fragment } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import type { ListingAction } from "./useListingActions";

export interface OpenMenu {
  title: string;
  actions: ListingAction[];
  top: number;
  right: number;
}

/** One menu row's height, for placing the menu before it has laid out. */
export const MENU_ITEM_HEIGHT = 44;

const TONE: Record<ListingAction["tone"], string> = {
  default: colorTokens.ink,
  brand: colorTokens.brandText,
  danger: colorTokens.errorText,
};

/**
 * The row's actions on the desktop table, beside the button that opened it.
 * The backdrop closes it, and so does Escape on the web. It sits beside the
 * menu, not around it, so the items are not buttons inside a button.
 */
export function ListingActionsMenu({ menu, onClose }: { menu: OpenMenu | null; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={!!menu}>
      <View style={StyleSheet.absoluteFill}>
        <Pressable accessibilityLabel={t("common.close")} onPress={onClose} style={StyleSheet.absoluteFill} />
        {menu ? (
          <View
            accessibilityRole="menu"
            accessibilityLabel={t("seller.actionsFor", { title: menu.title })}
            style={[styles.menu, { top: menu.top, right: menu.right }]}
          >
            {menu.actions.map((action, index) => {
              const Icon = action.icon;
              const color = TONE[action.tone];
              return (
                <Fragment key={action.key}>
                  {action.key === "delete" && index > 0 ? <View style={styles.divider} /> : null}
                  <Pressable
                    accessibilityRole="menuitem"
                    accessibilityLabel={action.accessibilityLabel}
                    onPress={() => {
                      onClose();
                      void action.run();
                    }}
                    style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                      styles.item,
                      webPointer,
                      (pressed || hovered) && styles.itemActive,
                    ]}
                  >
                    <Icon color={color} size={15} />
                    <Text style={[styles.itemText, { color }]}>{action.label}</Text>
                  </Pressable>
                </Fragment>
              );
            })}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    minWidth: 180,
    paddingVertical: 4,
    borderRadius: radius.xl,
    backgroundColor: colorTokens.surface,
    // Elevation by shadow alone; a border under it would double the edge.
    ...Platform.select({
      web: { boxShadow: `0 8px 24px ${colorTokens.shadow}` },
      default: { elevation: 10 },
    }),
  },
  item: { flexDirection: "row", alignItems: "center", gap: 10, height: MENU_ITEM_HEIGHT, paddingHorizontal: 14 },
  itemActive: { backgroundColor: colorTokens.surfaceSunken },
  itemText: { fontFamily: fonts.semiBold, fontSize: 13 },
  divider: { height: 1, marginVertical: 4, backgroundColor: colorTokens.divider },
});
