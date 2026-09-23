import React from "react";
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, fonts, radius } from "@/theme";

interface MarkdownRendererProps {
  content: string;
}

/**
 * Parses inline formatting like **bold**, *italic*, and [link](url).
 */
function renderInlineText(text: string, keyPrefix: string) {
  // Regex to match **bold**, *italic*, and [anchor](url)
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={key} style={styles.boldText}>
          {part.slice(2, -2)}
        </Text>
      );
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <Text key={key} style={styles.italicText}>
          {part.slice(1, -1)}
        </Text>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, linkText, linkUrl] = linkMatch;
      const handleLink = () => {
        if (Platform.OS === "web" && typeof window !== "undefined") {
          window.open(linkUrl, "_blank", "noopener,noreferrer");
        } else {
          void Linking.openURL(linkUrl);
        }
      };

      return (
        <Text
          key={key}
          onPress={handleLink}
          style={styles.linkText}
        >
          {linkText}
        </Text>
      );
    }

    return <Text key={key}>{part}</Text>;
  });
}

/**
 * Lightweight, zero-dependency Markdown renderer built specifically
 * with React Native primitives to render guides cleanly across Web, iOS, and Android.
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const rawLines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let index = 0;

  while (index < rawLines.length) {
    const line = rawLines[index];
    const trimmed = line.trim();

    // 1. Skip completely empty lines
    if (!trimmed) {
      index++;
      continue;
    }

    // 2. Horizontal rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      elements.push(<View key={`hr-${index}`} style={styles.hr} />);
      index++;
      continue;
    }

    // 3. Headings
    if (trimmed.startsWith("### ")) {
      elements.push(
        <Text key={`h3-${index}`} style={styles.h3}>
          {trimmed.slice(4)}
        </Text>,
      );
      index++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <Text key={`h2-${index}`} style={styles.h2}>
          {trimmed.slice(3)}
        </Text>,
      );
      index++;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      elements.push(
        <Text key={`h1-${index}`} style={styles.h1}>
          {trimmed.slice(2)}
        </Text>,
      );
      index++;
      continue;
    }

    // 4. Blockquote / Alert
    if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (index < rawLines.length && rawLines[index].trim().startsWith("> ")) {
        quoteLines.push(rawLines[index].trim().slice(2));
        index++;
      }
      elements.push(
        <View key={`quote-${index}`} style={styles.blockquote}>
          <Text style={styles.blockquoteText}>
            {renderInlineText(quoteLines.join(" "), `quote-inner-${index}`)}
          </Text>
        </View>,
      );
      continue;
    }

    // 5. Table detection (| col 1 | col 2 |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (
        index < rawLines.length &&
        rawLines[index].trim().startsWith("|") &&
        rawLines[index].trim().endsWith("|")
      ) {
        tableLines.push(rawLines[index].trim());
        index++;
      }

      if (tableLines.length >= 2) {
        const headerRow = tableLines[0]
          .split("|")
          .filter((_, i, arr) => i > 0 && i < arr.length - 1)
          .map((c) => c.trim());

        // Skip line 1 which is separator | :--- | :--- |
        const bodyRows = tableLines.slice(2).map((row) =>
          row
            .split("|")
            .filter((_, i, arr) => i > 0 && i < arr.length - 1)
            .map((c) => c.trim()),
        );

        elements.push(
          <View key={`table-${index}`} style={styles.tableWrapper}>
            <View style={styles.tableHeaderRow}>
              {headerRow.map((col, colIdx) => (
                <View key={`th-${colIdx}`} style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>{col}</Text>
                </View>
              ))}
            </View>
            {bodyRows.map((row, rowIdx) => (
              <View
                key={`tr-${rowIdx}`}
                style={[
                  styles.tableRow,
                  rowIdx % 2 === 1 && styles.tableRowAlt,
                ]}
              >
                {row.map((cell, cellIdx) => (
                  <View key={`td-${rowIdx}-${cellIdx}`} style={styles.tableCell}>
                    <Text style={styles.tableCellText}>
                      {renderInlineText(cell, `td-inner-${rowIdx}-${cellIdx}`)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>,
        );
        continue;
      }
    }

    // 6. Unordered list (- or *)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const listItems: string[] = [];
      while (
        index < rawLines.length &&
        (rawLines[index].trim().startsWith("- ") ||
          rawLines[index].trim().startsWith("* "))
      ) {
        listItems.push(rawLines[index].trim().slice(2));
        index++;
      }

      elements.push(
        <View key={`ul-${index}`} style={styles.listWrap}>
          {listItems.map((item, itemIdx) => (
            <View key={`li-${itemIdx}`} style={styles.listItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.listText}>
                {renderInlineText(item, `li-inner-${itemIdx}`)}
              </Text>
            </View>
          ))}
        </View>,
      );
      continue;
    }

    // 7. Ordered list (1. 2. 3.)
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: { num: string; text: string }[] = [];
      while (index < rawLines.length && /^\d+\.\s/.test(rawLines[index].trim())) {
        const match = rawLines[index].trim().match(/^(\d+)\.\s+(.*)$/);
        if (match) {
          listItems.push({ num: match[1], text: match[2] });
        }
        index++;
      }

      elements.push(
        <View key={`ol-${index}`} style={styles.listWrap}>
          {listItems.map((item, itemIdx) => (
            <View key={`oli-${itemIdx}`} style={styles.listItem}>
              <Text style={styles.orderedNum}>{item.num}.</Text>
              <Text style={styles.listText}>
                {renderInlineText(item.text, `oli-inner-${itemIdx}`)}
              </Text>
            </View>
          ))}
        </View>,
      );
      continue;
    }

    // 8. Regular paragraph
    elements.push(
      <Text key={`p-${index}`} style={styles.paragraph}>
        {renderInlineText(trimmed, `p-inner-${index}`)}
      </Text>,
    );
    index++;
  }

  return <View style={styles.container}>{elements}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 16,
  },
  h1: {
    color: colors.ink,
    fontFamily: fonts.headingExtraBold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.6,
    marginTop: 20,
    marginBottom: 4,
  },
  h2: {
    color: colors.ink,
    fontFamily: fonts.headingBold,
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.4,
    marginTop: 18,
    marginBottom: 4,
  },
  h3: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 24,
    marginTop: 14,
    marginBottom: 2,
  },
  paragraph: {
    color: "#2C3E38",
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 27,
  },
  boldText: {
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  italicText: {
    fontFamily: fonts.medium,
    fontStyle: "italic",
    color: "#3B4E48",
  },
  linkText: {
    color: colors.greenOnLight,
    fontFamily: fonts.semiBold,
    textDecorationLine: "underline",
  },
  hr: {
    width: "100%",
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 12,
  },
  blockquote: {
    borderLeftWidth: 3.5,
    borderLeftColor: colors.green,
    backgroundColor: "#F0FDF8",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.xs,
    marginVertical: 8,
  },
  blockquoteText: {
    color: colors.ink,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 24,
  },
  listWrap: {
    gap: 8,
    marginVertical: 4,
    paddingLeft: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
    marginTop: 10,
    flexShrink: 0,
  },
  orderedNum: {
    color: colors.greenOnLight,
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 24,
    minWidth: 20,
  },
  listText: {
    flex: 1,
    color: "#2C3E38",
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
  },
  tableWrapper: {
    width: "100%",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    marginVertical: 12,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: colors.soft,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  tableHeaderCell: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tableHeaderText: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  tableRowAlt: {
    backgroundColor: "#FAFCFB",
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
  },
  tableCellText: {
    color: "#2C3E38",
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
  },
});
