import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown } from "@/components/icons";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import type { FaqEntry } from "@/lib/schema";

/**
 * The questions behind a page's FAQPage markup.
 *
 * Google accepts that markup only while the same questions and answers are
 * visible on the page, so whatever is passed here must be exactly what the
 * page's `faqPageSchema` call receives.
 *
 * Collapsed by default, but the answers are always in the DOM rather than
 * mounted on expand: the static export is what Googlebot and the answer
 * engines read, and text behind an unclicked toggle still counts while a node
 * that only appears after a press does not.
 */
export function FaqSection({
  entries,
  title,
  headingLevel = 2,
}: {
  entries: FaqEntry[];
  title: string;
  /** Rendered as the aria-level, so a page keeps one sensible heading order. */
  headingLevel?: number;
}) {
  if (entries.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text
        accessibilityRole="header"
        aria-level={headingLevel}
        style={styles.sectionTitle}
      >
        {title}
      </Text>
      <View style={styles.list}>
        {entries.map((entry) => (
          <FaqRow key={entry.question} entry={entry} headingLevel={headingLevel + 1} />
        ))}
      </View>
    </View>
  );
}

function FaqRow({ entry, headingLevel }: { entry: FaqEntry; headingLevel: number }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        aria-expanded={open}
        accessibilityLabel={entry.question}
        onPress={() => setOpen((wasOpen) => !wasOpen)}
        style={[styles.question, webPointer]}
      >
        <Text accessibilityRole="header" aria-level={headingLevel} style={styles.questionText}>
          {entry.question}
        </Text>
        <View style={[styles.chevron, open && styles.chevronOpen]}>
          <ChevronDown size={18} color={colorTokens.muted} />
        </View>
      </Pressable>

      {/* Kept mounted and hidden rather than unmounted: see the note above. */}
      <View style={open ? styles.answerOpen : styles.answerClosed} aria-hidden={!open}>
        <Text style={styles.answerText}>{entry.answer}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    gap: 14,
  },
  sectionTitle: {
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 20,
  },
  list: {
    backgroundColor: colorTokens.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorTokens.border,
    overflow: "hidden",
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.divider,
  },
  question: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  questionText: {
    flex: 1,
    color: colorTokens.ink,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
  },
  chevron: {
    transform: [{ rotate: "0deg" }],
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  answerClosed: {
    height: 0,
    overflow: "hidden",
  },
  answerOpen: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answerText: {
    color: colorTokens.body,
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 23,
  },
});
