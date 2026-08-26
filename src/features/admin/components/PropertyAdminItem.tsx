import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Eye, Trash2, UserRound, X } from "lucide-react-native";
import { colorTokens, fontTokens } from "@/theme";
import { PropertyStatusBadge } from "./StatusBadge";
import type { PropertyAdminItem } from "../types/admin";

interface PropertyAdminItemProps {
  item: PropertyAdminItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  isMutating?: boolean;
}

export function PropertyAdminItemRow({
  item,
  onApprove,
  onReject,
  onDelete,
  onView,
  isMutating = false,
}: PropertyAdminItemProps) {
  const thumbnail = item.media?.[0]?.thumbnail_url ?? item.media?.[0]?.url;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.thumbnailWrap}>
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <UserRound color={colorTokens.textMuted} size={20} />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.price}>
            {item.price_currency} {item.price.toLocaleString()}
          </Text>
          {item.user ? (
            <Text style={styles.owner} numberOfLines={1}>by {item.user.full_name}</Text>
          ) : null}
        </View>
        <PropertyStatusBadge status={item.status} />
      </View>

      <Text style={styles.date}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>

      <View style={styles.actions}>
        {item.status === "pending" ? (
          <>
            <Pressable
              onPress={() => onApprove(item.id)}
              style={[styles.actionBtn, { backgroundColor: colorTokens.primaryLight }]}
              accessibilityLabel="Activate property"
              disabled={isMutating}
            >
              <Check color={colorTokens.primary} size={14} />
              <Text style={[styles.actionText, { color: colorTokens.primary }]}>Activate</Text>
            </Pressable>
            <Pressable
              onPress={() => onReject(item.id)}
              style={[styles.actionBtn, { backgroundColor: colorTokens.warningLight }]}
              accessibilityLabel="Move property to draft"
              disabled={isMutating}
            >
              <X color={colorTokens.warning} size={14} />
              <Text style={[styles.actionText, { color: colorTokens.warning }]}>Move to draft</Text>
            </Pressable>
          </>
        ) : null}
        <Pressable
          onPress={() => onView(item.id)}
          style={[styles.actionBtn, { backgroundColor: colorTokens.verifiedLight }]}
          accessibilityLabel="View property"
        >
          <Eye color={colorTokens.verified} size={14} />
          <Text style={[styles.actionText, { color: colorTokens.verified }]}>View</Text>
        </Pressable>
        <Pressable
          onPress={() => onDelete(item.id)}
          style={[styles.actionBtn, { backgroundColor: colorTokens.errorLight }]}
          accessibilityLabel="Delete property"
          disabled={isMutating}
        >
          <Trash2 color={colorTokens.error} size={14} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: colorTokens.background,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  thumbnailWrap: {
    width: 56,
    height: 56,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colorTokens.backgroundAlt,
  },
  thumbnail: {
    width: 56,
    height: 56,
  },
  thumbnailPlaceholder: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  price: {
    fontSize: 13,
    fontFamily: fontTokens.semiBold,
    color: colorTokens.primary,
  },
  owner: {
    fontSize: 11,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
  },
  date: {
    fontSize: 11,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontFamily: fontTokens.semiBold,
  },
});
