import { useMemo, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { AppChrome } from "@/components/AppChrome";
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Check,
  CircleHelp,
  Edit,
  Flag,
  Footprints,
  Heart,
  MapPin,
  Share2,
  X,
} from "@/components/icons";
import { NoTranslateText } from "@/components/NoTranslateText";
import { PageMeta } from "@/components/PageMeta";
import { AppButton } from "@/components/ui";
import { PropertyLightbox } from "@/features/property/components/PropertyLightbox";
import { ReportListingModal, type ReportReasonKey } from "@/features/property/components/ReportListingModal";
import { useResponsive } from "@/hooks/useResponsive";
import { formatLocalizedNumber, useTranslation, type TranslationKey } from "@/i18n";
import { cdnImage } from "@/lib/cloudinaryImage";
import { SITE_URL } from "@/lib/seo";
import { shareLink } from "@/lib/share";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { useSavedStore } from "@/stores/savedStore";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { AllInCostTag } from "../components/AllInCostTag";
import { ContactChannelBar } from "../components/ContactChannelBar";
import { HouseRulesBadges } from "../components/HouseRulesBadges";
import { CampusDistanceChip, CostsDeclaredBadge, FreshnessStamp, GenderBadge, VerifiedBadge } from "../components/ListingFacts";
import { SeatAvailabilityList } from "../components/SeatAvailabilityList";
import { UtilityBreakdownTable } from "../components/UtilityBreakdown";
import { MEDIA_LABELS } from "../constants/vocabulary";
import { useReportMess } from "../hooks/useMessMutations";
import { useMessDetail } from "../hooks/useMessQueries";
import { campusLabel, findCampus, useUniversities } from "../hooks/useUniversities";
import { useMessFilterStore } from "../stores/messFilterStore";
import type { MediaLabel, MessDetail, ReportReason } from "../types/mess";
import { cheapestAllIn } from "../utils/allInCost";
import { formatDate, formatDistance, formatTakaRange } from "../utils/format";
import { formatClock } from "../utils/time";

const REPORT_REASONS: Record<ReportReasonKey, ReportReason> = {
  fakeListing: "fake_listing",
  brokerSpam: "broker_spam",
  incorrectPrice: "wrong_price",
  inappropriate: "inappropriate",
  other: "other",
};

/** One mess listing, information in the order students decide (PRD D7). */
export function MessDetailScreen({ id }: { id: string | undefined }) {
  const { t } = useTranslation();
  const query = useMessDetail(id);

  if (query.data) return <MessDetailView detail={query.data} />;

  const notFound = query.isError && (query.error as { status?: number | null }).status === 404;
  return (
    <AppChrome active="mess">
      <PageMeta title={t("mess.meta.browseTitle")} noindex />
      <View style={styles.state}>
        {query.isError ? (
          <>
            <AlertCircle size={36} color={colorTokens.subtle} />
            <Text style={styles.stateTitle}>{notFound ? t("mess.detail.notFound") : t("mess.detail.loadFailed")}</Text>
            <View style={styles.stateActions}>
              {!notFound ? <AppButton label={t("mess.browse.retry")} onPress={() => void query.refetch()} variant="secondary" /> : null}
              <AppButton label={t("mess.detail.browse")} onPress={() => router.replace("/mess" as never)} />
            </View>
          </>
        ) : (
          <ActivityIndicator size="large" color={colorTokens.brand} />
        )}
      </View>
    </AppChrome>
  );
}

function MessDetailView({ detail }: { detail: MessDetail }) {
  const { t, language } = useTranslation();
  const { isPhone, isTablet } = useResponsive();
  const user = useAuthStore((s) => s.user);
  const campusId = useMessFilterStore((s) => s.campusId);
  const universities = useUniversities();
  const isSaved = useSavedStore((s) => s.savedIds.includes(detail.id));
  const toggleSaved = useSavedStore((s) => s.toggleSaved);
  const report = useReportMess();
  const [reportOpen, setReportOpen] = useState(false);
  const [photoTab, setPhotoTab] = useState<MediaLabel | "all">("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const thumbScrollRef = useRef<ScrollView | null>(null);

  const { mess } = detail;
  const isOwner = Boolean(user && detail.lister?.id === user.id);
  const wide = !isTablet;
  const choice = findCampus(universities.data, campusId);
  const campusName = choice ? campusLabel(choice) : null;
  const headerWalk = detail.distances.find((row) => row.campus_id === campusId) ?? detail.distances[0] ?? null;

  const cheapest = cheapestAllIn(detail.seats, detail.charges);
  const lowestRent = cheapest?.rent ?? (detail.seats.length ? Math.min(...detail.seats.map((seat) => seat.rent)) : 0);

  const media = useMemo(() => [...detail.media].sort((a, b) => a.display_order - b.display_order), [detail.media]);
  const cover = media.find((item) => item.label === "room") ?? media[0];
  const labelsPresent = MEDIA_LABELS.filter((label) => media.some((item) => item.label === label));
  const shownMedia = photoTab === "all" ? media : media.filter((item) => item.label === photoTab);
  const lightboxImages = shownMedia.map((item) => item.url);

  const askAbout: TranslationKey[] = [
    !mess.gate_open_time && !mess.gate_close_time ? "mess.detail.askGate" : null,
    !mess.quiet_hours_start ? "mess.detail.askQuiet" : null,
    mess.security_deposit == null ? "mess.detail.askDeposit" : null,
    mess.notice_period_days == null ? "mess.detail.askNotice" : null,
    !mess.rent_last_revised_at ? "mess.detail.askRentRevised" : null,
  ].filter((key): key is TranslationKey => key !== null);

  const n = (value: number) => formatLocalizedNumber(value, language);
  const priceText = cheapest ? formatTakaRange(cheapest.min, cheapest.max, language, t) : "";

  const openReport = () => {
    if (user) setReportOpen(true);
    else useAuthModalStore.getState().open(() => setReportOpen(true));
  };

  const contact =
    !isOwner && detail.status === "active" && mess.available_seats > 0 ? (
      <ContactChannelBar
        listing={{ id: detail.id, title: detail.title }}
        channels={mess.contact_channels}
        verifiedOnly={mess.verified_seekers_only}
        campusName={campusName}
        variant={wide ? "card" : "floating"}
      />
    ) : null;

  return (
    <AppChrome active="mess" floating={!wide && contact ? contact : undefined}>
      <PageMeta
        title={t("mess.meta.detailTitle", { title: detail.title })}
        description={priceText ? t("mess.meta.detailDescription", { title: detail.title, price: priceText }) : undefined}
        image={cover ? cdnImage(cover.url, 1200) : undefined}
        canonicalPath={`/mess/${detail.id}`}
        noindex={detail.status !== "active" ? true : undefined}
      />

      <View style={[styles.page, !wide && contact ? styles.pageWithFloating : null]}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("mess.detail.back")}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/mess" as never))}
            style={[styles.iconButton, webPointer]}
          >
            <ArrowLeft size={20} color={colorTokens.ink} />
          </Pressable>
          <View style={styles.topActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("mess.detail.share")}
              onPress={() => void shareLink({ title: detail.title, url: `${SITE_URL}/mess/${detail.id}` })}
              style={[styles.iconButton, webPointer]}
            >
              <Share2 size={18} color={colorTokens.ink} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isSaved ? t("mess.card.unsave") : t("mess.card.save")}
              accessibilityState={{ selected: isSaved }}
              onPress={() => void toggleSaved(detail.id)}
              style={[styles.iconButton, webPointer]}
            >
              <Heart size={18} color={isSaved ? colorTokens.saved : colorTokens.ink} fill={isSaved ? colorTokens.saved : "transparent"} />
            </Pressable>
          </View>
        </View>

        {isOwner && detail.status === "draft" ? <Banner text={t("mess.detail.draftBanner")} /> : null}
        {isOwner && detail.status === "pending" ? <Banner text={t("mess.detail.pendingBanner")} /> : null}
        {mess.available_seats === 0 ? <Banner text={t("mess.detail.filledBanner")} tone="warning" /> : null}
        {isOwner ? (
          <AppButton
            label={t("mess.detail.edit")}
            icon={Edit}
            onPress={() => router.push(`/mess/edit?id=${encodeURIComponent(detail.id)}` as never)}
            variant="secondary"
            style={styles.editButton}
          />
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("mess.detail.photoCount", { count: media.length })}
          disabled={media.length === 0}
          onPress={() => {
            setPhotoTab("all");
            setLightboxIndex(Math.max(0, media.indexOf(cover!)));
          }}
          style={[styles.hero, isPhone && styles.heroPhone]}
        >
          {cover ? (
            <Image source={{ uri: cdnImage(cover.url, 1400) }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityIgnoresInvertColors />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Building size={44} color={colorTokens.subtle} />
            </View>
          )}
          <GenderBadge gender={mess.gender_policy} style={styles.heroBadge} />
          {media.length > 1 ? (
            <View style={styles.photoCount}>
              <Text style={styles.photoCountText}>{t("mess.detail.photoCount", { count: n(media.length) })}</Text>
            </View>
          ) : null}
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.kicker}>{[t(`mess.subtype.${detail.subtype}`), detail.area?.name].filter(Boolean).join(" · ")}</Text>
          <Text accessibilityRole="header" aria-level={1} style={[styles.h1, isPhone && styles.h1Phone]}>
            {detail.title}
          </Text>
          <View style={styles.trustRow}>
            <CampusDistanceChip walk={headerWalk ? { campus_short: headerWalk.university_short, walking_min: headerWalk.walking_min, walking_m: headerWalk.walking_m, approximate: headerWalk.approximate } : null} />
            {detail.is_verified ? <VerifiedBadge /> : null}
            {mess.costs_complete ? <CostsDeclaredBadge /> : null}
          </View>
          <FreshnessStamp confirmedAt={mess.last_confirmed_at} />
        </View>

        <View style={[styles.columns, wide && styles.columnsWide]}>
          <View style={styles.main}>
            <Section title={t("mess.detail.costTitle")}>
              <AllInCostTag min={cheapest?.min ?? 0} max={cheapest?.max ?? 0} rent={lowestRent} size="lg" />
              <Text style={styles.muted}>{t("mess.detail.costIntro")}</Text>
              <UtilityBreakdownTable rent={lowestRent} charges={detail.charges} deposit={mess.security_deposit} advanceMonths={mess.advance_months} />
            </Section>

            <Section title={t("mess.detail.locationTitle")}>
              {detail.address ? (
                <Fact icon={<MapPin size={16} color={colorTokens.muted} />} text={detail.address} />
              ) : null}
              <Text style={styles.subTitle}>{t("mess.detail.walkTimes")}</Text>
              {detail.distances.length ? (
                <View style={styles.walkList}>
                  {detail.distances.map((row) => (
                    <View key={row.campus_id} style={[styles.walkRow, row.campus_id === campusId && styles.walkRowMine]}>
                      <Footprints size={16} color={colorTokens.brandText} />
                      <Text style={styles.walkCampus}>
                        {row.university_short} <Text style={styles.muted}>· {row.campus_name}</Text>
                      </Text>
                      <NoTranslateText style={styles.walkTime}>
                        {row.approximate
                          ? t("mess.detail.walkRowApprox", { distance: formatDistance(row.walking_m, language, t) })
                          : t("mess.detail.walkRow", { minutes: n(row.walking_min), distance: formatDistance(row.walking_m, language, t) })}
                      </NoTranslateText>
                    </View>
                  ))}
                  {detail.distances.some((row) => row.approximate) ? <Text style={styles.small}>{t("mess.walk.approxNote")}</Text> : null}
                </View>
              ) : (
                <Text style={styles.muted}>{t("mess.detail.noDistances")}</Text>
              )}
              <View style={styles.factGrid}>
                <Fact yes text={mess.floor_level === 0 ? t("mess.detail.groundFloor") : t("mess.detail.floor", { level: n(mess.floor_level) })} />
                <Fact yes={mess.has_lift} text={mess.has_lift ? t("mess.detail.lift") : t("mess.detail.noLift")} />
                <Fact yes={mess.has_security_guard} text={t("mess.detail.guard")} />
                <Fact yes={mess.has_cctv} text={t("mess.detail.cctv")} />
                <Fact yes={mess.has_generator} text={t("mess.detail.generator")} />
              </View>
              {mess.gate_open_time || mess.gate_close_time ? (
                <Text style={styles.body}>
                  {mess.gate_open_time && mess.gate_close_time
                    ? t("mess.detail.gateTimes", { open: formatClock(mess.gate_open_time, language), close: formatClock(mess.gate_close_time, language) })
                    : mess.gate_open_time
                      ? t("mess.rules.gateOpens", { time: formatClock(mess.gate_open_time, language) })
                      : t("mess.rules.gateCloses", { time: formatClock(mess.gate_close_time!, language) })}
                </Text>
              ) : null}
            </Section>

            <Section title={t("mess.detail.roomTitle")}>
              <View style={styles.factGrid}>
                <Fact
                  yes
                  text={
                    mess.current_residents === 0
                      ? t("mess.occupancy.livingNone")
                      : mess.current_residents === 1
                        ? t("mess.occupancy.livingOne")
                        : t("mess.occupancy.living", { count: n(mess.current_residents) })
                  }
                />
                <Fact yes text={t("mess.detail.totalSeats", { count: n(mess.total_seats), rooms: n(mess.total_rooms) })} />
                <Fact yes text={mess.washroom_count === 1 ? t("mess.detail.washroomsOne") : t("mess.detail.washrooms", { count: n(mess.washroom_count) })} />
                {mess.washroom_count > 0 ? (
                  <Fact yes text={t("mess.occupancy.perWashroom", { count: n(Math.ceil(mess.total_seats / mess.washroom_count)) })} />
                ) : null}
                <Fact yes text={`${t("mess.detail.whoCanStay")}: ${t(`mess.tenant.${mess.tenant_type}`)}`} />
              </View>
              <Text style={styles.subTitle}>{t("mess.detail.seats")}</Text>
              <SeatAvailabilityList seats={detail.seats} charges={detail.charges} />
            </Section>

            <Section title={t("mess.detail.rulesTitle")}>
              <HouseRulesBadges rules={detail.rules} size="md" />
              {mess.quiet_hours_start && mess.quiet_hours_end ? (
                <Text style={styles.body}>
                  {t("mess.detail.quietHours", { start: formatClock(mess.quiet_hours_start, language), end: formatClock(mess.quiet_hours_end, language) })}
                </Text>
              ) : null}
              {mess.maid_service ? <Fact yes text={t("mess.detail.maid")} /> : null}
              {mess.vibe_tags.length ? (
                <View style={styles.vibe}>
                  <Text style={styles.subTitle}>{t("mess.detail.vibe")}</Text>
                  <View style={styles.vibeTags}>
                    {mess.vibe_tags.map((tag) => (
                      <View key={tag} style={styles.vibeTag}>
                        <Text style={styles.vibeText}>{t(`mess.vibe.${tag}`)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </Section>

            {detail.description ? (
              <Section title={t("mess.detail.about")}>
                <Text style={styles.body}>{detail.description}</Text>
              </Section>
            ) : null}

            <Section title={t("mess.detail.photosTitle")}>
              {media.length ? (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                    {(["all", ...labelsPresent] as const).map((tab) => {
                      const selected = photoTab === tab;
                      return (
                        <Pressable
                          key={tab}
                          accessibilityRole="tab"
                          accessibilityState={{ selected }}
                          onPress={() => setPhotoTab(tab)}
                          style={[styles.tab, selected && styles.tabSelected, webPointer]}
                        >
                          <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
                            {tab === "all" ? t("mess.detail.allPhotos") : t(`mess.mediaLabel.${tab}`)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                  <View style={styles.thumbs}>
                    {shownMedia.map((item, index) => (
                      <Pressable
                        key={item.id}
                        accessibilityRole="button"
                        accessibilityLabel={item.label ? t(`mess.mediaLabel.${item.label}`) : t("mess.detail.photosTitle")}
                        onPress={() => setLightboxIndex(index)}
                        style={[styles.thumb, isPhone && styles.thumbPhone, webPointer]}
                      >
                        <Image source={{ uri: cdnImage(item.url, 480) }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityIgnoresInvertColors />
                        {item.label ? (
                          <View style={styles.thumbLabel}>
                            <Text style={styles.thumbLabelText}>{t(`mess.mediaLabel.${item.label}`)}</Text>
                          </View>
                        ) : null}
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={styles.muted}>{t("mess.detail.noPhotos")}</Text>
              )}
            </Section>

            <Section title={t("mess.detail.governanceTitle")}>
              <KeyValue label={t("mess.detail.managedBy")} value={t(`mess.managedBy.${mess.managed_by}`)} />
              <KeyValue label={t("mess.detail.rentRevised")} value={mess.rent_last_revised_at ? formatDate(mess.rent_last_revised_at, language) : t("mess.detail.notSaid")} />
              <KeyValue
                label={t("mess.detail.noticePeriod")}
                value={mess.notice_period_days != null ? t("mess.detail.noticeDays", { count: n(mess.notice_period_days) }) : t("mess.detail.notSaid")}
              />
            </Section>

            {askAbout.length ? (
              <View style={styles.askBox}>
                <View style={styles.askHead}>
                  <CircleHelp size={18} color={colorTokens.brandText} />
                  <Text style={styles.askTitle} accessibilityRole="header" aria-level={2}>
                    {t("mess.detail.beforeYouCall")}
                  </Text>
                </View>
                {askAbout.map((key) => (
                  <Text key={key} style={styles.askItem}>
                    • {t(key)}
                  </Text>
                ))}
              </View>
            ) : null}

            <Pressable accessibilityRole="button" onPress={openReport} style={[styles.report, webPointer]}>
              <Flag size={15} color={colorTokens.muted} />
              <Text style={styles.reportText}>{t("mess.detail.report")}</Text>
            </Pressable>
          </View>

          {wide && contact ? <View style={styles.side}>{contact}</View> : null}
        </View>
      </View>

      <ReportListingModal
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        propertyId={detail.id}
        propertyTitle={detail.title}
        onSubmit={(reason) => report.mutateAsync({ id: detail.id, reason: REPORT_REASONS[reason] })}
        failedMessage={t("mess.report.failed")}
      />
      <PropertyLightbox
        visible={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        title={detail.title}
        images={lightboxImages}
        activeIndex={lightboxIndex ?? 0}
        onSelect={setLightboxIndex}
        onPrev={() => setLightboxIndex((index) => ((index ?? 0) - 1 + lightboxImages.length) % lightboxImages.length)}
        onNext={() => setLightboxIndex((index) => ((index ?? 0) + 1) % lightboxImages.length)}
        thumbScrollRef={thumbScrollRef}
      />
    </AppChrome>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" aria-level={2} style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Fact({ text, yes, icon }: { text: string; yes?: boolean; icon?: ReactNode }) {
  return (
    <View style={styles.fact}>
      {icon ?? (yes ? <Check size={16} color={colorTokens.success} strokeWidth={2.5} /> : <X size={16} color={colorTokens.subtle} strokeWidth={2.5} />)}
      <Text style={[styles.factText, yes === false && styles.factTextNo]}>{text}</Text>
    </View>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.keyValue}>
      <Text style={styles.keyLabel}>{label}</Text>
      <Text style={styles.keyValueText}>{value}</Text>
    </View>
  );
}

function Banner({ text, tone = "info" }: { text: string; tone?: "info" | "warning" }) {
  return (
    <View style={[styles.banner, tone === "warning" && styles.bannerWarning]}>
      <AlertCircle size={16} color={tone === "warning" ? colorTokens.warningText : colorTokens.brandText} />
      <Text style={[styles.bannerText, tone === "warning" && styles.bannerTextWarning]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: "100%", paddingTop: 12, paddingBottom: 40, gap: 16 },
  pageWithFloating: { paddingBottom: 140 },
  state: { alignItems: "center", justifyContent: "center", gap: 14, paddingVertical: 80, paddingHorizontal: 16 },
  stateTitle: { fontFamily: fonts.headingBold, fontSize: 18, color: colorTokens.ink, textAlign: "center" },
  stateActions: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topActions: { flexDirection: "row", gap: 8 },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
  },
  editButton: { alignSelf: "flex-start" },
  hero: { width: "100%", aspectRatio: 16 / 7, maxHeight: 440, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colorTokens.surfaceSunken },
  heroPhone: { aspectRatio: 4 / 3 },
  heroPlaceholder: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  heroBadge: { position: "absolute", top: 12, left: 12 },
  photoCount: {
    position: "absolute",
    right: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: "rgba(11, 26, 23, 0.72)",
  },
  photoCountText: { fontFamily: fonts.semiBold, fontSize: 12, color: colorTokens.surface },
  header: { gap: 8 },
  kicker: { fontFamily: fonts.medium, fontSize: 13, color: colorTokens.muted },
  h1: { fontFamily: fonts.headingExtraBold, fontSize: 28, lineHeight: 36, letterSpacing: -0.4, color: colorTokens.ink },
  h1Phone: { fontSize: 22, lineHeight: 29 },
  trustRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  columns: { gap: 24 },
  columnsWide: { flexDirection: "row", alignItems: "flex-start" },
  main: { flex: 1, minWidth: 0, gap: 28 },
  side: { width: 340, position: "sticky", top: 96 } as unknown as ViewStyle,
  section: { gap: 12, paddingTop: 20, borderTopWidth: 1, borderTopColor: colorTokens.divider },
  sectionTitle: { fontFamily: fonts.headingBold, fontSize: 20, lineHeight: 26, color: colorTokens.ink },
  subTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colorTokens.ink, marginTop: 4 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colorTokens.body },
  muted: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colorTokens.muted },
  small: { fontFamily: fonts.regular, fontSize: 12, color: colorTokens.muted },
  walkList: { gap: 6 },
  walkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    backgroundColor: colorTokens.surfaceSunken,
  },
  walkRowMine: { backgroundColor: colorTokens.brandSurface },
  walkCampus: { flex: 1, fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.ink },
  walkTime: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.brandText },
  factGrid: { flexDirection: "row", flexWrap: "wrap", columnGap: 20, rowGap: 10 },
  fact: { flexDirection: "row", alignItems: "center", gap: 8, minWidth: 160 },
  factText: { flexShrink: 1, fontFamily: fonts.medium, fontSize: 14, color: colorTokens.ink },
  factTextNo: { color: colorTokens.muted },
  vibe: { gap: 8 },
  vibeTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  vibeTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colorTokens.brandBorder },
  vibeText: { fontFamily: fonts.medium, fontSize: 13, color: colorTokens.brandText },
  tabs: { gap: 8, paddingVertical: 2 },
  tab: { minHeight: 36, justifyContent: "center", paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colorTokens.border },
  tabSelected: { backgroundColor: colorTokens.ink, borderColor: colorTokens.ink },
  tabText: { fontFamily: fonts.semiBold, fontSize: 13, color: colorTokens.body },
  tabTextSelected: { color: colorTokens.surface },
  thumbs: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  thumb: { width: "32%", aspectRatio: 4 / 3, borderRadius: radius.md, overflow: "hidden", backgroundColor: colorTokens.surfaceSunken },
  thumbPhone: { width: "48.5%" },
  thumbLabel: { position: "absolute", left: 6, bottom: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.92)" },
  thumbLabelText: { fontFamily: fonts.semiBold, fontSize: 11, color: colorTokens.ink },
  keyValue: { flexDirection: "row", justifyContent: "space-between", gap: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colorTokens.divider },
  keyLabel: { fontFamily: fonts.regular, fontSize: 14, color: colorTokens.muted },
  keyValueText: { flexShrink: 1, fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.ink, textAlign: "right" },
  askBox: { gap: 8, padding: 16, borderRadius: radius.lg, backgroundColor: colorTokens.brandSurface },
  askHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  askTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colorTokens.ink },
  askItem: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colorTokens.body },
  report: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", minHeight: 44 },
  reportText: { fontFamily: fonts.medium, fontSize: 14, color: colorTokens.muted, textDecorationLine: "underline" },
  banner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: radius.md, backgroundColor: colorTokens.brandSurface },
  bannerWarning: { backgroundColor: colorTokens.warningSurface },
  bannerText: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colorTokens.brandText },
  bannerTextWarning: { color: colorTokens.warningText },
});
