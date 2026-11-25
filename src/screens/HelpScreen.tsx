import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppLink } from "@/components/ui";
import {
  ChevronDown,
  CircleHelp,
  FileText,
  Home,
  MessageSquare,
  ShieldCheck,
  type LucideIcon,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

interface FaqItem {
  qKey: string;
  aKey: string;
}

interface FaqCategory {
  id: string;
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  faqs: FaqItem[];
}

export function HelpScreen() {
  const { t } = useTranslation();
  const { isPhone, containerMaxWidth } = useResponsive();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "finding-0": true,
  });

  const toggleFaq = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const categories: FaqCategory[] = [
    {
      id: "finding",
      titleKey: "helpCenter.cat1Title",
      descKey: "helpCenter.cat1Desc",
      icon: Home,
      faqs: [
        {
          qKey: "helpCenter.cat1Faq1Q",
          aKey: "helpCenter.cat1Faq1A",
        },
        {
          qKey: "helpCenter.cat1Faq2Q",
          aKey: "helpCenter.cat1Faq2A",
        },
      ],
    },
    {
      id: "listing",
      titleKey: "helpCenter.cat2Title",
      descKey: "helpCenter.cat2Desc",
      icon: ShieldCheck,
      faqs: [
        {
          qKey: "helpCenter.cat2Faq1Q",
          aKey: "helpCenter.cat2Faq1A",
        },
        {
          qKey: "helpCenter.cat2Faq2Q",
          aKey: "helpCenter.cat2Faq2A",
        },
      ],
    },
    {
      id: "legal",
      titleKey: "helpCenter.cat3Title",
      descKey: "helpCenter.cat3Desc",
      icon: FileText,
      faqs: [
        {
          qKey: "helpCenter.cat3Faq1Q",
          aKey: "helpCenter.cat3Faq1A",
        },
      ],
    },
  ];

  return (
    <AppChrome active={undefined}>
      <View style={[styles.container, { maxWidth: containerMaxWidth }]}>
        {/* Intro */}
        <View style={[styles.intro, isPhone && styles.introPhone]}>
          <Text
            accessibilityRole="header"
            aria-level={1}
            style={[styles.title, isPhone && styles.titlePhone]}
          >
            {t("helpCenter.title")}
          </Text>
          <Text style={[styles.subtitle, isPhone && styles.subtitlePhone]}>
            {t("helpCenter.subtitle")}
          </Text>
        </View>

        {/* Categories and FAQs */}
        <View style={styles.faqList}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <View key={cat.id} style={styles.categoryBlock}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryIconWrap}>
                    <Icon color={colorTokens.brandText} size={20} strokeWidth={2} />
                  </View>
                  <View style={styles.categoryHeaderTextWrap}>
                    <Text accessibilityRole="header" aria-level={2} style={styles.categoryTitle}>
                      {t(cat.titleKey as any)}
                    </Text>
                    <Text style={styles.categoryDesc}>{t(cat.descKey as any)}</Text>
                  </View>
                </View>

                <View style={styles.faqsGroup}>
                  {cat.faqs.map((faq, idx) => {
                    const itemKey = `${cat.id}-${idx}`;
                    const isOpen = Boolean(openItems[itemKey]);
                    const question = t(faq.qKey as any);
                    const answer = t(faq.aKey as any);

                    return (
                      <View key={itemKey} style={styles.faqCard}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={question}
                          aria-expanded={isOpen}
                          onPress={() => toggleFaq(itemKey)}
                          style={[styles.faqTrigger, webPointer]}
                        >
                          <CircleHelp
                            color={colorTokens.brandText}
                            size={18}
                            strokeWidth={2}
                          />
                          <Text style={styles.faqQuestion}>{question}</Text>
                          <View style={isOpen ? styles.chevronOpen : undefined}>
                            <ChevronDown
                              color={colorTokens.ink}
                              size={18}
                              strokeWidth={2}
                            />
                          </View>
                        </Pressable>
                        {isOpen ? (
                          <View style={styles.faqAnswerWrap}>
                            <Text style={styles.faqAnswer}>{answer}</Text>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        {/* Quick Contact CTA Footer */}
        <View style={[styles.contactCard, isPhone && styles.contactCardPhone]}>
          <MessageSquare color={colorTokens.brandText} size={24} strokeWidth={2} />
          <View style={styles.contactTextWrap}>
            <Text style={styles.contactTitle}>{t("helpCenter.ctaContact")}</Text>
            <Text style={styles.contactSubtitle}>
              Sunday – Thursday: 9:00 AM – 6:00 PM BST
            </Text>
          </View>
          <AppLink href="/contact" style={[styles.contactBtn, webPointer]}>
            <Text style={styles.contactBtnText}>{t("footer.contactUs")}</Text>
          </AppLink>
        </View>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: layout.gutter,
    paddingBottom: 64,
  },
  intro: {
    maxWidth: 720,
    alignSelf: "center",
    alignItems: "center",
    marginTop: 48,
    marginBottom: 40,
    textAlign: "center",
  },
  introPhone: {
    marginTop: 28,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  eyebrow: {
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 34,
    color: colorTokens.ink,
    textAlign: "center",
    marginBottom: 12,
  },
  titlePhone: {
    fontSize: 26,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colorTokens.subtle,
    textAlign: "center",
  },
  subtitlePhone: {
    fontSize: 14,
    lineHeight: 22,
  },
  faqList: {
    gap: 32,
    marginBottom: 48,
  },
  categoryBlock: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    padding: 24,
    ...shadow,
  },
  categoryHeader: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryHeaderTextWrap: {
    flex: 1,
  },
  categoryTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colorTokens.ink,
    marginBottom: 4,
  },
  categoryDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colorTokens.subtle,
  },
  faqsGroup: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    overflow: "hidden",
  },
  faqTrigger: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colorTokens.ink,
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  faqAnswerWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  faqAnswer: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colorTokens.body,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorTokens.brandSurface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    padding: 24,
    gap: 16,
  },
  contactCardPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 16,
  },
  contactTextWrap: {
    flex: 1,
  },
  contactTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colorTokens.ink,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colorTokens.subtle,
  },
  contactBtn: {
    backgroundColor: colorTokens.brandText,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.card,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  contactBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colorTokens.surface,
  },
});
