import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Eyebrow } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, fonts, layout, radius } from "@/theme";

/** The page frame shared by the resource pages: one column, one hero, then sections. */
export function ResourcePage({ children }: { children: ReactNode }) {
  const { isPhone } = useResponsive();
  return <View style={[styles.page, isPhone && styles.pagePhone]}>{children}</View>;
}

export function ResourceHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <View style={styles.hero}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Text accessibilityRole="header" aria-level={1} style={styles.title}>
        {title}
      </Text>
      <Text style={styles.intro}>{intro}</Text>
    </View>
  );
}

export function ResourceSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" aria-level={2} style={styles.sectionTitle}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

/** A quiet note at the foot of a page: what this is, and what it is not. */
export function ResourceNote({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.note}>
      <Text style={styles.noteTitle}>{title}</Text>
      <Text style={styles.noteBody}>{body}</Text>
    </View>
  );
}

export const resourceCard = {
  borderWidth: 1,
  borderColor: colorTokens.divider,
  borderRadius: radius.card,
  backgroundColor: colorTokens.surface,
  padding: 20,
} as const;

const styles = StyleSheet.create({
  page: {
    width: "100%",
    maxWidth: 1040,
    alignSelf: "center",
    paddingHorizontal: layout.gutter,
    paddingTop: 40,
    paddingBottom: 64,
  },
  pagePhone: { paddingHorizontal: layout.gutterPhone, paddingTop: 24, paddingBottom: 48 },
  hero: { marginBottom: 36, maxWidth: 720 },
  title: {
    marginTop: 8,
    fontFamily: fonts.headingBold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.4,
    color: colorTokens.ink,
  },
  intro: { marginTop: 12, fontFamily: fonts.regular, fontSize: 16, lineHeight: 25, color: colorTokens.body },
  section: { marginBottom: 40 },
  sectionTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
    color: colorTokens.ink,
  },
  sectionSubtitle: {
    marginTop: 6,
    maxWidth: 680,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 23,
    color: colorTokens.muted,
  },
  sectionBody: { marginTop: 20 },
  note: {
    marginTop: 8,
    padding: 20,
    borderRadius: radius.card,
    backgroundColor: colorTokens.surfaceSunken,
  },
  noteTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.ink },
  noteBody: { marginTop: 6, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colorTokens.body },
});
