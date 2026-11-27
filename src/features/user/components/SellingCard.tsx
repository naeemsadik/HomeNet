import { StyleSheet, Text, View } from "react-native";
import { Building2, ChevronRight, LayoutDashboard } from "@/components/icons";
import { AppLink } from "@/components/ui";
import { profileStyles } from "@/components/accountProfile/AccountProfileForm";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, webPointer } from "@/theme";

/** The way from the buyer's profile to the places an owner manages listings. */
export function SellingCard() {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();

  const rows = [
    { href: "/my-properties", label: t("nav.myListings"), Icon: Building2 },
    { href: "/seller", label: t("nav.sellerDashboard"), Icon: LayoutDashboard },
  ];

  return (
    <View style={[profileStyles.card, profileStyles.sectionSpacing, isPhone && profileStyles.cardPhone]}>
      {rows.map(({ href, label, Icon }, index) => (
        <AppLink accessibilityLabel={label} href={href} key={href} style={webPointer}>
          <View style={[styles.row, index > 0 && styles.rowDivided]}>
            <Icon color={colorTokens.ink} size={20} />
            <Text style={styles.label}>{label}</Text>
            <ChevronRight color={colorTokens.muted} size={18} />
          </View>
        </AppLink>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
  },
  rowDivided: {
    borderTopWidth: 1,
    borderTopColor: colorTokens.border,
  },
  label: {
    flex: 1,
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },
});
