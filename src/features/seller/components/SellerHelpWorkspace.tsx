import { CircleHelp, Mail, MessageSquare, Phone } from "@/components/icons";
import { Text, View } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { colors } from "@/theme";
import { styles } from "../screens/SellerDashboardScreen.styles";

/** Help Center tab. */
export function SellerHelpWorkspace() {
  const { isPhone } = useResponsive();
  return (
    <>
      <View style={[styles.tabHeroBanner, isPhone && styles.tabHeroBannerPhone]}>
        <View style={[styles.tabHeroHeader, isPhone && styles.tabHeroHeaderPhone]}>
          <View style={[styles.tabHeroIconWrap, { backgroundColor: colors.orangeLight }]}>
            <CircleHelp color={colors.orange} size={24} />
          </View>
          <View style={styles.tabHeroTextWrap}>
            <Text style={[styles.tabHeroTitle, isPhone && styles.tabHeroTitlePhone]}>
              Seller Help Center & Support Desk
            </Text>
            <Text style={[styles.tabHeroSubtitle, isPhone && styles.tabHeroSubtitlePhone]}>
              Have questions about listing, verification, or boosting? We're here to help you close deals faster.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.supportChannelsGrid}>
        <View style={styles.supportChannelCard}>
          <View style={[styles.supportChannelIcon, { backgroundColor: colors.greenLight }]}>
            <Phone color={colors.green} size={20} />
          </View>
          <Text style={styles.supportChannelTitle}>Phone Support</Text>
          <Text style={styles.supportChannelValue}>+880 1700-000000</Text>
          <Text style={styles.supportChannelSub}>Mon – Sat, 9:00 AM – 8:00 PM</Text>
        </View>

        <View style={styles.supportChannelCard}>
          <View style={[styles.supportChannelIcon, { backgroundColor: colors.blueLight }]}>
            <Mail color={colors.blue} size={20} />
          </View>
          <Text style={styles.supportChannelTitle}>Partner Desk Email</Text>
          <Text style={styles.supportChannelValue}>partner@homenet.com.bd</Text>
          <Text style={styles.supportChannelSub}>Average reply within 2 hours</Text>
        </View>

        <View style={styles.supportChannelCard}>
          <View style={[styles.supportChannelIcon, { backgroundColor: colors.greenLight }]}>
            <MessageSquare color={colors.green} size={20} />
          </View>
          <Text style={styles.supportChannelTitle}>WhatsApp Desk</Text>
          <Text style={styles.supportChannelValue}>+880 1700-000000</Text>
          <Text style={styles.supportChannelSub}>Instant chat with partner advisor</Text>
        </View>
      </View>

      <View style={[styles.tabCard, isPhone && styles.tabCardPhone]}>
        <View style={styles.tabCardHeader}>
          <Text style={styles.tabCardTitle}>Frequently Asked Questions</Text>
          <Text style={styles.tabCardSub}>Everything you need to know about selling properties on HomeNet</Text>
        </View>

        <View style={styles.faqList}>
          {[
            {
              q: "How do I get my property listings verified?",
              a: "Navigate to the Verification tab in the sidebar. Submit clear digital copies of your property title deed, mutation certificate, or tax receipts. Our compliance team verifies documents within 24 business hours.",
            },
            {
              q: "How does property boosting work?",
              a: "Boosting promotes your listings to the top of buyer search results, features them in weekly newsletters, and highlights them with verified badges. Boosted listings receive up to 10x more buyer views.",
            },
            {
              q: "How will buyers contact me?",
              a: "Buyer inquiries are routed immediately to your verified phone number via SMS and WhatsApp, as well as to your email address. You can view all activity directly on your dashboard.",
            },
            {
              q: "Can I edit my property listings after publishing?",
              a: "Yes. From the sidebar, open 'My Listings', find the property card, and click 'Edit' to update photos, pricing, amenities, or descriptions at any time.",
            },
          ].map((faq, i) => (
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
