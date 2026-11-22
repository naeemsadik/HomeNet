import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown } from "@/components/icons";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import type { FaqEntry } from "@/lib/schema";

/**
 * The questions behind a page's FAQPage markup.
 *
 * Whatever is passed here must be exactly what the page's `faqPageSchema`
 * call receives, or a subset of it: Google accepts that markup only while the
 * questions and answers are visible on the page.
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
      <Text accessibilityRole="header" aria-level={headingLevel} style={styles.sectionTitle}>
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
      {/*
        Heading outside the button, per the WAI-ARIA accordion pattern: a
        heading nested inside a button is flattened into that button's
        accessible name, so screen-reader users lose the question from the
        page's heading list and cannot jump between questions.

        The state is `aria-expanded`, not the `pressedState` helper: that
        emits `aria-pressed`, which describes a toggle button that stays in.
        This row discloses a panel, and announcing both would describe two
        different widgets at once.
      */}
      <View accessibilityRole="header" aria-level={headingLevel}>
        <Pressable
          accessibilityRole="button"
          aria-expanded={open}
          onPress={() => setOpen((wasOpen) => !wasOpen)}
          style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
            styles.question,
            hovered && styles.questionHovered,
            pressed && styles.questionPressed,
            webPointer,
          ]}
        >
          <Text style={styles.questionText}>{entry.question}</Text>
          <View style={open ? styles.chevronOpen : styles.chevron}>
            <ChevronDown size={18} color={colorTokens.muted} />
          </View>
        </Pressable>
      </View>

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
    borderRadius: radius.card,
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
    // 44px minimum touch target: 14 + 14 padding over a 22px line box.
    minHeight: 44,
  },
  questionHovered: {
    backgroundColor: colorTokens.surfaceSunken,
  },
  questionPressed: {
    backgroundColor: colorTokens.surfaceSunken,
    opacity: 0.85,
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
