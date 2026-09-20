import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, fonts } from '../../theme';
import { useResponsive } from '../../hooks/useResponsive';

interface LandingSectionProps {
  id?: string;
  background?: 'white' | 'tint' | 'dark';
  maxWidth?: number;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  children: React.ReactNode;
  style?: any;
}

export const LandingSection: React.FC<LandingSectionProps> = ({
  id,
  background = 'white',
  maxWidth = 1180,
  eyebrow,
  title,
  subtitle,
  align = 'center',
  children,
  style,
}) => {
  const { isTablet, isPhone } = useResponsive();

  const getBgColor = () => {
    switch (background) {
      case 'tint':
        return '#F8FAF9';
      case 'dark':
        return '#0B1A17';
      case 'white':
      default:
        return '#FFFFFF';
    }
  };

  const isDark = background === 'dark';

  return (
    <View
      {...(Platform.OS === 'web' && id ? { id } : {})}
      style={[
        styles.sectionWrapper,
        { backgroundColor: getBgColor() },
        isTablet && styles.sectionWrapperTablet,
        isPhone && styles.sectionWrapperPhone,
        style,
      ]}
    >
      <View style={[styles.innerContainer, { maxWidth }, isTablet && styles.innerContainerTablet, isPhone && styles.innerContainerPhone]}>
        {(eyebrow || title || subtitle) && (
          <View
            style={[
              styles.headerBlock,
              align === 'center' ? styles.headerCenter : styles.headerLeft,
              isPhone && styles.headerBlockPhone,
            ]}
          >
            {eyebrow ? (
              <View style={[styles.eyebrowBadge, isDark && styles.eyebrowBadgeDark]}>
                <Text style={[styles.eyebrowText, isDark && styles.eyebrowTextDark]}>
                  {eyebrow}
                </Text>
              </View>
            ) : null}

            {title ? (
              <Text
                style={[
                  styles.title,
                  isDark && styles.titleDark,
                  isPhone && styles.titlePhone,
                  align === 'center' ? { textAlign: 'center' } : { textAlign: 'left' },
                ]}
              >
                {title}
              </Text>
            ) : null}

            {subtitle ? (
              <Text
                style={[
                  styles.subtitle,
                  isDark && styles.subtitleDark,
                  isPhone && styles.subtitlePhone,
                  align === 'center' ? { textAlign: 'center' } : { textAlign: 'left' },
                ]}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        )}

        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionWrapper: {
    width: '100%',
    paddingVertical: 84,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
  },
  sectionWrapperTablet: {
    paddingVertical: 64,
  },
  sectionWrapperPhone: {
    paddingVertical: 48,
  },
  innerContainer: {
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: 32,
  },
  innerContainerTablet: {
    paddingHorizontal: 24,
  },
  innerContainerPhone: {
    paddingHorizontal: 16,
  },
  headerBlock: {
    marginBottom: 48,
    maxWidth: 760,
  },
  headerBlockPhone: {
    marginBottom: 32,
  },
  headerCenter: {
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  headerLeft: {
    alignItems: 'flex-start',
  },
  eyebrowBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 109, 85, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(15, 109, 85, 0.2)',
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  eyebrowBadgeDark: {
    backgroundColor: 'rgba(4, 207, 146, 0.12)',
    borderColor: 'rgba(4, 207, 146, 0.3)',
  },
  eyebrowText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: '#0F6D55',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  eyebrowTextDark: {
    color: '#04CF92',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 42,
    color: colors.ink,
    letterSpacing: -0.6,
    marginBottom: 14,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  titlePhone: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 26,
    color: colors.muted,
  },
  subtitleDark: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  subtitlePhone: {
    fontSize: 15,
    lineHeight: 22,
  },
});
