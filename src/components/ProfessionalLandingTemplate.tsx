import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { PageMeta } from "@/components/PageMeta";
import { AppLink } from "@/components/ui";
import {
  type IconName,
  AlertCircle,
  AlertTriangle,
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  AtSign,
  BadgeCheck,
  BarChart2,
  BarChart3,
  Bath,
  Bed,
  BedDouble,
  Bell,
  BookOpen,
  Bookmark,
  Briefcase,
  Building,
  Building2,
  Calculator,
  Calendar,
  CalendarCheck,
  Camera,
  Car,
  ChartNoAxesCombined,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CigaretteOff,
  CircleHelp,
  Clock,
  Clock3,
  Compass,
  Copy,
  Cpu,
  CreditCard,
  Database,
  DatabaseZap,
  DoorOpen,
  Edit,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileCheck,
  FileCheck2,
  FileEdit,
  FileText,
  Filter,
  Flag,
  Footprints,
  Globe,
  GraduationCap,
  Grid2X2,
  Handshake,
  Heart,
  HeartHandshake,
  Home,
  IdCard,
  Image,
  Info,
  KeyRound,
  LandPlot,
  Languages,
  Layers,
  LayoutDashboard,
  LineChart,
  List,
  LoaderCircle,
  LocateFixed,
  Lock,
  LogOut,
  Mail,
  MapIcon,
  MapPin,
  MapPinned,
  Maximize,
  Maximize2,
  Menu,
  MessageSquare,
  Minus,
  MoreVertical,
  Pause,
  Pencil,
  Phone,
  Play,
  Plus,
  PlusCircle,
  Receipt,
  RefreshCw,
  Rocket,
  RotateCcw,
  Save,
  Search,
  SearchX,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Star,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  UserRound,
  Users,
  Utensils,
  Video,
  Volume2,
  VolumeX,
  WalletCards,
  X,
  XCircle,
  Zap,
} from "@/components/icons";
import { useResponsive } from "@/hooks/useResponsive";
import { colorTokens, fonts, layout, radius, shadow, webPointer } from "@/theme";

const ICON_COMPONENTS = {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  AtSign,
  BadgeCheck,
  BarChart2,
  BarChart3,
  Bath,
  Bed,
  BedDouble,
  Bell,
  BookOpen,
  Bookmark,
  Briefcase,
  Building,
  Building2,
  Calculator,
  Calendar,
  CalendarCheck,
  Camera,
  Car,
  ChartNoAxesCombined,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CigaretteOff,
  CircleHelp,
  Clock,
  Clock3,
  Compass,
  Copy,
  Cpu,
  CreditCard,
  Database,
  DatabaseZap,
  DoorOpen,
  Edit,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileCheck,
  FileCheck2,
  FileEdit,
  FileText,
  Filter,
  Flag,
  Footprints,
  Globe,
  GraduationCap,
  Grid2X2,
  Handshake,
  Heart,
  HeartHandshake,
  Home,
  IdCard,
  Image,
  Info,
  KeyRound,
  LandPlot,
  Languages,
  Layers,
  LayoutDashboard,
  LineChart,
  List,
  LoaderCircle,
  LocateFixed,
  Lock,
  LogOut,
  Mail,
  MapIcon,
  MapPin,
  MapPinned,
  Maximize,
  Maximize2,
  Menu,
  MessageSquare,
  Minus,
  MoreVertical,
  Pause,
  Pencil,
  Phone,
  Play,
  Plus,
  PlusCircle,
  Receipt,
  RefreshCw,
  Rocket,
  RotateCcw,
  Save,
  Search,
  SearchX,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Star,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  UserRound,
  Users,
  Utensils,
  Video,
  Volume2,
  VolumeX,
  WalletCards,
  X,
  XCircle,
  Zap,
} as const;

function ProfessionalIcon({ name, color, size = 22 }: { name: IconName; color?: string; size?: number }) {
  const Component = ICON_COMPONENTS[name];
  if (!Component) return null;
  return <Component color={color} size={size} strokeWidth={2} />;
}

export interface ProfessionalLandingProps {
  path: string;
  metaTitle: string;
  metaDescription: string;
  badge: string;
  title: string;
  subtitle: string;
  featuresTitle: string;
  features: ReadonlyArray<{
    icon: IconName;
    title: string;
    description: string;
  }>;
  stepsTitle: string;
  steps: ReadonlyArray<{
    step: string;
    title: string;
    description: string;
  }>;
  highlightsTitle?: string;
  highlights?: ReadonlyArray<{
    label: string;
    value: string;
    note?: string;
  }>;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  supportNotice?: string;
}

export function ProfessionalLandingTemplate({
  path,
  metaTitle,
  metaDescription,
  badge,
  title,
  subtitle,
  featuresTitle,
  features,
  stepsTitle,
  steps,
  highlightsTitle,
  highlights,
  primaryCta,
  secondaryCta,
  supportNotice,
}: ProfessionalLandingProps) {
  const { isPhone, containerMaxWidth } = useResponsive();

  return (
    <>
      <PageMeta
        canonicalPath={path}
        description={metaDescription}
        title={metaTitle}
      />
      <AppChrome active={undefined}>
        <View style={[styles.container, { maxWidth: containerMaxWidth }]}>
          {/* Hero Section */}
          <View style={[styles.intro, isPhone && styles.introPhone]}>
            <Text
              accessibilityRole="header"
              aria-level={1}
              style={[styles.title, isPhone && styles.titlePhone]}
            >
              {title}
            </Text>
            <Text style={[styles.subtitle, isPhone && styles.subtitlePhone]}>
              {subtitle}
            </Text>

            <View style={[styles.heroActions, isPhone && styles.heroActionsPhone]}>
              <AppLink href={primaryCta.href} style={[styles.primaryBtn, webPointer]}>
                <Text style={styles.primaryBtnText}>{primaryCta.label}</Text>
              </AppLink>
              <AppLink href={secondaryCta.href} style={[styles.secondaryBtn, webPointer]}>
                <Text style={styles.secondaryBtnText}>{secondaryCta.label}</Text>
              </AppLink>
            </View>
          </View>

          {/* Highlights / Pricing / Metrics Grid (Optional) */}
          {highlights && highlights.length > 0 ? (
            <View style={styles.sectionWrap}>
              {highlightsTitle ? (
                <Text accessibilityRole="header" aria-level={2} style={styles.sectionHeading}>
                  {highlightsTitle}
                </Text>
              ) : null}
              <View style={[styles.highlightsGrid, isPhone && styles.highlightsGridPhone]}>
                {highlights.map((h) => (
                  <View key={h.label} style={[styles.highlightCard, isPhone && styles.highlightCardPhone]}>
                    <Text style={styles.highlightValue}>{h.value}</Text>
                    <Text style={styles.highlightLabel}>{h.label}</Text>
                    {h.note ? <Text style={styles.highlightNote}>{h.note}</Text> : null}
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Features Section */}
          <View style={styles.sectionWrap}>
            <Text accessibilityRole="header" aria-level={2} style={styles.sectionHeading}>
              {featuresTitle}
            </Text>
            <View style={[styles.featuresGrid, isPhone && styles.featuresGridPhone]}>
              {features.map((item) => (
                <View key={item.title} style={[styles.featureCard, isPhone && styles.featureCardPhone]}>
                  <View style={styles.featureIconWrap}>
                    <ProfessionalIcon color={colorTokens.brandText} name={item.icon} size={22} />
                  </View>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDesc}>{item.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Steps / Process Section */}
          <View style={styles.sectionWrap}>
            <Text accessibilityRole="header" aria-level={2} style={styles.sectionHeading}>
              {stepsTitle}
            </Text>
            <View style={[styles.stepsGrid, isPhone && styles.stepsGridPhone]}>
              {steps.map((st) => (
                <View key={st.step} style={[styles.stepCard, isPhone && styles.stepCardPhone]}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>{st.step}</Text>
                  </View>
                  <Text style={styles.stepTitle}>{st.title}</Text>
                  <Text style={styles.stepDesc}>{st.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bottom Support & KYB Notice */}
          <View style={[styles.noticeCard, isPhone && styles.noticeCardPhone]}>
            <View style={styles.noticeIconWrap}>
              <Clock color={colorTokens.brandText} size={22} strokeWidth={2} />
            </View>
            <View style={styles.noticeContent}>
              <Text style={styles.noticeTitle}>
                {supportNotice ?? "Dhaka Operations: Sat–Thu, 9:00 AM – 7:00 PM BST. Relationship managers available for verified agencies & REHAB developers."}
              </Text>
              <AppLink href="/contact" style={[styles.noticeLink, webPointer]}>
                <Text style={styles.noticeLinkText}>Contact Commercial Support</Text>
              </AppLink>
            </View>
          </View>
        </View>
      </AppChrome>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: layout.gutter,
    paddingTop: 36,
    paddingBottom: 64,
  },
  intro: {
    marginBottom: 40,
  },
  introPhone: {
    marginBottom: 28,
  },
  eyebrow: {
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  titlePhone: {
    fontSize: 26,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: colorTokens.body,
    maxWidth: 760,
    marginBottom: 20,
  },
  subtitlePhone: {
    fontSize: 14,
    lineHeight: 22,
  },
  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroActionsPhone: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: colorTokens.brandText,
    paddingHorizontal: 20,
    minHeight: layout.touchTarget,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: {
    color: colorTokens.surface,
    fontFamily: fonts.bold,
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 20,
  },
  secondaryBtn: {
    backgroundColor: colorTokens.surfaceSunken,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    paddingHorizontal: 20,
    minHeight: layout.touchTarget,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryBtnText: {
    color: colorTokens.ink,
    fontFamily: fonts.medium,
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20,
  },
  sectionWrap: {
    marginBottom: 36,
  },
  sectionHeading: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
    marginBottom: 16,
  },
  highlightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  highlightsGridPhone: {
    flexDirection: "column",
    gap: 12,
  },
  highlightCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    ...shadow,
  },
  highlightCardPhone: {
    minWidth: "100%",
  },
  highlightValue: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.brandText,
    marginBottom: 4,
  },
  highlightLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.bold,
    fontWeight: "700",
    color: colorTokens.ink,
    marginBottom: 4,
  },
  highlightNote: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.regular,
    color: colorTokens.muted,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  featuresGridPhone: {
    flexDirection: "column",
    gap: 12,
  },
  featureCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    padding: 24,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    ...shadow,
  },
  featureCardPhone: {
    minWidth: "100%",
    padding: 18,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  featureTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colorTokens.body,
  },
  stepsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  stepsGridPhone: {
    flexDirection: "column",
    gap: 12,
  },
  stepCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    ...shadow,
  },
  stepCardPhone: {
    minWidth: "100%",
    padding: 16,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  stepBadgeText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.bold,
    fontWeight: "700",
    color: colorTokens.brandText,
  },
  stepTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.headingBold,
    fontWeight: "700",
    color: colorTokens.ink,
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.regular,
    color: colorTokens.body,
  },
  noticeCard: {
    backgroundColor: colorTokens.surfaceSunken,
    borderRadius: radius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: colorTokens.divider,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 8,
  },
  noticeCardPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 16,
  },
  noticeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colorTokens.brandSurface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colorTokens.ink,
    marginBottom: 4,
  },
  noticeLink: {
    minHeight: layout.touchTarget,
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  noticeLinkText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.bold,
    fontWeight: "700",
    color: colorTokens.brandText,
    textDecorationLine: "underline",
  },
});
