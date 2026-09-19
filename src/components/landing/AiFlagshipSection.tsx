import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Sparkles,
  ArrowRight,
  Check,
  AlertTriangle,
  RotateCcw,
  Edit3,
  Languages,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  Play,
} from 'lucide-react-native';
import { colors, radius, fonts } from '../../theme';
import { useResponsive } from '../../hooks/useResponsive';
import { useAuthStore } from '../../stores/authStore';
import { useAuthModalStore } from '../../stores/useAuthModalStore';
import {
  landingCopy,
  AI_DEMO_SCRIPT,
  MARKET_POSITION_CLAIM,
} from '../../content/landingCopy';

type DemoState = 'idle' | 'typing' | 'analyzing' | 'preview';

export const AiFlagshipSection: React.FC = () => {
  const router = useRouter();
  const { isTablet, isPhone } = useResponsive();
  const user = useAuthStore((s) => s.user);

  // In-view detection to trigger animation only when seen
  const containerRef = useRef<View>(null);
  const [isInView, setIsInView] = useState(false);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      const node = containerRef.current as unknown as Element | null;
      if (node) {
        observer.observe(node);
      }
      return () => observer.disconnect();
    } else {
      setIsInView(true);
    }
  }, []);

  // Demo sequence state
  const [demoState, setDemoState] = useState<DemoState>('idle');
  const [typedText, setTypedText] = useState('');
  const [parsedData, setParsedData] = useState(AI_DEMO_SCRIPT.parsedOutput);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [activeHeadline, setActiveHeadline] = useState(0);

  const copy = landingCopy.aiFlagship;
  const targetText = AI_DEMO_SCRIPT.inputText;

  // Reduced motion detection
  const prefersReducedMotion =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // Start animated sequence
  const runSequence = useCallback(() => {
    if (prefersReducedMotion) {
      setTypedText(targetText);
      setDemoState('preview');
      return;
    }

    setDemoState('typing');
    setTypedText('');
    let currIndex = 0;

    const typeInterval = setInterval(() => {
      currIndex += 1;
      setTypedText(targetText.slice(0, currIndex));

      if (currIndex >= targetText.length) {
        clearInterval(typeInterval);

        // Pause briefly, then transition to analyzing
        setTimeout(() => {
          setDemoState('analyzing');

          // Hold analyzing for 900ms, then show populated preview
          setTimeout(() => {
            setDemoState('preview');
          }, 900);
        }, 500);
      }
    }, 24); // Typing speed
  }, [prefersReducedMotion, targetText]);

  // Trigger automatically when scrolled into view
  useEffect(() => {
    if (isInView && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      const timer = setTimeout(() => {
        runSequence();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isInView, runSequence]);

  const handleManualAnalyze = () => {
    if (demoState === 'analyzing') return;
    setDemoState('analyzing');
    setTimeout(() => {
      setDemoState('preview');
    }, 700);
  };

  const handleReset = () => {
    setDemoState('idle');
    setTypedText('');
    setEditingField(null);
  };

  const handleApply = () => {
    if (user) {
      router.push('/property/create');
    } else {
      useAuthModalStore.getState().open(() => {
        router.push('/property/create');
      });
    }
  };

  const handleFieldEdit = (fieldKey: string, value: string) => {
    setParsedData((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const amenityEntries = Object.entries(parsedData.amenities).filter(([, val]) => val);

  return (
    <View ref={containerRef} style={styles.sectionRoot}>
      {/* Optional market position claim — strictly rendered ONLY if explicitly approved */}
      {MARKET_POSITION_CLAIM.approved && (
        <View style={styles.marketPositionStrip}>
          <Text style={styles.marketPositionText}>{MARKET_POSITION_CLAIM.text}</Text>
        </View>
      )}

      {/* Main Container */}
      <View style={[styles.innerContainer, isTablet && styles.innerContainerTablet]}>
        {/* Section Header */}
        <View style={styles.headerBlock}>
          <View style={styles.eyebrowBadge}>
            <Languages size={14} color="#0F6D55" style={{ marginRight: 6 }} />
            <Text style={styles.eyebrowText}>{copy.eyebrow}</Text>
          </View>

          <Text style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}>
            {copy.title}
          </Text>

          <Text style={[styles.sectionSubtitle, isPhone && styles.sectionSubtitlePhone]}>
            {copy.subtitle}
          </Text>
        </View>

        {/* Flagship Content Grid: 3 Headlines on Left, Interactive Sheet on Right */}
        <View style={[styles.flagshipGrid, isTablet && styles.flagshipGridTablet]}>
          {/* =========================================================================
              LEFT COLUMN: The 3 Core Truths (Ordered 1, 2, 3)
              ========================================================================= */}
          <View style={styles.headlinesCol}>
            {copy.headlines.map((headline, idx) => {
              const isActive = activeHeadline === idx;
              const icons = [
                <Languages key="1" size={20} color="#0F6D55" />,
                <ShieldAlert key="2" size={20} color="#0F6D55" />,
                <Sliders key="3" size={20} color="#0F6D55" />,
              ];

              return (
                <Pressable
                  key={headline.num}
                  style={({ hovered }: any) => [
                    styles.headlineCard,
                    isActive && styles.headlineCardActive,
                    hovered && styles.headlineCardHovered,
                  ]}
                  onPress={() => setActiveHeadline(idx)}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.headlineIconBox}>{icons[idx]}</View>
                    <View style={styles.headlineTagPill}>
                      <Text style={styles.headlineTagText}>{headline.tag}</Text>
                    </View>
                  </View>

                  <Text style={styles.headlineItemTitle}>
                    {headline.num}. {headline.title}
                  </Text>

                  <Text style={styles.headlineItemDesc}>{headline.desc}</Text>

                  {/* Bullet specifics for each headline */}
                  <View style={styles.examplesList}>
                    {headline.examples.map((item, itemIdx) => (
                      <View key={itemIdx} style={styles.exampleRow}>
                        <CheckCircle2 size={13} color="#0F6D55" style={{ marginTop: 2, marginRight: 8 }} />
                        <Text style={styles.exampleText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* =========================================================================
              RIGHT COLUMN: The Product Demonstration (Authentic AiListingSheet)
              ========================================================================= */}
          <View style={styles.demoCol}>
            {/* Device Frame */}
            <View style={styles.deviceFrame}>
              {/* Device Window Chrome */}
              <View style={styles.deviceChromeBar}>
                <View style={styles.chromeDotsRow}>
                  <View style={[styles.chromeDot, { backgroundColor: '#FF5F56' }]} />
                  <View style={[styles.chromeDot, { backgroundColor: '#FFBD2E' }]} />
                  <View style={[styles.chromeDot, { backgroundColor: '#27C93F' }]} />
                </View>
                <Text style={styles.deviceChromeTitle}>HomeNet Listing Assistant</Text>
                {demoState === 'preview' && (
                  <Pressable
                    style={({ hovered }: any) => [
                      styles.replayBtn,
                      hovered && { opacity: 0.8 },
                    ]}
                    onPress={runSequence}
                    accessibilityLabel="Replay demo"
                  >
                    <Play size={11} color="#0F6D55" style={{ marginRight: 4 }} />
                    <Text style={styles.replayBtnText}>Replay</Text>
                  </Pressable>
                )}
              </View>

              {/* Sheet Header */}
              <View style={styles.sheetHeader}>
                <View style={styles.sheetHeaderIconWrap}>
                  <Sparkles size={18} color="#0F6D55" />
                </View>
                <View style={styles.sheetHeaderTextWrap}>
                  <Text style={styles.sheetHeaderTitle}>AI Property Listing</Text>
                  <Text style={styles.sheetHeaderSubtitle}>
                    {demoState === 'preview'
                      ? 'Review extracted fields before applying'
                      : 'Describe your property and let AI fill the form'}
                  </Text>
                </View>
              </View>

              <View style={styles.sheetDivider} />

              {/* Sheet Body */}
              <View style={styles.sheetBody}>
                {/* ── STAGE 1: IDLE / TYPING / ANALYZING ──────────────────────────── */}
                {(demoState === 'idle' || demoState === 'typing' || demoState === 'analyzing') && (
                  <View style={styles.inputStage}>
                    <View style={styles.textareaWrap}>
                      <TextInput
                        multiline
                        numberOfLines={5}
                        style={styles.sheetTextarea}
                        value={demoState === 'idle' ? typedText : typedText || targetText}
                        onChangeText={setTypedText}
                        placeholder={copy.demoInputPlaceholder}
                        placeholderTextColor="#899790"
                        editable={demoState === 'idle'}
                        textAlignVertical="top"
                      />
                      {demoState === 'typing' && (
                        <View style={styles.typingCursor} />
                      )}
                    </View>

                    {/* Character Count */}
                    <View style={styles.charCountRow}>
                      <Text style={styles.charCountText}>
                        {(typedText || (demoState === 'idle' ? '' : targetText)).length} characters
                      </Text>
                    </View>

                    {/* Action Button */}
                    {demoState === 'analyzing' ? (
                      <View style={styles.analyzingStateRow}>
                        <ActivityIndicator size="small" color="#04CF92" />
                        <Text style={styles.analyzingText}>{copy.analyzingState}</Text>
                      </View>
                    ) : (
                      <Pressable
                        style={({ hovered }: any) => [
                          styles.analyzeBtn,
                          hovered && styles.analyzeBtnHovered,
                        ]}
                        onPress={demoState === 'idle' ? runSequence : handleManualAnalyze}
                      >
                        <Sparkles size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.analyzeBtnText}>{copy.analyzeBtn}</Text>
                      </Pressable>
                    )}
                  </View>
                )}

                {/* ── STAGE 2: EXTRACTED PREVIEW (Exact AiListingSheet layout) ────── */}
                {demoState === 'preview' && (
                  <View style={styles.previewStage}>
                    {/* BDT Conversion Banner */}
                    <View style={styles.conversionBanner}>
                      <View style={styles.conversionTag}>
                        <Text style={styles.conversionTagLabel}>Automatic Currency Parsing</Text>
                        <Text style={styles.conversionTagValue}>
                          {copy.priceConversionBadge}
                        </Text>
                      </View>
                    </View>

                    {/* Section: Basics */}
                    <View style={styles.fieldSection}>
                      <Text style={styles.fieldSectionTitle}>Basics</Text>

                      {/* Title */}
                      <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Title</Text>
                        <View style={styles.fieldValueBox}>
                          <Text style={styles.fieldValueText}>{parsedData.title}</Text>
                        </View>
                      </View>

                      {/* Category & Subtype */}
                      <View style={styles.fieldRowTwoCol}>
                        <View style={styles.colHalf}>
                          <Text style={styles.fieldLabel}>Category</Text>
                          <View style={styles.fieldValueBox}>
                            <Text style={styles.fieldValueText}>{parsedData.type}</Text>
                          </View>
                        </View>
                        <View style={styles.colHalf}>
                          <Text style={styles.fieldLabel}>Subtype</Text>
                          <View style={styles.fieldValueBox}>
                            <Text style={styles.fieldValueText}>{parsedData.subtype}</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Section: Details */}
                    <View style={styles.fieldSection}>
                      <Text style={styles.fieldSectionTitle}>Details</Text>

                      {/* Price in BDT */}
                      <View style={styles.fieldRow}>
                        <View style={styles.labelWithBadgeRow}>
                          <Text style={styles.fieldLabel}>Price (BDT)</Text>
                          <View style={styles.resolvedBadge}>
                            <Check size={11} color="#0F6D55" style={{ marginRight: 3 }} />
                            <Text style={styles.resolvedBadgeText}>Resolved from {parsedData.priceRaw}</Text>
                          </View>
                        </View>
                        <View style={styles.fieldValueBox}>
                          <Text style={[styles.fieldValueText, { fontFamily: fonts.semiBold, color: '#0F6D55' }]}>
                            {parsedData.priceDisplay}
                          </Text>
                        </View>
                      </View>

                      {/* Size, Beds, Floor */}
                      <View style={styles.fieldRowThreeCol}>
                        <View style={styles.colThird}>
                          <Text style={styles.fieldLabel}>Area</Text>
                          <View style={styles.fieldValueBox}>
                            <Text style={styles.fieldValueText}>{parsedData.areaSize} {parsedData.areaUnit}</Text>
                          </View>
                        </View>
                        <View style={styles.colThird}>
                          <Text style={styles.fieldLabel}>Beds / Baths</Text>
                          <View style={styles.fieldValueBox}>
                            <Text style={styles.fieldValueText}>{parsedData.bedrooms}B / {parsedData.bathrooms}B</Text>
                          </View>
                        </View>
                        <View style={styles.colThird}>
                          <Text style={styles.fieldLabel}>Floor</Text>
                          <View style={styles.fieldValueBox}>
                            <Text style={styles.fieldValueText}>{parsedData.floor}th</Text>
                          </View>
                        </View>
                      </View>

                      {/* Facing with Low Confidence Badge (Faithful to AiListingSheet) */}
                      <View style={styles.fieldRow}>
                        <View style={styles.labelWithBadgeRow}>
                          <Text style={styles.fieldLabel}>Facing</Text>
                          <View style={styles.lowConfBadge}>
                            <AlertTriangle size={11} color="#D4870A" style={{ marginRight: 4 }} />
                            <Text style={styles.lowConfText}>{copy.lowConfidenceNotice}</Text>
                          </View>
                        </View>

                        {editingField === 'facing' ? (
                          <View style={styles.fieldEditRow}>
                            <TextInput
                              style={styles.fieldEditInput}
                              value={parsedData.facing}
                              onChangeText={(v) => handleFieldEdit('facing', v)}
                              autoFocus
                              onBlur={() => setEditingField(null)}
                            />
                            <Pressable
                              style={styles.fieldEditDone}
                              onPress={() => setEditingField(null)}
                            >
                              <Check size={14} color="#0F6D55" />
                            </Pressable>
                          </View>
                        ) : (
                          <Pressable
                            style={styles.fieldValueBoxEditable}
                            onPress={() => setEditingField('facing')}
                          >
                            <Text style={[styles.fieldValueText, styles.fieldValueTextLow]}>
                              {parsedData.facing}
                            </Text>
                            <Edit3 size={13} color="#899790" />
                          </Pressable>
                        )}
                      </View>
                    </View>

                    {/* Section: Location */}
                    <View style={styles.fieldSection}>
                      <Text style={styles.fieldSectionTitle}>Location</Text>
                      <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Address</Text>
                        <View style={styles.fieldValueBox}>
                          <Text style={styles.fieldValueText}>{parsedData.address}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Section: Amenities */}
                    <View style={styles.fieldSection}>
                      <Text style={styles.fieldSectionTitle}>Detected Amenities</Text>
                      <View style={styles.amenityChipsGrid}>
                        {amenityEntries.map(([key]) => (
                          <View key={key} style={styles.amenityChip}>
                            <Check size={12} color="#0F6D55" style={{ marginRight: 4 }} />
                            <Text style={styles.amenityChipText}>{key.replace(/_/g, ' ')}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Sheet Actions */}
                    <View style={styles.sheetActionsRow}>
                      <Pressable
                        style={({ hovered }: any) => [
                          styles.tryAgainBtn,
                          hovered && styles.tryAgainBtnHovered,
                        ]}
                        onPress={handleReset}
                      >
                        <RotateCcw size={14} color={colors.muted} style={{ marginRight: 6 }} />
                        <Text style={styles.tryAgainText}>{copy.tryAgainBtn}</Text>
                      </Pressable>

                      <Pressable
                        style={({ hovered }: any) => [
                          styles.applyBtn,
                          hovered && styles.applyBtnHovered,
                        ]}
                        onPress={handleApply}
                      >
                        <Text style={styles.applyBtnText}>{copy.applyBtn}</Text>
                        <ArrowRight size={15} color="#FFFFFF" style={{ marginLeft: 6 }} />
                      </Pressable>
                    </View>

                    {/* Sheet Disclaimer */}
                    <Text style={styles.sheetDisclaimer}>{copy.disclaimer}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionRoot: {
    width: '100%',
    backgroundColor: '#F8FAF9',
    paddingVertical: 84,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  marketPositionStrip: {
    width: '100%',
    backgroundColor: '#0B1A17',
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  marketPositionText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#04CF92',
    letterSpacing: 0.5,
  },
  innerContainer: {
    maxWidth: 1240,
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: 28,
  },
  innerContainerTablet: {
    paddingHorizontal: 20,
  },
  headerBlock: {
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: 820,
    marginHorizontal: 'auto',
    marginBottom: 56,
  },
  eyebrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15, 109, 85, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(15, 109, 85, 0.2)',
    marginBottom: 16,
  },
  eyebrowText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: '#0F6D55',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 38,
    lineHeight: 46,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: 16,
  },
  sectionTitlePhone: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 26,
    color: colors.muted,
    textAlign: 'center',
  },
  sectionSubtitlePhone: {
    fontSize: 15,
    lineHeight: 22,
  },
  flagshipGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 36,
    width: '100%',
  },
  flagshipGridTablet: {
    flexDirection: 'column',
    gap: 32,
  },
  headlinesCol: {
    flex: 1,
    gap: 16,
    width: '100%',
  },
  headlineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(11, 26, 23, 0.08)',
    ...(Platform.OS === 'web'
      ? {
          cursor: 'pointer',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        }
      : {}),
  },
  headlineCardActive: {
    borderColor: '#0F6D55',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F6D55',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
  },
  headlineCardHovered: {
    transform: [{ translateY: -2 }],
    borderColor: 'rgba(15, 109, 85, 0.4)',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headlineIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 109, 85, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlineTagPill: {
    backgroundColor: 'rgba(15, 109, 85, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  headlineTagText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#0F6D55',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  headlineItemTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  headlineItemDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
    marginBottom: 14,
  },
  examplesList: {
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.04)',
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  exampleText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink,
  },
  demoCol: {
    flex: 1.15,
    width: '100%',
  },
  deviceFrame: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(11, 26, 23, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    overflow: 'hidden',
  },
  deviceChromeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F5F4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  chromeDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chromeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  deviceChromeTitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 109, 85, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  replayBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: '#0F6D55',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  sheetHeaderIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 109, 85, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHeaderTextWrap: {
    flex: 1,
  },
  sheetHeaderTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
  },
  sheetHeaderSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  sheetBody: {
    padding: 20,
  },
  inputStage: {
    gap: 14,
  },
  textareaWrap: {
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(11, 26, 23, 0.15)',
    borderRadius: radius.md,
    backgroundColor: '#FAFBFB',
    padding: 12,
  },
  sheetTextarea: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.ink,
    minHeight: 110,
    outlineWidth: 0,
  },
  typingCursor: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 2,
    height: 16,
    backgroundColor: '#0F6D55',
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  charCountText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#04CF92',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    ...(Platform.OS === 'web'
      ? {
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }
      : {}),
  },
  analyzeBtnHovered: {
    backgroundColor: '#04BD84',
    transform: [{ translateY: -1 }],
  },
  analyzeBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#0B1A17',
  },
  analyzingStateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(15, 109, 85, 0.06)',
    borderRadius: radius.pill,
    gap: 10,
  },
  analyzingText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#0F6D55',
  },
  previewStage: {
    gap: 16,
  },
  conversionBanner: {
    backgroundColor: 'rgba(15, 109, 85, 0.07)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(15, 109, 85, 0.2)',
    padding: 10,
  },
  conversionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  conversionTagLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  conversionTagValue: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#0F6D55',
  },
  fieldSection: {
    gap: 8,
  },
  fieldSectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  fieldRow: {
    gap: 4,
  },
  fieldRowTwoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  colHalf: {
    flex: 1,
    gap: 4,
  },
  fieldRowThreeCol: {
    flexDirection: 'row',
    gap: 8,
  },
  colThird: {
    flex: 1,
    gap: 4,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
  labelWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 109, 85, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  resolvedBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#0F6D55',
  },
  lowConfBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF6E9',
    borderWidth: 1,
    borderColor: 'rgba(212, 135, 10, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lowConfText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#D4870A',
  },
  fieldValueBox: {
    backgroundColor: '#F8FAF9',
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  fieldValueBoxEditable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEFDFB',
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 135, 10, 0.35)',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  fieldValueText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.ink,
  },
  fieldValueTextLow: {
    fontFamily: fonts.medium,
    color: '#8A5300',
  },
  fieldEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldEditInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0F6D55',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.ink,
    outlineWidth: 0,
  },
  fieldEditDone: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(15, 109, 85, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  amenityChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 109, 85, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(15, 109, 85, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  amenityChipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#0F6D55',
    textTransform: 'capitalize',
  },
  sheetActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12,
  },
  tryAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.15s ease' } : {}),
  },
  tryAgainBtnHovered: {
    borderColor: colors.ink,
  },
  tryAgainText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.muted,
  },
  applyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#04CF92',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.15s ease' } : {}),
  },
  applyBtnHovered: {
    backgroundColor: '#04BD84',
    transform: [{ translateY: -1 }],
  },
  applyBtnText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#0B1A17',
  },
  sheetDisclaimer: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
  },
});
