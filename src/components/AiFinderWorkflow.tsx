import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Home,
  KeyRound,
  MapPin,
  RotateCcw,
  Sparkles,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type DimensionValue,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGrid } from "@/components/PropertyGrid";
import { AppButton, Eyebrow } from "@/components/ui";
import { getProperties } from "@/services/propertyApi";
import { useResponsive } from "@/hooks/useResponsive";
import { useSavedStore } from "@/stores/savedStore";
import { colors, fonts, shadow, webPointer } from "@/theme";

const steps = ["Goal", "Location", "Budget", "Matches"];

const budgetRanges: Record<string, { min_price?: number; max_price?: number }> = {
  "Under BDT 70k": { max_price: 70000 },
  "BDT 70k–120k": { min_price: 70000, max_price: 120000 },
  "BDT 120k–180k": { min_price: 120000, max_price: 180000 },
  "BDT 180k+": { min_price: 180000 },
  "Under BDT 2 Cr": { max_price: 20000000 },
  "BDT 2–4 Cr": { min_price: 20000000, max_price: 40000000 },
  "BDT 4–6 Cr": { min_price: 40000000, max_price: 60000000 },
  "BDT 6 Cr+": { min_price: 60000000 },
};

function Choice({
  label,
  copy,
  icon: Icon,
  selected,
  onPress,
  compact,
  width,
}: {
  label: string;
  copy: string;
  icon?: LucideIcon;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
  width: DimensionValue;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choice,
        compact && styles.choiceCompact,
        selected && styles.choiceSelected,
        { width },
        webPointer,
      ]}
    >
      {Icon ? (
        <View style={[styles.choiceIcon, selected && styles.choiceIconSelected]}>
          <Icon color={selected ? colors.white : colors.green} size={20} />
        </View>
      ) : null}
      <Text style={styles.choiceTitle}>{label}</Text>
      <Text style={styles.choiceCopy}>{copy}</Text>
      <View style={[styles.choiceCheck, selected && styles.choiceCheckSelected]}>
        {selected ? <Check color={colors.white} size={12} /> : null}
      </View>
    </Pressable>
  );
}

export interface AiFinderWorkflowProps {
  isModal?: boolean;
  onClose?: () => void;
}

export function AiFinderWorkflow({ isModal = false, onClose }: AiFinderWorkflowProps) {
  const { isPhone, isTablet } = useResponsive();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("Buy a home");
  const [area, setArea] = useState("Gulshan & Banani");
  const [budget, setBudget] = useState("BDT 2–4 Cr");

  const { savedIds, toggleSaved } = useSavedStore();

  const queryParams = useMemo(() => {
    const range = budgetRanges[budget] || {};
    return {
      listing_type: goal === "Rent a home" ? ("rent" as const) : ("sale" as const),
      limit: 6,
      status: "active" as const,
      ...range,
    };
  }, [goal, budget]);

  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ["properties", "ai-finder", goal, budget],
    queryFn: () => getProperties(queryParams),
    enabled: step === 3,
    staleTime: 5 * 60 * 1000,
  });

  const matches = useMemo(() => matchesData?.data?.items ?? [], [matchesData]);

  const choiceWidth: DimensionValue = isPhone
    ? "100%"
    : isTablet
    ? "48.5%"
    : isModal
    ? step === 0
      ? "48.5%"
      : "31.5%"
    : step === 0
    ? "48.5%"
    : "23.8%";

  return (
    <View style={[styles.container, isModal && styles.containerModal]}>
      {/* Modal / Screen Header */}
      <View style={[styles.headerRow, isModal && styles.headerRowModal]}>
        <View style={styles.headerLeft}>
          <View style={styles.aiPillBadge}>
            <Sparkles color="#04cf92" size={14} />
            <Text style={styles.aiPillText}>AI Property Matchmaker</Text>
          </View>
          <Text style={[styles.title, isPhone && styles.titlePhone]}>
            Tell us what home feels right.
          </Text>
          <Text style={styles.subtitle}>
            HomeNet ranks verified listings around your priorities and flags negotiated market opportunities.
          </Text>
        </View>
      </View>

      {/* ─── AI Market Insight Banner (From Image 1) ─── */}
      <LinearGradient
        colors={["#EEFAF5", "#E8F5F1"]}
        end={{ x: 1, y: 0 }}
        start={{ x: 0, y: 0 }}
        style={styles.aiInsightBanner}
      >
        <View style={styles.aiInsightIcon}>
          <Sparkles color={colors.white} size={18} />
        </View>
        <View style={styles.aiInsightCopyWrap}>
          <Text style={styles.aiInsightTitle}>What this means for your search</Text>
          <Text style={styles.aiInsightCopy}>
            Prices are rising steadily, but verified listings in Uttara and Dhanmondi still show room to negotiate. HomeNet flags those opportunities in your results.
          </Text>
        </View>
      </LinearGradient>

      {/* ─── Main Finder Shell ─── */}
      <View style={[styles.finderShell, isModal && styles.finderShellModal]}>
        {/* Progress Bar */}
        <View style={styles.progress}>
          {steps.map((label, index) => {
            const isCompleted = index < step;
            const isCurrent = index === step;
            const isActive = isCompleted || isCurrent;
            const isLineActive = index < step;

            return (
              <React.Fragment key={label}>
                {/* Step Item (Circle + Label) */}
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.progressCircle,
                      isActive && styles.progressCircleActive,
                    ]}
                  >
                    {isCompleted ? (
                      <Check color={colors.white} size={13} strokeWidth={2.6} />
                    ) : (
                      <Text
                        style={[
                          styles.progressNumber,
                          isActive && styles.progressNumberActive,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  {!isPhone && (
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.progressLabel,
                        isActive && styles.progressLabelActive,
                      ]}
                    >
                      {label}
                    </Text>
                  )}
                </View>

                {/* Connecting Line between steps (strictly between items, never overlapping text!) */}
                {index < steps.length - 1 && (
                  <View style={styles.stepConnector}>
                    <View
                      style={[
                        styles.stepConnectorLine,
                        isLineActive && styles.stepConnectorLineActive,
                      ]}
                    />
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* Step Questions */}
        {step < 3 ? (
          <ScrollView
            contentContainerStyle={[styles.question, isPhone && styles.questionPhone]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.questionTitle}>
              {step === 0 ? (
                <Home color={colors.green} size={20} />
              ) : step === 1 ? (
                <MapPin color={colors.green} size={20} />
              ) : (
                <WalletCards color={colors.green} size={20} />
              )}
              <View>
                <Text style={styles.questionKicker}>
                  {step === 0
                    ? "Step 1: The big decision"
                    : step === 1
                    ? "Step 2: Your preferred location"
                    : "Step 3: A comfortable budget"}
                </Text>
                <Text style={styles.questionHeading}>
                  {step === 0
                    ? "What are you looking to do?"
                    : step === 1
                    ? "Where would you like to live?"
                    : "What budget should we work within?"}
                </Text>
              </View>
            </View>

            <View style={styles.choiceGrid}>
              {step === 0 ? (
                <>
                  <Choice
                    copy="Build equity in a place of your own with verified valuation"
                    icon={Home}
                    label="Buy a home"
                    onPress={() => setGoal("Buy a home")}
                    selected={goal === "Buy a home"}
                    width={choiceWidth}
                  />
                  <Choice
                    copy="Stay flexible with a verified rental in top neighborhoods"
                    icon={KeyRound}
                    label="Rent a home"
                    onPress={() => setGoal("Rent a home")}
                    selected={goal === "Rent a home"}
                    width={choiceWidth}
                  />
                </>
              ) : step === 1 ? (
                [
                  ["Gulshan & Banani", "Central, connected, established diplomatic hub"],
                  ["Baridhara", "Quiet tree-lined streets and premium security"],
                  ["Dhanmondi", "Lakeside culture, schools, and central city access"],
                  ["Uttara", "Planned sectors, metro access, and open residential space"],
                  ["Bashundhara", "Fast-growing community with modern complexes"],
                  ["Mirpur", "Connected, budget-friendly and rapidly developing"],
                ].map(([lbl, cpy]) => (
                  <Choice
                    copy={cpy}
                    icon={Building2}
                    key={lbl}
                    label={lbl}
                    onPress={() => setArea(lbl)}
                    selected={area === lbl}
                    width={choiceWidth}
                  />
                ))
              ) : (
                (goal === "Rent a home"
                  ? ["Under BDT 70k", "BDT 70k–120k", "BDT 120k–180k", "BDT 180k+"]
                  : ["Under BDT 2 Cr", "BDT 2–4 Cr", "BDT 4–6 Cr", "BDT 6 Cr+"]
                ).map((lbl) => (
                  <Choice
                    compact
                    copy="Show homes tailored in this range"
                    key={lbl}
                    label={lbl}
                    onPress={() => setBudget(lbl)}
                    selected={budget === lbl}
                    width={choiceWidth}
                  />
                ))
              )}
            </View>
          </ScrollView>
        ) : (
          /* Step 3: Matches */
          <ScrollView
            contentContainerStyle={[styles.results, isPhone && styles.resultsPhone]}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.resultSummary, isPhone && styles.resultSummaryPhone]}>
              <View style={styles.resultIcon}>
                <Sparkles color={colors.white} size={22} />
              </View>
              <View style={styles.resultCopyWrap}>
                <Eyebrow style={styles.resultEyebrow}>Your strongest matches</Eyebrow>
                <Text style={styles.resultTitle}>Homes aligned with your priorities</Text>
                <Text style={styles.resultCopy}>
                  {goal} around {area}, within {budget}. Ranked by AI value score, verification, and livability.
                </Text>
              </View>
              <AppButton
                icon={RotateCcw}
                label="Start over"
                onPress={() => setStep(0)}
                variant="ghost"
              />
            </View>

            {matchesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.green} size="large" />
                <Text style={styles.loadingText}>
                  HomeNet AI is analyzing and scoring matches...
                </Text>
              </View>
            ) : matches.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No matching listings found</Text>
                <Text style={styles.emptyText}>
                  Try selecting a different budget range or browse all available properties.
                </Text>
                <AppButton
                  label="Try another budget"
                  onPress={() => setStep(2)}
                  style={{ marginTop: 16 }}
                />
              </View>
            ) : (
              <View style={styles.gridWrap}>
                <PropertyGrid>
                  {matches.map((property) => (
                    <PropertyCard
                      key={property.id}
                      mode={goal === "Rent a home" ? "rent" : "buy"}
                      onPress={() => {
                        if (isModal && onClose) onClose();
                        router.push(`/property/${property.id}` as Href);
                      }}
                      onSave={() => toggleSaved(property.id)}
                      property={property}
                      saved={savedIds.includes(property.id)}
                    />
                  ))}
                </PropertyGrid>

                <View style={styles.exploreMoreRow}>
                  <AppButton
                    label={`View all ${goal === "Rent a home" ? "rental" : "sale"} properties`}
                    onPress={() => {
                      if (isModal && onClose) onClose();
                      router.push(goal === "Rent a home" ? "/rent" : "/buy");
                    }}
                    trailingIcon={ArrowRight}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Action Controls (Step 0 to 2) */}
        {step < 3 ? (
          <View style={[styles.actions, isPhone && styles.actionsPhone]}>
            <AppButton
              disabled={step === 0}
              icon={ArrowLeft}
              label="Back"
              onPress={() => setStep((current) => Math.max(0, current - 1))}
              variant="secondary"
            />
            <AppButton
              label={step === 2 ? "Build my matches" : "Continue"}
              onPress={() => setStep((current) => Math.min(3, current + 1))}
              trailingIcon={ArrowRight}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
  },
  containerModal: {
    maxWidth: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerRowModal: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  aiPillBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#E6FAF4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  aiPillText: {
    color: "#04cf92",
    fontFamily: fonts.bold,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.extraBold,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  titlePhone: {
    fontSize: 22,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F4F2",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ─── AI Insight Banner (Image 1 replica) ─── */
  aiInsightBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#CCEADA",
    marginHorizontal: 4,
  },
  aiInsightIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  aiInsightCopyWrap: {
    flex: 1,
  },
  aiInsightTitle: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: "700",
  },
  aiInsightCopy: {
    color: "#475569",
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 2,
  },

  /* ─── Main Shell ─── */
  finderShell: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    ...shadow,
  },
  finderShellModal: {
    borderRadius: 16,
    borderWidth: 0.8,
  },
  progress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: "#F7FAF8",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  stepConnector: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    justifyContent: "center",
  },
  stepConnectorLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#DFEAE4",
    borderRadius: 999,
  },
  stepConnectorLineActive: {
    backgroundColor: colors.green,
  },
  progressCircle: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: "#D8E2DD",
  },
  progressCircleActive: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  progressNumber: {
    color: "#98A59F",
    fontFamily: fonts.extraBold,
    fontSize: 11,
  },
  progressNumberActive: {
    color: colors.white,
  },
  progressLabel: {
    color: "#98A59F",
    fontFamily: fonts.extraBold,
    fontSize: 12,
  },
  progressLabelActive: {
    color: colors.greenDark,
  },

  question: {
    paddingHorizontal: 24,
    paddingVertical: 22,
    maxHeight: 460,
  },
  questionPhone: {
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  questionTitle: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 18,
  },
  questionKicker: {
    color: colors.green,
    fontFamily: fonts.extraBold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  questionHeading: {
    marginTop: 3,
    color: colors.ink,
    fontFamily: fonts.extraBold,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  choiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  choice: {
    position: "relative",
    minHeight: 115,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1.2,
    borderColor: colors.line,
  },
  choiceSelected: {
    borderColor: colors.green,
    backgroundColor: "#F3FAF7",
  },
  choiceCompact: {
    minHeight: 80,
    justifyContent: "center",
  },
  choiceIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: colors.greenLight,
  },
  choiceIconSelected: {
    backgroundColor: colors.green,
  },
  choiceTitle: {
    color: colors.ink,
    fontFamily: fonts.extraBold,
    fontSize: 13.5,
  },
  choiceCopy: {
    marginTop: 4,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 15,
  },
  choiceCheck: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#D4DFD9",
  },
  choiceCheckSelected: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: "#FBFDFC",
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  actionsPhone: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  results: {
    padding: 20,
    maxHeight: 520,
  },
  resultsPhone: {
    padding: 14,
  },
  resultSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F2F8F5",
  },
  resultSummaryPhone: {
    flexWrap: "wrap",
  },
  resultIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.green,
  },
  resultCopyWrap: {
    minWidth: 0,
    flex: 1,
  },
  resultEyebrow: {
    marginBottom: 2,
  },
  resultTitle: {
    color: colors.ink,
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  resultCopy: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 17,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  emptyContainer: {
    padding: 28,
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  emptyText: {
    marginTop: 6,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: "center",
  },
  gridWrap: {
    gap: 16,
  },
  exploreMoreRow: {
    alignItems: "center",
    marginTop: 12,
    paddingBottom: 8,
  },
});
