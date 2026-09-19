import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Cpu } from 'lucide-react-native';
import { colors, radius, fonts } from '../../theme';
import { useResponsive } from '../../hooks/useResponsive';
import { Brand } from '../Brand';
import { useAuthModalStore } from '../../stores/useAuthModalStore';

export const LandingFooter: React.FC = () => {
  const router = useRouter();
  const { isTablet, isPhone } = useResponsive();
  const year = new Date().getFullYear();

  const marketplaceLinks = [
    { label: 'Browse Properties', href: '/buy' },
    { label: 'Explore Locations', href: '/explore' },
    { label: 'Verified Listings', href: '/buy?verified_only=true' },
  ];

  const ownerLinks = [
    { label: 'List a Property', href: '/property/create' },
    { label: 'Seller Dashboard', href: '/seller' },
    { label: 'Verification Process', href: '/verification' },
  ];

  const platformLinks: { label: string; href?: string; onPress?: () => void }[] = [
    { label: 'Open HomeNet App', href: '/home' },
    { label: 'Account Profile', href: '/profile' },
    {
      label: 'Sign In / Register',
      onPress: () => useAuthModalStore.getState().open(),
    },
  ];

  return (
    <View style={styles.footer}>
      <View style={styles.inner}>
        {/* Top section: Columns */}
        <View style={[styles.topRow, isTablet && styles.topRowTablet, isPhone && styles.topRowPhone]}>
          {/* Brand & Mission column */}
          <View style={[styles.brandCol, isPhone && styles.brandColPhone]}>
            <Brand href="/" />
            <Text style={styles.missionText}>
              The transparent real estate marketplace with verified listings, direct owner connections, and high-performance search.
            </Text>
            <View style={styles.techTag}>
              <Cpu size={14} color="#0F6D55" style={{ marginRight: 6 }} />
              <Text style={styles.techTagText}>Direct API • Real-Time Engine</Text>
            </View>
          </View>

          {/* Nav columns */}
          <View style={[styles.navColsGrid, isPhone && styles.navColsGridPhone]}>
            {/* Marketplace */}
            <View style={styles.navCol}>
              <Text style={styles.navHeading}>Marketplace</Text>
              {marketplaceLinks.map((link) => (
                <Pressable
                  key={link.label}
                  style={({ hovered }: any) => [
                    styles.linkItem,
                    hovered && styles.linkItemHovered,
                  ]}
                  onPress={() => router.push(link.href as any)}
                >
                  <Text style={styles.linkText}>{link.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* For Owners */}
            <View style={styles.navCol}>
              <Text style={styles.navHeading}>For Owners</Text>
              {ownerLinks.map((link) => (
                <Pressable
                  key={link.label}
                  style={({ hovered }: any) => [
                    styles.linkItem,
                    hovered && styles.linkItemHovered,
                  ]}
                  onPress={() => router.push(link.href as any)}
                >
                  <Text style={styles.linkText}>{link.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Application */}
            <View style={styles.navCol}>
              <Text style={styles.navHeading}>Application</Text>
              {platformLinks.map((link) => (
                <Pressable
                  key={link.label}
                  style={({ hovered }: any) => [
                    styles.linkItem,
                    hovered && styles.linkItemHovered,
                  ]}
                  onPress={() =>
                    link.onPress ? link.onPress() : router.push(link.href as any)
                  }
                >
                  <Text style={styles.linkText}>{link.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom divider & copyright */}
        <View style={styles.divider} />

        <View style={[styles.bottomRow, isPhone && styles.bottomRowPhone]}>
          <Text style={styles.copyrightText}>
            © {year} HomeNet. Designed for transparent, direct property commerce.
          </Text>

          <View style={styles.bottomMeta}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>API Systems Operational</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.07)',
    paddingTop: 64,
    paddingBottom: 40,
  },
  inner: {
    maxWidth: 1240,
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 48,
    marginBottom: 48,
  },
  topRowTablet: {
    flexDirection: 'column',
    gap: 40,
  },
  topRowPhone: {
    gap: 32,
  },
  brandCol: {
    maxWidth: 360,
  },
  brandColPhone: {
    maxWidth: '100%',
  },
  missionText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
    marginTop: 14,
    marginBottom: 18,
  },
  techTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 109, 85, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(15, 109, 85, 0.2)',
  },
  techTagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#0F6D55',
  },
  navColsGrid: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 64,
  },
  navColsGridPhone: {
    flexDirection: 'column',
    gap: 28,
  },
  navCol: {
    minWidth: 130,
  },
  navHeading: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  linkItem: {
    paddingVertical: 6,
    ...(Platform.OS === 'web'
      ? {
          cursor: 'pointer',
          transition: 'color 0.15s ease',
        }
      : {}),
  },
  linkItemHovered: {
    opacity: 0.75,
  },
  linkText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 24,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  bottomRowPhone: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  copyrightText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  bottomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#04CF92',
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
});
