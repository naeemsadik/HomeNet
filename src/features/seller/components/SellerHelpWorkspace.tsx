import { CircleHelp, Mail, MessageSquare, Phone } from "@/components/icons";
import { Text, View } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { colors } from "@/theme";
import { useTranslation } from "@/i18n";
import { styles } from "../screens/SellerDashboardScreen.styles";

/** Help Center tab. */
export function SellerHelpWorkspace() {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();

  const faqs = [
    {
      q: t("seller.help.faqQ1"),
      a: t("seller.help.faqA1"),
    },
    {
      q: t("seller.help.faqQ2"),
      a: t("seller.help.faqA2"),
    },
    {
      q: t("seller.help.faqQ3"),
      a: t("seller.help.faqA3"),
    },
    {
      q: t("seller.help.faqQ4"),
      a: t("seller.help.faqA4"),
    },
  ];

  return (
    <>
      <View style={[styles.tabHeroBanner, isPhone && styles.tabHeroBannerPhone]}>
        <View style={[styles.tabHeroHeader, isPhone && styles.tabHeroHeaderPhone]}>
          <View style={[styles.tabHeroIconWrap, { backgroundColor: colors.orangeLight }]}>
            <CircleHelp color={colors.orange} size={24} />
          </View>
          <View style={styles.tabHeroTextWrap}>
            <Text style={[styles.tabHeroTitle, isPhone && styles.tabHeroTitlePhone]}>
              {t("seller.help.heroTitle")}
            </Text>
            <Text style={[styles.tabHeroSubtitle, isPhone && styles.tabHeroSubtitlePhone]}>
              {t("seller.help.heroSubtitle")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.supportChannelsGrid}>
        <View style={styles.supportChannelCard}>
          <View style={[styles.supportChannelIcon, { backgroundColor: colors.greenLight }]}>
            <Phone color={colors.green} size={20} />
          </View>
          <Text style={styles.supportChannelTitle}>{t("seller.help.phoneSupport")}</Text>
          <Text style={styles.supportChannelValue}>+880 1700-000000</Text>
          <Text style={styles.supportChannelSub}>{t("seller.help.phoneSupportHours")}</Text>
        </View>

        <View style={styles.supportChannelCard}>
          <View style={[styles.supportChannelIcon, { backgroundColor: colors.blueLight }]}>
            <Mail color={colors.blue} size={20} />
          </View>
          <Text style={styles.supportChannelTitle}>{t("seller.help.emailSupport")}</Text>
          <Text style={styles.supportChannelValue}>partner@homenet.com.bd</Text>
          <Text style={styles.supportChannelSub}>{t("seller.help.emailSupportSub")}</Text>
        </View>

        <View style={styles.supportChannelCard}>
          <View style={[styles.supportChannelIcon, { backgroundColor: colors.greenLight }]}>
            <MessageSquare color={colors.green} size={20} />
          </View>
          <Text style={styles.supportChannelTitle}>{t("seller.help.whatsappSupport")}</Text>
          <Text style={styles.supportChannelValue}>+880 1700-000000</Text>
          <Text style={styles.supportChannelSub}>{t("seller.help.whatsappSupportSub")}</Text>
        </View>
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>{t("seller.help.faqTitle")}</Text>
          <Text style={styles.tabCardSub}>{t("seller.help.faqSubtitle")}</Text>
        </View>

        <View style={styles.faqList}>
          {faqs.map((faq, i) => (
            <View key={i} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}
