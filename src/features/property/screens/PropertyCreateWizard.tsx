import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  BarChart2,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CreditCard,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Rocket,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from "@/components/icons";
import { useEffect, useRef, useState } from "react";
import { PRICE_ON_REQUEST, useTranslation } from "@/i18n";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { AreaPicker } from "@/components/AreaPicker";
import {
  useMarkAllRead,
  useNotifications,
  useUnreadCount,
} from "@/features/notification/hooks/useNotifications";
import { SellerShell } from "@/features/seller/components/SellerShell";
import { Footer } from "@/components/Footer";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuthStore } from "@/stores/authStore";
import { toApiError } from "@/services/apiClient";
import { confirmAction, notify } from "@/lib/alert";
import type { UploadInput } from "@/services/upload";
import { colorTokens, webPointer } from "@/theme";
import type { Area, PropertyType, UpsertPropertyDto } from "@/types/api";
import {
  PROPERTY_TYPE_CONFIGS,
  cleanCustomSubtype,
  initialSubtype,
  validateSubtype,
} from "../constants/propertyCategories";
import { coordinateProblem } from "../utils/coordinates";
import {
  useCreateProperty,
  useDeleteMedia,
  useSubmitForVerification,
  useUpdateProperty,
  useUploadMedia,
} from "../hooks/usePropertyMutations";
import { usePropertyWizardStore } from "../stores/propertyWizardStore";
import { styles } from "./PropertyCreateWizard.styles";
import { WizardBasicsStep } from "../components/wizard/WizardBasicsStep";
import { WizardDetailsStep } from "../components/wizard/WizardDetailsStep";
import { WizardLocationStep } from "../components/wizard/WizardLocationStep";
import { WizardMediaStep } from "../components/wizard/WizardMediaStep";
import { WizardReviewStep } from "../components/wizard/WizardReviewStep";
import { storedListingTypeFor } from "../utils/listingType";
import { uploadLocalMedia } from "../utils/localMedia";

export function PropertyCreateWizard() {
  const { t } = useTranslation();
  const { isPhone, isTablet, width } = useResponsive();
  const isNarrowPhone = isPhone && width <= 360;
  const store = usePropertyWizardStore();
  const params = useLocalSearchParams<{
    listing_type?: string;
    type?: string;
    subtype?: string;
  }>();

  const createPropertyMutation = useCreateProperty();
  const updatePropertyMutation = useUpdateProperty();
  const uploadMediaMutation = useUploadMedia();
  const deleteMediaMutation = useDeleteMedia();
  const submitMutation = useSubmitForVerification();
  const [searchQuery, setSearchQuery] = useState("");
  const [areaPickerVisible, setAreaPickerVisible] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Live Notifications functionalities
  const { data: unreadCountData } = useUnreadCount();
  const unreadCount = unreadCountData?.data?.count ?? 0;
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications();
  const markAllReadMutation = useMarkAllRead();
  const notificationsList =
    notificationsData?.pages.flatMap((page) => page.data?.items ?? []) ?? [];

  // Sync initial query params from URL if present (e.g. from homepage OwnerListPropertySection)
  useEffect(() => {
    if (params.type && (params.type in PROPERTY_TYPE_CONFIGS)) {
      const typeKey = params.type as PropertyType;
      const cfg = PROPERTY_TYPE_CONFIGS[typeKey];
      store.setBasics({
        type: typeKey,
        ...(params.listing_type === "sale" || params.listing_type === "rent"
          ? { listingType: params.listing_type }
          : {}),
        // A holiday stay is "rent" in the form; it is saved as short_let (see storedListingTypeFor).
        ...(params.listing_type === "short_let" ? { listingType: "rent" as const, subtype: "short-let" } : {}),
        subtype: params.listing_type === "short_let" ? "short-let" : initialSubtype(cfg, params.subtype),
        areaUnit: cfg.defaultUnit,
      });
    }
  }, [params.type, params.listing_type, params.subtype]);

  // The error banner sits at the top of the step card, so a user who has
  // scrolled down a long step would never see it otherwise.
  useEffect(() => {
    if (localError) scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [localError]);

  const activeTypeConfig = PROPERTY_TYPE_CONFIGS[store.type] || PROPERTY_TYPE_CONFIGS.residential;

  const selectedArea: Area | null = store.areaId
    ? {
      id: store.areaId,
      name: store.areaName,
      city: store.district || null,
      parent_area_id: null,
    }
    : null;

  // Location comes before Details, so an owner can save a draft with just the place
  // and add the price and size once they know them.
  const steps = [
    { num: 1, title: t("wizard.steps.basics") },
    { num: 2, title: t("wizard.steps.location") },
    { num: 3, title: t("wizard.steps.details") },
    { num: 4, title: t("wizard.steps.media") },
    { num: 5, title: t("wizard.steps.review") },
  ];

  const buildDto = (): UpsertPropertyDto => ({
    area_id: store.areaId || undefined,
    title: store.title.trim() || undefined,
    description: store.description.trim() || undefined,
    type: store.type,
    subtype: cleanCustomSubtype(store.subtype) || undefined,
    listing_type: storedListingTypeFor(store.listingType, cleanCustomSubtype(store.subtype) || undefined),
    price: store.priceOnRequest ? PRICE_ON_REQUEST : store.price ? Number(store.price) : undefined,
    price_currency: "BDT",
    area_size: store.areaSize ? Number(store.areaSize) : undefined,
    area_unit: store.areaUnit || activeTypeConfig.defaultUnit,
    location_lat: store.locationLat ?? undefined,
    location_lng: store.locationLng ?? undefined,
    address: store.address.trim() || undefined,
    amenities: {
      ...(activeTypeConfig.hasBedrooms && store.bedrooms ? { bedrooms: Number(store.bedrooms) } : {}),
      ...(activeTypeConfig.hasBathrooms && store.bathrooms ? { bathrooms: Number(store.bathrooms) } : {}),
      ...(activeTypeConfig.hasFloor && store.floor ? { floor: Number(store.floor) } : {}),
      ...(activeTypeConfig.hasFacing && store.facing ? { facing: store.facing.trim() } : {}),
      ...Object.fromEntries(
        Object.entries(store.amenities).map(([key, value]) => [key.toLowerCase().replaceAll(" ", "_"), value]),
      ),
    },
    virtual_tour_url: store.virtualTourUrl.trim() || undefined,
    status: "draft",
  });

  /** Writes the listing to the API: the first time it creates it, after that it updates it. */
  const saveListing = async () => {
    const result = store.propertyId
      ? await updatePropertyMutation.mutateAsync({ id: store.propertyId, dto: buildDto() })
      : await createPropertyMutation.mutateAsync(buildDto());
    const propertyId = result.data?.id ?? store.propertyId;
    if (!propertyId) throw new Error("The API did not return a property ID.");
    store.setPropertyId(propertyId);
    return propertyId;
  };

  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);

  /** Uploads the photos and videos still on the device to the saved listing. */
  const uploadPendingMedia = async (propertyId: string) => {
    try {
      await uploadLocalMedia(
        usePropertyWizardStore.getState().media,
        async (file, type, displayOrder) => {
          const response = await uploadMediaMutation.mutateAsync({ propertyId, file, type, displayOrder });
          if (!response.data) throw new Error("The API did not return uploaded media.");
          return response.data;
        },
        store.replaceMedia,
        (done, total) => setUploadProgress({ done, total }),
      );
    } finally {
      setUploadProgress(null);
    }
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      const title = store.title.trim();
      const desc = store.description.trim();
      if (!title || !desc) {
        return t("wizard.validation.titleDescRequired");
      }
      if (title.length < 3 || title.length > 150) {
        return t("wizard.validation.titleLength");
      }
      if (/[<>{}\x00-\x1F]/.test(title)) {
        return t("wizard.validation.titleInvalid");
      }
      if (desc.length > 5000) {
        return t("wizard.validation.descLength");
      }
      if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(desc)) {
        return t("wizard.validation.descInvalid");
      }
      const subtypeProblem = validateSubtype(activeTypeConfig, store.subtype);
      if (subtypeProblem) return subtypeProblem;
    }
    if (step === 3) {
      const priceNum = Number(store.price);
      const areaNum = Number(store.areaSize);
      if (!store.priceOnRequest) {
        // 1 is what "Contact for price" is stored as, so a typed price must be above it.
        if (store.price.trim() === "" || !(priceNum > PRICE_ON_REQUEST)) {
          return t("wizard.validation.priceRequired");
        }
        if (!Number.isFinite(priceNum) || priceNum > 1_000_000_000_000) {
          return t("wizard.validation.priceMax");
        }
      }
      if (!(areaNum > 0)) {
        return t("wizard.validation.areaPositive");
      }
      if (!Number.isFinite(areaNum) || areaNum > 1_000_000) {
        return t("wizard.validation.areaMax");
      }
    }
    if (step === 2) {
      const addr = store.address.trim();
      // The spot comes first on screen: the map pin, the device location or a Google Maps link.
      // Owners never type coordinates, and the address and area fill in from the pin.
      if (coordinateProblem(store.locationLat, store.locationLng) !== null) {
        return t("wizard.validation.pinRequired");
      }
      if (!addr) return t("wizard.validation.addressRequired");
      if (!store.areaId) return t("wizard.validation.areaRequired");
      if (addr.length > 300 || /[<>{}\x00-\x1F]/.test(addr)) {
        return t("wizard.validation.addressLength");
      }
    }
    return null;
  };


  const handleNext = async () => {
    const validationError = validateStep(store.currentStep);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    try {
      // Nothing is sent to the server here: the form stays on the device until Save draft or Submit.
      if (store.currentStep < 5) store.setCurrentStep((store.currentStep + 1) as 1 | 2 | 3 | 4 | 5);
    } catch (error) {
      setLocalError(toApiError(error).message);
    }
  };

  const handleBack = () => {
    if (store.currentStep > 1) {
      store.setCurrentStep((store.currentStep - 1) as any);
    }
  };

  const handleMobileBack = () => {
    if (store.currentStep > 1) {
      store.setCurrentStep((store.currentStep - 1) as any);
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push("/seller" as never);
      }
    }
  };

  const handleSaveDraft = async () => {
    // A listing cannot be created without its area; everything else can wait.
    if (!store.areaId) {
      setLocalError(t("wizard.validation.draftNeedsArea"));
      return;
    }
    try {
      store.setIsSubmitting(true);
      setLocalError(null);
      const propertyId = await saveListing();
      // The draft keeps the photos picked so far, so they are not lost.
      await uploadPendingMedia(propertyId);
      notify(t("wizard.toast.draftSavedTitle"), t("wizard.toast.draftSavedMessage"), {
        confirmLabel: t("wizard.toast.viewMyListings"),
        onConfirm: () => {
          store.reset();
          router.replace("/my-properties" as never);
        },
      });
    } catch (error) {
      setLocalError(toApiError(error).message);
    } finally {
      store.setIsSubmitting(false);
    }
  };

  const handlePickMedia = async (mediaType: "image" | "video") => {
    const existingCount = store.media.filter((media) => media.mediaType === mediaType).length;
    const maxCount = mediaType === "image" ? 20 : 3;
    if (existingCount >= maxCount) {
      setLocalError(t("wizard.validation.uploadLimit", { count: maxCount, type: mediaType === "image" ? "images" : "videos" }));
      return;
    }
    // No permission request: the system photo picker needs none. On Android 11-12 the
    // request asked for WRITE_EXTERNAL_STORAGE, which cannot be granted there, and
    // blocked every upload.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [mediaType === "image" ? "images" : "videos"],
      quality: mediaType === "image" ? 0.85 : undefined,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const allowedTypes = mediaType === "image"
      ? ["image/jpeg", "image/png", "image/webp"]
      : ["video/mp4", "video/webm"];
    if (asset.mimeType && !allowedTypes.includes(asset.mimeType)) {
      setLocalError(
        mediaType === "image"
          ? t("wizard.validation.imagesAllowed")
          : t("wizard.validation.videosAllowed"),
      );
      return;
    }
    const maxBytes = mediaType === "image" ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (asset.fileSize && asset.fileSize > maxBytes) {
      setLocalError(
        mediaType === "image"
          ? t("wizard.validation.imageSizeLimit")
          : t("wizard.validation.videoSizeLimit"),
      );
      return;
    }

    const file: UploadInput = asset.file ?? {
      uri: asset.uri,
      name: asset.fileName || (mediaType === "image" ? "property.jpg" : "property.mp4"),
      type: asset.mimeType || (mediaType === "image" ? "image/jpeg" : "video/mp4"),
    };
    // Kept on the device; it is uploaded when the listing is saved or submitted.
    setLocalError(null);
    store.addMedia({
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url: asset.uri,
      displayOrder: store.media.length,
      mediaType,
      file,
      name: asset.fileName ?? undefined,
    });
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      setLocalError(null);
      // Only a file that has been uploaded exists on the server.
      const item = store.media.find((media) => media.id === mediaId);
      if (item && !item.file && store.propertyId) {
        await deleteMediaMutation.mutateAsync({ mediaId, propertyId: store.propertyId });
      }
      store.removeMedia(mediaId);
    } catch (error) {
      setLocalError(toApiError(error).message);
    }
  };

  const handleSubmit = async () => {
    const errors = [validateStep(1), validateStep(2), validateStep(3)].filter(Boolean);
    if (!store.media.some((media) => media.mediaType === "image")) errors.push(t("wizard.validation.oneImageRequired"));
    if (errors.length) {
      setLocalError(errors[0] as string);
      return;
    }
    try {
      store.setIsSubmitting(true);
      setLocalError(null);
      // Write the listing, then its photos and videos, then send it for review.
      const propertyId = await saveListing();
      await uploadPendingMedia(propertyId);
      await submitMutation.mutateAsync(propertyId);
      notify(t("wizard.toast.submittedTitle"), t("wizard.toast.submittedMessage"), {
        confirmLabel: t("wizard.toast.viewMyListings"),
        onConfirm: () => {
          store.reset();
          router.replace("/my-properties" as never);
        },
      });
    } catch (error) {
      setLocalError(toApiError(error).message);
    } finally {
      store.setIsSubmitting(false);
    }
  };

  const logout = useAuthStore((s) => s.logout);
  const handleLogout = async () => {
    const confirmed = await confirmAction(t("wizard.logoutConfirm.title"), t("wizard.logoutConfirm.message"), {
      confirmLabel: t("wizard.logoutConfirm.confirm"),
      destructive: true,
    });
    if (!confirmed) return;
    logout();
    router.replace("/");
  };

  // Sidebar items - aligned with HomeNet standards (all seller tabs present)
  const sidebarNavItems: {
    key: string;
    label: string;
    icon: any;
    href?: string;
    active?: boolean;
    danger?: boolean;
    badgeCount?: number;
  }[] = [
    { key: "dashboard", label: t("wizard.nav.dashboard"), icon: LayoutDashboard, href: "/seller" },
    { key: "listings", label: t("wizard.nav.myListings"), icon: Building2, href: "/my-properties" },
    { key: "create", label: t("wizard.nav.createProperty"), icon: PlusCircle, href: "/property/create", active: true },
    { key: "verification", label: t("wizard.nav.verification"), icon: ShieldCheck, href: "/verification" },
    { key: "boost", label: t("wizard.nav.boostListings"), icon: Rocket, href: "/seller?tab=boost" },
    { key: "insights", label: t("wizard.nav.aiInsights"), icon: Sparkles, href: "/seller?tab=insights" },
    { key: "analytics", label: t("wizard.nav.analytics"), icon: BarChart2, href: "/seller?tab=analytics" },
    { key: "payments", label: t("wizard.nav.payments"), icon: CreditCard, href: "/seller?tab=payments" },
    { key: "profile", label: t("wizard.nav.profile"), icon: User, href: "/seller/profile" },
    { key: "help", label: t("wizard.nav.helpCenter"), icon: CircleHelp, href: "/seller?tab=help" },
    { key: "logout", label: t("wizard.nav.logout"), icon: LogOut, danger: true, href: "/" },
  ];

  return (
    <SellerShell
      activeNav="create"
      onSearchQueryChange={setSearchQuery}
      scrollable={false}
      searchQuery={searchQuery}
      title={t("wizard.header.title")}
    >
      {/* Scrollable Wizard Body */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.workspaceScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
          <View style={[styles.scrollBody, isPhone && styles.scrollBodyPhone, isNarrowPhone && styles.scrollBodyNarrow]}>
            {/* 5-Step Progress Stepper Bar */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperRow}>
              {steps.map((st, idx) => {
                const isDone = st.num < store.currentStep;
                const isCurrent = st.num === store.currentStep;

                return (
                  <View key={st.num} style={styles.stepItemWrap}>
                    <View style={styles.stepCircleWrap}>
                      <Pressable
                        onPress={() => {
                          if (st.num < store.currentStep) store.setCurrentStep(st.num as 1 | 2 | 3 | 4 | 5);
                        }}
                        style={[
                          styles.stepCircle,
                          isDone && styles.stepCircleDone,
                          isCurrent && styles.stepCircleCurrent,
                          webPointer,
                        ]}
                      >
                        {isDone ? (
                          <Check color={colorTokens.onBrand} size={16} />
                        ) : (
                          <Text style={[styles.stepCircleText, isCurrent && styles.stepCircleTextCurrent]}>
                            {st.num}
                          </Text>
                        )}
                      </Pressable>

                      <Text style={[styles.stepLabelText, (isDone || isCurrent) && styles.stepLabelTextActive]}>
                        {st.title}
                      </Text>
                    </View>

                    {idx < steps.length - 1 && (
                      <View style={[styles.stepConnectorLine, st.num < store.currentStep && styles.stepConnectorLineDone]} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Wizard Step Main Card */}
          <View style={[styles.stepCard, isPhone && styles.stepCardPhone, isNarrowPhone && styles.stepCardNarrow]}>
            {localError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{localError}</Text>
              </View>
            ) : null}
            {uploadProgress ? (
              <Text accessibilityLiveRegion="polite" style={styles.formHelperText}>
                {t("wizard.validation.uploadProgress", { done: uploadProgress.done, total: uploadProgress.total })}
              </Text>
            ) : null}
            {/* STEP 1: BASICS */}
            {store.currentStep === 1 && (
              <WizardBasicsStep activeTypeConfig={activeTypeConfig} />
            )}

            {/* STEP 2: LOCATION (Figma Node 56:2) */}
            {store.currentStep === 2 && (
              <WizardLocationStep onOpenAreaPicker={() => setAreaPickerVisible(true)} />
            )}

            {/* STEP 3: DETAILS */}
            {store.currentStep === 3 && (
              <WizardDetailsStep activeTypeConfig={activeTypeConfig} />
            )}

            {/* STEP 4: MEDIA (Figma Node 56:1219) */}
            {store.currentStep === 4 && (
              <WizardMediaStep
                isUploading={store.isSubmitting}
                onDeleteMedia={handleDeleteMedia}
                onPickMedia={handlePickMedia}
              />
            )}

            {/* STEP 5: REVIEW */}
            {store.currentStep === 5 && (
              <WizardReviewStep activeTypeConfig={activeTypeConfig} />
            )}

            {/* Bottom Wizard Actions Navigation Bar */}
            <View style={[styles.wizardActionBar, isPhone && styles.wizardActionBarMobile]}>
              {/* On Desktop: Show Back only if step > 1 (desktop design preserved 100%) */}
              {/* On Mobile: Always show Back button (navigates back to previous step, or exits to dashboard on step 1) */}
              {isPhone ? (
                <Pressable
                  onPress={handleMobileBack}
                  style={({ pressed }) => [
                    styles.backBtn,
                    styles.backBtnMobile,
                    isNarrowPhone && styles.backBtnNarrow,
                    webPointer,
                    pressed && styles.pressed,
                  ]}
                >
                  <ChevronLeft color="#5C6B66" size={16} strokeWidth={2} />
                  <Text style={[styles.backBtnTextMobile, isNarrowPhone && styles.btnTextNarrow]}>{t("wizard.actions.back")}</Text>
                </Pressable>
              ) : store.currentStep > 1 ? (
                <Pressable
                  onPress={handleBack}
                  style={({ pressed }) => [styles.backBtn, webPointer, pressed && styles.pressed]}
                >
                  <ArrowLeft color="#0B1A17" size={16} />
                  <Text style={styles.backBtnText}>{t("wizard.actions.back")}</Text>
                </Pressable>
              ) : (
                <View />
              )}

              <View style={[styles.wizardRightActions, isPhone && styles.wizardRightActionsMobile, isNarrowPhone && styles.wizardRightActionsNarrow]}>
                <Pressable
                  disabled={store.isSubmitting}
                  onPress={() => void handleSaveDraft()}
                  style={({ pressed }) => [
                    styles.saveDraftBtn,
                    isPhone && styles.saveDraftBtnMobile,
                    isNarrowPhone && styles.saveDraftBtnNarrow,
                    webPointer,
                    pressed && styles.pressed,
                  ]}
                >
                  <Save color="#0B1A17" size={14} />
                  <Text style={[styles.saveDraftText, isPhone && styles.saveDraftTextMobile, isNarrowPhone && styles.btnTextNarrow]}>
                    {isNarrowPhone ? t("wizard.actions.save") : t("wizard.actions.saveDraft")}
                  </Text>
                </Pressable>

                {store.currentStep < 5 ? (
                  <Pressable
                    disabled={store.isSubmitting}
                    onPress={() => void handleNext()}
                    style={({ pressed }) => [
                      styles.nextBtn,
                      isPhone && styles.nextBtnMobile,
                      isNarrowPhone && styles.nextBtnNarrow,
                      webPointer,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.nextBtnText, isPhone && styles.nextBtnTextMobile, isNarrowPhone && styles.btnTextNarrow]}>{t("wizard.actions.next")}</Text>
                    <ChevronRight color={colorTokens.onBrand} size={15} strokeWidth={2} />
                  </Pressable>
                ) : (
                  <Pressable
                    disabled={store.isSubmitting}
                    onPress={() => void handleSubmit()}
                    style={({ pressed }) => [
                      styles.publishBtn,
                      isPhone && styles.publishBtnMobile,
                      isNarrowPhone && styles.publishBtnNarrow,
                      webPointer,
                      pressed && styles.pressed,
                    ]}
                  >
                    {store.isSubmitting ? (
                      <ActivityIndicator color={colorTokens.onBrand} size="small" />
                    ) : (
                      <Send color={colorTokens.onBrand} size={14} />
                    )}
                    <Text style={[styles.publishBtnText, isPhone && styles.publishBtnTextMobile, isNarrowPhone && styles.btnTextNarrow]}>
                      {isPhone ? t("wizard.actions.submit") : t("wizard.actions.submitVerification")}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>
        <Footer />
      </ScrollView>
      <AreaPicker
        visible={areaPickerVisible}
        onClose={() => setAreaPickerVisible(false)}
        selectedArea={selectedArea}
        initialCity={store.district || undefined}
        onSelect={(area) => {
          if (!area) return;
          store.setLocation({ areaId: area.id, areaName: area.name, district: area.city ?? "" });
          setAreaPickerVisible(false);
          setLocalError(null);
        }}
      />
    </SellerShell>
  );
}
