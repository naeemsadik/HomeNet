import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from '@/i18n';
import {
  View,
  Text,
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
} from '@/components/icons';
import { colors, fonts } from '../../theme';
import { useResponsive } from '../../hooks/useResponsive';
import { useAuthStore } from '../../stores/authStore';
import { useAuthModalStore } from '../../stores/useAuthModalStore';
import {
  landingCopy,
  AI_DEMO_SCRIPT,
  MARKET_POSITION_CLAIM,
} from '../../content/landingCopy';
import { styles } from "./AiFlagshipSection.styles";

type DemoState = 'idle' | 'typing' | 'analyzing' | 'preview';

export function AiFlagshipSection() {
  const { t } = useTranslation();
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

  const targetText = AI_DEMO_SCRIPT.inputText;

  const headlines = useMemo(
    () => [
      {
        num: t("landing.aiFlagship.headlines.h1.num"),
        tag: t("landing.aiFlagship.headlines.h1.tag"),
        title: t("landing.aiFlagship.headlines.h1.title"),
        desc: t("landing.aiFlagship.headlines.h1.desc"),
        examples: [
          t("landing.aiFlagship.headlines.h1.ex1"),
          t("landing.aiFlagship.headlines.h1.ex2"),
        ],
      },
      {
        num: t("landing.aiFlagship.headlines.h2.num"),
        tag: t("landing.aiFlagship.headlines.h2.tag"),
        title: t("landing.aiFlagship.headlines.h2.title"),
        desc: t("landing.aiFlagship.headlines.h2.desc"),
        examples: [
          t("landing.aiFlagship.headlines.h2.ex1"),
          t("landing.aiFlagship.headlines.h2.ex2"),
        ],
      },
      {
        num: t("landing.aiFlagship.headlines.h3.num"),
        tag: t("landing.aiFlagship.headlines.h3.tag"),
        title: t("landing.aiFlagship.headlines.h3.title"),
        desc: t("landing.aiFlagship.headlines.h3.desc"),
        examples: [
          t("landing.aiFlagship.headlines.h3.ex1"),
          t("landing.aiFlagship.headlines.h3.ex2"),
        ],
      },
    ],
    [t],
  );

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
            <Text style={styles.eyebrowText}>{t("landing.aiFlagship.eyebrow")}</Text>
          </View>

          <Text style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}>
            {t("landing.aiFlagship.title")}
          </Text>

          <Text style={[styles.sectionSubtitle, isPhone && styles.sectionSubtitlePhone]}>
            {t("landing.aiFlagship.subtitle")}
          </Text>
        </View>

        {/* Flagship Content Grid: 3 Headlines on Left, Interactive Sheet on Right */}
        <View style={[styles.flagshipGrid, isTablet && styles.flagshipGridTablet]}>
          {/* =========================================================================
              LEFT COLUMN: The 3 Core Truths (Ordered 1, 2, 3)
              ========================================================================= */}
          <View style={[styles.headlinesCol, isTablet && styles.headlinesColStacked]}>
            {headlines.map((headline, idx) => {
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
          <View style={[styles.demoCol, isTablet && styles.demoColStacked]}>
            {/* Device Frame */}
            <View style={styles.deviceFrame}>
              {/* Device Window Chrome */}
              <View style={styles.deviceChromeBar}>
                <View style={styles.chromeDotsRow}>
                  <View style={[styles.chromeDot, { backgroundColor: '#FF5F56' }]} />
                  <View style={[styles.chromeDot, { backgroundColor: '#FFBD2E' }]} />
                  <View style={[styles.chromeDot, { backgroundColor: '#27C93F' }]} />
                </View>
                <Text style={styles.deviceChromeTitle}>{t("landing.aiFlagship.chromeTitle")}</Text>
                {demoState === 'preview' && (
                  <Pressable
                    style={({ hovered }: any) => [
                      styles.replayBtn,
                      hovered && { opacity: 0.8 },
                    ]}
                    onPress={runSequence}
                    accessibilityLabel={t("landing.aiFlagship.replayDemo")}
                  >
                    <Play size={11} color="#0F6D55" style={{ marginRight: 4 }} />
                    <Text style={styles.replayBtnText}>{t("landing.aiFlagship.replayDemo")}</Text>
                  </Pressable>
                )}
              </View>

              {/* Sheet Header */}
              <View style={styles.sheetHeader}>
                <View style={styles.sheetHeaderIconWrap}>
                  <Sparkles size={18} color="#0F6D55" />
                </View>
                <View style={styles.sheetHeaderTextWrap}>
                  <Text style={styles.sheetHeaderTitle}>{t("landing.aiFlagship.sheetTitle")}</Text>
                  <Text style={styles.sheetHeaderSubtitle}>
                    {demoState === 'preview'
                      ? t("landing.aiFlagship.sheetSubtitlePreview")
                      : t("landing.aiFlagship.sheetSubtitleIdle")}
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
                        placeholder={t("landing.aiFlagship.demoInputPlaceholder")}
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
                        {t("landing.aiFlagship.charCount", {
                          count: (typedText || (demoState === 'idle' ? '' : targetText)).length,
                        })}
                      </Text>
                    </View>

                    {/* Action Button */}
                    {demoState === 'analyzing' ? (
                      <View style={styles.analyzingStateRow}>
                        <ActivityIndicator size="small" color="#04CF92" />
                        <Text style={styles.analyzingText}>{t("landing.aiFlagship.analyzingState")}</Text>
                      </View>
                    ) : (
                      <Pressable
                        style={({ hovered }: any) => [
                          styles.analyzeBtn,
                          hovered && styles.analyzeBtnHovered,
                        ]}
                        onPress={demoState === 'idle' ? runSequence : handleManualAnalyze}
                      >
                        <Sparkles size={15} color="#0B1A17" style={{ marginRight: 8 }} />
                        <Text style={styles.analyzeBtnText}>{t("landing.aiFlagship.analyzeBtn")}</Text>
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
                        <Text style={styles.conversionTagLabel}>{t("landing.aiFlagship.conversionBannerLabel")}</Text>
                        <Text style={styles.conversionTagValue}>
                          {t("landing.aiFlagship.conversionBannerValue")}
                        </Text>
                      </View>
                    </View>

                    {/* Section: Basics */}
                    <View style={styles.fieldSection}>
                      <Text style={styles.fieldSectionTitle}>{t("landing.aiFlagship.basics")}</Text>

                      {/* Title */}
                      <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>{t("landing.aiFlagship.titleLabel")}</Text>
                        <View style={styles.fieldValueBox}>
                          <Text style={styles.fieldValueText}>{parsedData.title}</Text>
                        </View>
                      </View>

                      {/* Category & Subtype */}
                      <View style={styles.fieldRowTwoCol}>
                        <View style={styles.colHalf}>
                          <Text style={styles.fieldLabel}>{t("landing.aiFlagship.category")}</Text>
                          <View style={styles.fieldValueBox}>
                            <Text style={styles.fieldValueText}>{parsedData.type}</Text>
                          </View>
                        </View>
                        <View style={styles.colHalf}>
                          <Text style={styles.fieldLabel}>{t("landing.aiFlagship.subtype")}</Text>
                          <View style={styles.fieldValueBox}>
                            <Text style={styles.fieldValueText}>{parsedData.subtype}</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Section: Details */}
                    <View style={styles.fieldSection}>
                      <Text style={styles.fieldSectionTitle}>{t("landing.aiFlagship.details")}</Text>

                      {/* Price in BDT */}
                      <View style={styles.fieldRow}>
                        <View style={styles.labelWithBadgeRow}>
                          <Text style={styles.fieldLabel}>{t("landing.aiFlagship.priceBdt")}</Text>
                          <View style={styles.resolvedBadge}>
                            <Check size={11} color="#0F6D55" style={{ marginRight: 3 }} />
                            <Text style={styles.resolvedBadgeText}>
                              {t("landing.aiFlagship.resolvedFrom", { raw: parsedData.priceRaw })}
                            </Text>
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
                          <Text style={styles.fieldLabel}>{t("landing.aiFlagship.area")}</Text>
                          <View style={styles.fieldValueBox}>
                            <Text style={styles.fieldValueText}>{parsedData.areaSize} {parsedData.areaUnit}</Text>
                          </View>
                        </View>
                        <View style={styles.colThird}>
                          <Text style={styles.fieldLabel}>{t("landing.aiFlagship.bedsBaths")}</Text>
                          <View style={styles.fieldValueBox}>
                            <Text style={styles.fieldValueText}>{parsedData.bedrooms}B / {parsedData.bathrooms}B</Text>
                          </View>
                        </View>
                        <View style={styles.colThird}>
                          <Text style={styles.fieldLabel}>{t("landing.aiFlagship.floor")}</Text>
                          <View style={styles.fieldValueBox}>
                            <Text style={styles.fieldValueText}>{parsedData.floor}th</Text>
                          </View>
                        </View>
                      </View>

                      {/* Facing with Low Confidence Badge (Faithful to AiListingSheet) */}
                      <View style={styles.fieldRow}>
                        <View style={styles.labelWithBadgeRow}>
                          <Text style={styles.fieldLabel}>{t("landing.aiFlagship.facing")}</Text>
                          <View style={styles.lowConfBadge}>
                            <AlertTriangle size={11} color="#D4870A" style={{ marginRight: 4 }} />
                            <Text style={styles.lowConfText}>{t("landing.aiFlagship.lowConfidenceNotice")}</Text>
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
                      <Text style={styles.fieldSectionTitle}>{t("landing.aiFlagship.location")}</Text>
                      <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>{t("landing.aiFlagship.address")}</Text>
                        <View style={styles.fieldValueBox}>
                          <Text style={styles.fieldValueText}>{parsedData.address}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Section: Amenities */}
                    <View style={styles.fieldSection}>
                      <Text style={styles.fieldSectionTitle}>{t("landing.aiFlagship.detectedAmenities")}</Text>
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
                        <Text style={styles.tryAgainText}>{t("landing.aiFlagship.tryAgainBtn")}</Text>
                      </Pressable>

                      <Pressable
                        style={({ hovered }: any) => [
                          styles.applyBtn,
                          hovered && styles.applyBtnHovered,
                        ]}
                        onPress={handleApply}
                      >
                        <Text style={styles.applyBtnText}>{t("landing.aiFlagship.applyBtn")}</Text>
                        <ArrowRight size={15} color="#0B1A17" style={{ marginLeft: 6 }} />
                      </Pressable>
                    </View>

                    {/* Sheet Disclaimer */}
                    <Text style={styles.sheetDisclaimer}>{t("landing.aiFlagship.disclaimer")}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
