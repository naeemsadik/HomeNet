import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppLink } from "@/components/ui";
import { ArrowRight, Building2, Calculator, Home, KeyRound, MapPin, PlusCircle } from "@/components/icons";
import { colorTokens, fonts, radius } from "@/theme";
import { useTranslation } from "@/i18n";

export function RelatedPropertyHubs() {
  const { language } = useTranslation();

  const hubs = [
    {
      title: language === "bn" ? "গুলশানে ফ্ল্যাট বিক্রয়" : "Flats for Sale in Gulshan",
      href: "/buy/gulshan",
      desc: language === "bn" ? "প্রিমিয়াম ও কূটনৈতিক এলাকা" : "Diplomatic & prime residential zone",
      icon: MapPin,
    },
    {
      title: language === "bn" ? "ধানমন্ডিতে ফ্ল্যাট বিক্রয়" : "Flats for Sale in Dhanmondi",
      href: "/buy/dhanmondi",
      desc: language === "bn" ? "কেন্দ্রীয় ও প্রতিষ্ঠিত আবাসিক এলাকা" : "Central lakeside residential hub",
      icon: MapPin,
    },
    {
      title: language === "bn" ? "উত্তরায় অ্যাপার্টমেন্ট" : "Properties in Uttara",
      href: "/buy/uttara",
      desc: language === "bn" ? "পরিকল্পিত ও মেট্রো রেল সংযুক্ত এলাকা" : "Planned modern metro-connected sector",
      icon: MapPin,
    },
    {
      title: language === "bn" ? "বসুন্ধরায় প্লট ও ফ্ল্যাট" : "Homes in Bashundhara R/A",
      href: "/buy/bashundhara-ra",
      desc: language === "bn" ? "প্রশস্ত ও শান্ত আবাসিক এলাকা" : "Spacious master-planned community",
      icon: MapPin,
    },
    {
      title: language === "bn" ? "মিরপুরে ফ্ল্যাট বিক্রয়" : "Flats for Sale in Mirpur",
      href: "/buy/mirpur",
      desc: language === "bn" ? "সাশ্রয়ী ও দ্রুত বর্ধনশীল এলাকা" : "Accessible & high-demand zone",
      icon: MapPin,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Building2 color={colorTokens.brand} size={22} strokeWidth={2.2} />
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>
            {language === "bn"
              ? "হোমনেট ও জনপ্রিয় প্রোপার্টি হাবসমূহ"
              : "Explore HomeNet & Popular Property Hubs"}
          </Text>
          <Text style={styles.subtitle}>
            {language === "bn"
              ? "সরাসরি মালিকের ভেরিফাইড প্রোপার্টি খুঁজুন বা বাজারদর মূল্যায়ন করুন।"
              : "Browse verified listings directly from owners or check live neighborhood market rates."}
          </Text>
        </View>
      </View>

      {/* Primary Service Links */}
      <View style={styles.primaryGrid}>
        <AppLink href="/buy" style={styles.primaryCard}>
          <Home color={colorTokens.brand} size={20} strokeWidth={2.2} />
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>
              {language === "bn" ? "বিক্রির সব প্রোপার্টি" : "Properties for Sale"}
            </Text>
            <Text style={styles.cardDesc}>
              {language === "bn" ? "সমগ্র বাংলাদেশে ফ্ল্যাট, বাড়ি ও প্লট" : "Flats, houses & plots across Bangladesh"}
            </Text>
          </View>
          <ArrowRight color={colorTokens.textMuted} size={15} strokeWidth={2.2} />
        </AppLink>

        <AppLink href="/rent" style={styles.primaryCard}>
          <KeyRound color={colorTokens.brand} size={20} strokeWidth={2.2} />
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>
              {language === "bn" ? "ভাড়ার বাসা ও ফ্ল্যাট" : "Rental Homes & Flats"}
            </Text>
            <Text style={styles.cardDesc}>
              {language === "bn" ? "ফ্যামিলি বাসা, ব্যাচেলর ও সাবলেট" : "Family homes, apartments & sublets"}
            </Text>
          </View>
          <ArrowRight color={colorTokens.textMuted} size={15} strokeWidth={2.2} />
        </AppLink>

        <AppLink href="/instant-valuation" style={styles.primaryCard}>
          <Calculator color={colorTokens.brand} size={20} strokeWidth={2.2} />
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>
              {language === "bn" ? "তাৎক্ষণিক মূল্যায়ন ক্যালকুলেটর" : "Instant Valuation Calculator"}
            </Text>
            <Text style={styles.cardDesc}>
              {language === "bn" ? "এলাকাভিত্তিক লাইভ প্রতি বর্গফুট দর" : "Live benchmark price per square foot"}
            </Text>
          </View>
          <ArrowRight color={colorTokens.textMuted} size={15} strokeWidth={2.2} />
        </AppLink>

        <AppLink href="/property/create" style={styles.primaryCard}>
          <PlusCircle color={colorTokens.brand} size={20} strokeWidth={2.2} />
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>
              {language === "bn" ? "ফ্রি প্রোপার্টি লিস্টিং" : "List Your Property Free"}
            </Text>
            <Text style={styles.cardDesc}>
              {language === "bn" ? "০% ব্রোকার কমিশন, সরাসরি ডিল" : "0% brokerage commission, direct buyers"}
            </Text>
          </View>
          <ArrowRight color={colorTokens.textMuted} size={15} strokeWidth={2.2} />
        </AppLink>
      </View>

      {/* Top Dhaka Neighborhood Hubs */}
      <View style={styles.neighborhoodsBlock}>
        <Text style={styles.neighborhoodsTitle}>
          {language === "bn" ? "জনপ্রিয় আবাসিক এলাকা হাবসমূহ" : "Top Dhaka Neighborhood Hubs"}
        </Text>
        <View style={styles.chipsRow}>
          {hubs.map((hub) => (
            <AppLink key={hub.href} href={hub.href} style={styles.hubChip}>
              <Text style={styles.hubChipText}>{hub.title}</Text>
              <ArrowRight color={colorTokens.brand} size={13} strokeWidth={2} />
            </AppLink>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
    padding: 24,
    gap: 20,
    marginTop: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colorTokens.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colorTokens.textSecondary,
    lineHeight: 20,
  },
  primaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryCard: {
    flex: 1,
    minWidth: 260,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
    borderRadius: radius.sm,
    padding: 14,
    minHeight: 52,
  },
  cardTextWrap: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colorTokens.textPrimary,
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colorTokens.textMuted,
  },
  neighborhoodsBlock: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colorTokens.divider,
    paddingTop: 16,
  },
  neighborhoodsTitle: {
    fontSize: 14.5,
    fontFamily: fonts.semiBold,
    color: colorTokens.textPrimary,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  hubChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colorTokens.backgroundAlt,
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    minHeight: 44,
  },
  hubChipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colorTokens.textPrimary,
  },
});
