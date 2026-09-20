import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, ArrowRight, PlusCircle, ChevronRight } from 'lucide-react-native';
import { colors, radius, fonts } from '../../theme';
import { useResponsive } from '../../hooks/useResponsive';
import { landingCopy } from '../../content/landingCopy';
import { useRequireAuth } from '../../hooks/useRequireAuth';

export const FinalCta: React.FC = () => {
  const router = useRouter();
  const { isTablet, isPhone } = useResponsive();
  const requireAuth = useRequireAuth();
  const copy = landingCopy.finalCta;

  const handleCreateListing = () => {
    requireAuth(() => router.push('/property/create'));
  };

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.card, isTablet && styles.cardTablet, isPhone && styles.cardPhone]}>
        {/* Glow backdrop decoration */}
        <View style={styles.glowDecoration} pointerEvents="none" />

        <View style={styles.content}>
          <View style={styles.pillBadge}>
            <Sparkles size={13} color="#04CF92" style={{ marginRight: 6 }} />
            <Text style={styles.pillText}>Start in under 3 minutes</Text>
          </View>

          <Text style={[styles.headline, isPhone && styles.headlinePhone]}>
            {copy.seekerTitle}
          </Text>

          <Text style={[styles.subheadline, isPhone && styles.subheadlinePhone]}>
            {copy.seekerCopy}
          </Text>

          {/* Action Pathways */}
          <View style={[styles.actionsRow, isPhone && styles.actionsRowPhone]}>
            {/* Primary seeker action */}
            <Pressable
              style={({ hovered }: any) => [
                styles.primaryBtn,
                hovered && styles.btnHovered,
              ]}
              onPress={() => router.push('/buy')}
              accessibilityRole="button"
              accessibilityLabel={copy.seekerBtn}
            >
              <Text style={styles.primaryBtnText}>{copy.seekerBtn}</Text>
              <ArrowRight size={18} color="#0B1A17" style={{ marginLeft: 8 }} />
            </Pressable>

            {/* Secondary owner action */}
            <Pressable
              style={({ hovered }: any) => [
                styles.secondaryBtn,
                hovered && styles.secondaryBtnHovered,
              ]}
              onPress={handleCreateListing}
              accessibilityRole="button"
              accessibilityLabel={copy.ownerBtn}
            >
              <PlusCircle size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.secondaryBtnText}>{copy.ownerBtn}</Text>
            </Pressable>
          </View>

          {/* Tertiary on-ramp: Open existing app */}
          <View style={styles.tertiaryRow}>
            <Text style={styles.tertiaryLabel}>Already exploring or returning to your dashboard?</Text>
            <Pressable
              style={({ hovered }: any) => [
                styles.appLink,
                hovered && { opacity: 0.8 },
              ]}
              onPress={() => router.push('/home')}
            >
              <Text style={styles.appLinkText}>Launch HomeNet app</Text>
              <ChevronRight size={14} color="#04CF92" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    paddingVertical: 24,
  },
  card: {
    backgroundColor: '#0B1A17',
    borderRadius: radius.xl,
    paddingVertical: 64,
    paddingHorizontal: 48,
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(4, 207, 146, 0.2)',
  },
  cardTablet: {
    paddingVertical: 48,
    paddingHorizontal: 28,
  },
  cardPhone: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: radius.lg,
  },
  glowDecoration: {
    position: 'absolute',
    top: -100,
    left: '50%',
    marginLeft: -250,
    width: 500,
    height: 300,
    borderRadius: 250,
    backgroundColor: 'rgba(15, 109, 85, 0.35)',
    ...(Platform.OS === 'web'
      ? {
          filter: 'blur(80px)',
        }
      : {}),
  },
  content: {
    maxWidth: 680,
    alignItems: 'center',
    zIndex: 2,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(4, 207, 146, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(4, 207, 146, 0.3)',
    marginBottom: 20,
  },
  pillText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#04CF92',
    letterSpacing: 0.3,
  },
  headline: {
    fontFamily: fonts.bold,
    fontSize: 38,
    lineHeight: 46,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: 16,
  },
  headlinePhone: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  subheadline: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
    marginBottom: 36,
  },
  subheadlinePhone: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
    width: '100%',
  },
  actionsRowPhone: {
    flexDirection: 'column',
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#04CF92',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: radius.pill,
    ...(Platform.OS === 'web'
      ? {
          cursor: 'pointer',
          transition: 'transform 0.15s ease, background-color 0.15s ease',
        }
      : {}),
  },
  btnHovered: {
    transform: [{ translateY: -2 }],
    backgroundColor: '#04BD84',
  },
  primaryBtnText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: '#0B1A17',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: radius.pill,
    ...(Platform.OS === 'web'
      ? {
          cursor: 'pointer',
          transition: 'transform 0.15s ease, background-color 0.15s ease',
        }
      : {}),
  },
  secondaryBtnHovered: {
    transform: [{ translateY: -2 }],
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  secondaryBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  tertiaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tertiaryLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  appLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  appLinkText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#04CF92',
    textDecorationLine: 'underline',
  },
});
