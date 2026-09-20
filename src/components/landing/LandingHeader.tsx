import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { User, ArrowRight, Menu, X, ExternalLink, ChevronRight } from 'lucide-react-native';
import { colors, radius, fonts } from '../../theme';
import { useResponsive } from '../../hooks/useResponsive';
import { useAuthStore } from '../../stores/authStore';
import { useAuthModalStore } from '../../stores/useAuthModalStore';
import { Brand } from '../Brand';

interface LandingHeaderProps {
  scrolled?: boolean;
  onNavigateSection?: (sectionKey: string) => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ scrolled = false, onNavigateSection }) => {
  const router = useRouter();
  const { isTablet, isPhone } = useResponsive();
  const user = useAuthStore((s) => s.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Overview', sectionKey: 'hero' },
    { label: 'How it Works', sectionKey: 'journey' },
    { label: 'Capabilities', sectionKey: 'features' },
    { label: 'AI Assistant', sectionKey: 'ai' },
    { label: 'Interface', sectionKey: 'showcase' },
    { label: 'Verification', sectionKey: 'verification' },
    { label: 'Architecture', sectionKey: 'tech' },
  ];

  const handleLinkPress = (sectionKey: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(sectionKey);
    }
  };

  return (
    <View
      style={[
        styles.container,
        scrolled && styles.containerScrolled,
        isPhone && styles.containerPhone,
      ]}
    >
      <View style={styles.inner}>
        {/* Brand */}
        <View style={styles.brandContainer}>
          <Brand href="/" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Platform</Text>
          </View>
        </View>

        {/* Desktop Navigation Links */}
        {!isTablet && (
          <View style={styles.navLinksRow}>
            {navLinks.map((item) => (
              <Pressable
                key={item.sectionKey}
                style={({ hovered }: any) => [
                  styles.navItem,
                  hovered && styles.navItemHovered,
                ]}
                onPress={() => handleLinkPress(item.sectionKey)}
              >
                <Text style={styles.navItemText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Right CTA Actions */}
        <View style={styles.actionsRow}>
          {user ? (
            <Pressable
              style={({ hovered }: any) => [
                styles.ghostBtn,
                hovered && styles.ghostBtnHovered,
              ]}
              onPress={() => router.push('/seller' as any)}
            >
              <User size={18} color={colors.ink} style={{ marginRight: 6 }} />
              <Text style={styles.ghostBtnText}>Dashboard</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ hovered }: any) => [
                styles.ghostBtn,
                hovered && styles.ghostBtnHovered,
              ]}
              onPress={() => useAuthModalStore.getState().open()}
            >
              <Text style={styles.ghostBtnText}>Sign in</Text>
            </Pressable>
          )}

          {!isPhone && (
            <Pressable
              style={({ hovered }: any) => [
                styles.appOutlineBtn,
                hovered && styles.appOutlineBtnHovered,
              ]}
              onPress={() => router.push('/home')}
            >
              <Text style={styles.appOutlineBtnText}>Launch App</Text>
            </Pressable>
          )}

          <Pressable
            style={({ hovered }: any) => [
              styles.primaryBtn,
              hovered && styles.primaryBtnHovered,
            ]}
            onPress={() => router.push('/buy')}
          >
            <Text style={styles.primaryBtnText}>Explore Listings</Text>
            <ArrowRight size={15} color="#0B1A17" style={{ marginLeft: 6 }} />
          </Pressable>

          {/* Mobile Menu Trigger */}
          {isTablet && (
            <Pressable
              style={styles.menuTrigger}
              onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
              accessibilityLabel="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X size={22} color={colors.ink} />
              ) : (
                <Menu size={22} color={colors.ink} />
              )}
            </Pressable>
          )}
        </View>
      </View>

      {/* Mobile dropdown menu */}
      {isTablet && mobileMenuOpen && (
        <View style={styles.mobileDropdown}>
          {navLinks.map((item) => (
            <Pressable
              key={item.sectionKey}
              style={styles.mobileNavItem}
              onPress={() => handleLinkPress(item.sectionKey)}
            >
              <Text style={styles.mobileNavItemText}>{item.label}</Text>
              <ChevronRight size={16} color={colors.muted} />
            </Pressable>
          ))}
          <View style={styles.mobileDivider} />
          <Pressable
            style={styles.mobileNavItem}
            onPress={() => {
              setMobileMenuOpen(false);
              router.push('/home');
            }}
          >
            <Text style={[styles.mobileNavItemText, { color: '#0F6D55', fontFamily: fonts.semiBold }]}>
              Open HomeNet App
            </Text>
            <ExternalLink size={16} color="#0F6D55" />
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'sticky' as any,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        }
      : {}),
  },
  containerScrolled: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }
      : {}),
  },
  containerPhone: {
    paddingHorizontal: 12,
  },
  inner: {
    maxWidth: 1240,
    width: '100%',
    marginHorizontal: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(15, 109, 85, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(15, 109, 85, 0.2)',
  },
  badgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: '#0F6D55',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  navLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    ...(Platform.OS === 'web'
      ? {
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        }
      : {}),
  },
  navItemHovered: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  navItemText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  ghostBtnHovered: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  ghostBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.ink,
  },
  appOutlineBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.15s ease' } : {}),
  },
  appOutlineBtnHovered: {
    borderColor: colors.ink,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  appOutlineBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.ink,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#04CF92',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.15s ease' } : {}),
  },
  primaryBtnHovered: {
    backgroundColor: '#04BD84',
    transform: [{ translateY: -1 }],
  },
  primaryBtnText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#0B1A17',
  },
  menuTrigger: {
    padding: 6,
    borderRadius: radius.md,
    marginLeft: 4,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  mobileDropdown: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  mobileNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  mobileNavItemText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ink,
  },
  mobileDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 4,
  },
});
