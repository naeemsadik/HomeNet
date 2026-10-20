import { StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { AppLink, Eyebrow } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { DELETE_ACCOUNT, PRIVACY_POLICY, TERMS_OF_USE, type LegalDocument } from "@/content/legal";
import { colors, fonts } from "@/theme";

const RELATED = [
  { label: "Privacy Policy", href: "/privacy", doc: PRIVACY_POLICY },
  { label: "Terms of Use", href: "/terms", doc: TERMS_OF_USE },
  { label: "Delete account", href: "/delete-account", doc: DELETE_ACCOUNT },
] as const;

/**
 * A long-form legal page: the privacy policy, the terms, the account-deletion
 * steps. Plain text on purpose: people read these on a phone, and the store
 * reviewer opens the privacy policy link first.
 */
export function LegalScreen({ document }: { document: LegalDocument }) {
  const { isPhone } = useResponsive();

  return (
    <AppChrome active="home">
      <View style={[styles.page, isPhone && styles.pagePhone]}>
        <Eyebrow style={styles.eyebrow}>Legal</Eyebrow>
        <Text accessibilityRole="header" style={[styles.title, isPhone && styles.titlePhone]}>
          {document.title}
        </Text>
        <Text style={styles.summary}>{document.summary}</Text>
        <Text style={styles.updated}>Last updated {document.updated}</Text>

        {document.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text accessibilityRole="header" style={styles.heading}>
              {section.heading}
            </Text>
            {section.paragraphs?.map((text) => (
              <Text key={text} selectable style={styles.body}>
                {text}
              </Text>
            ))}
            {section.bullets?.map((text) => (
              <View key={text} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text selectable style={[styles.body, styles.bulletText]}>
                  {text}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.related}>
          {RELATED.filter((item) => item.doc.title !== document.title).map((item) => (
            <AppLink key={item.href} href={item.href} style={styles.relatedLink}>
              <Text style={styles.relatedText}>{item.label}</Text>
            </AppLink>
          ))}
        </View>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  page: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    marginTop: 44,
    marginBottom: 56,
    paddingHorizontal: 20,
  },
  pagePhone: {
    marginTop: 24,
    marginBottom: 40,
  },
  eyebrow: {
    marginBottom: 10,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -0.4,
  },
  titlePhone: {
    fontSize: 28,
    lineHeight: 34,
  },
  summary: {
    marginTop: 12,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 25,
  },
  updated: {
    marginTop: 8,
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    marginTop: 30,
    gap: 10,
  },
  heading: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  body: {
    color: colors.ink,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingRight: 8,
  },
  bulletDot: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
  },
  related: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  relatedLink: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#FFFFFF",
  },
  relatedText: {
    color: colors.ink,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
});
