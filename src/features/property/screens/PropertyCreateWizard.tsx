import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  BarChart2,
  Bell,
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
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from "@/components/icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { AreaPicker } from "@/components/AreaPicker";
import { Brand } from "@/components/Brand";
import { AppLink } from "@/components/ui";
import { NotificationItem } from "@/features/notification/components/NotificationItem";
import {
  useMarkAllRead,
  useNotifications,
  useUnreadCount,
} from "@/features/notification/hooks/useNotifications";
import { SellerMobileDrawer } from "@/features/seller/components/SellerMobileDrawer";
import { SellerTopHeader } from "@/features/seller/components/SellerTopHeader";
import { ToggleViewButton } from "@/features/seller/components/ToggleViewButton";
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

export function PropertyCreateWizard() {
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
        subtype: initialSubtype(cfg, params.subtype),
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

  const steps = [
    { num: 1, title: "Basics" },
    { num: 2, title: "Details" },
    { num: 3, title: "Location" },
    { num: 4, title: "Media" },
    { num: 5, title: "Review" },
  ];

  const buildDto = (): UpsertPropertyDto => ({
    area_id: store.areaId || undefined,
    title: store.title.trim() || undefined,
    description: store.description.trim() || undefined,
    type: store.type,
    subtype: cleanCustomSubtype(store.subtype) || undefined,
    listing_type: store.listingType,
    price: store.price ? Number(store.price) : undefined,
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

  const upsertDraft = async () => {
    const result = store.propertyId
      ? await updatePropertyMutation.mutateAsync({ id: store.propertyId, dto: buildDto() })
      : await createPropertyMutation.mutateAsync(buildDto());
    const propertyId = result.data?.id ?? store.propertyId;
    if (!propertyId) throw new Error("The API did not return a property ID.");
    store.setPropertyId(propertyId);
    return propertyId;
  };

  const validateStep = (step: number) => {
    if (step === 1 && (!store.title.trim() || !store.description.trim())) {
      return "Add a title and description before continuing.";
    }
    if (step === 1) {
      const subtypeProblem = validateSubtype(activeTypeConfig, store.subtype);
      if (subtypeProblem) return subtypeProblem;
    }
    if (step === 2 && (!(Number(store.price) > 0) || !(Number(store.areaSize) > 0))) {
      return "Price and area must be greater than zero.";
    }
    if (
      step === 3 &&
      (!store.areaId ||
        !store.address.trim() ||
        store.locationLat === null ||
        !Number.isFinite(store.locationLat) ||
        store.locationLat < -90 ||
        store.locationLat > 90 ||
        store.locationLng === null ||
        !Number.isFinite(store.locationLng) ||
        store.locationLng < -180 ||
        store.locationLng > 180)
    ) {
      return "Select an API area and enter the address, latitude, and longitude.";
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
      if (store.currentStep === 3) await upsertDraft();
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
    try {
      store.setIsSubmitting(true);
      setLocalError(null);
      await upsertDraft();
      notify("Draft saved", "Your latest property details were saved.", {
        confirmLabel: "View my listings",
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
    if (!store.propertyId) {
      setLocalError("Complete Location first so the draft can be created before media upload.");
      return;
    }
    const existingCount = store.media.filter((media) => media.mediaType === mediaType).length;
    const maxCount = mediaType === "image" ? 20 : 3;
    if (existingCount >= maxCount) {
      setLocalError(`You can upload up to ${maxCount} ${mediaType === "image" ? "images" : "videos"}.`);
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setLocalError("Media library permission is required to upload property media.");
      return;
    }
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
          ? "Images must be JPEG, PNG, or WebP."
          : "Videos must be MP4 or WebM.",
      );
      return;
    }
    const maxBytes = mediaType === "image" ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (asset.fileSize && asset.fileSize > maxBytes) {
      setLocalError(`${mediaType === "image" ? "Images" : "Videos"} must be under ${mediaType === "image" ? "10 MB" : "100 MB"}.`);
      return;
    }

    const file: UploadInput = asset.file ?? {
      uri: asset.uri,
      name: asset.fileName || (mediaType === "image" ? "property.jpg" : "property.mp4"),
      type: asset.mimeType || (mediaType === "image" ? "image/jpeg" : "video/mp4"),
    };
    try {
      setLocalError(null);
      const response = await uploadMediaMutation.mutateAsync({
        propertyId: store.propertyId,
        file,
        type: mediaType,
        displayOrder: store.media.length,
      });
      if (!response.data) throw new Error("The API did not return uploaded media.");
      store.addMedia({
        id: response.data.id,
        url: response.data.url,
        displayOrder: response.data.display_order,
        mediaType: response.data.media_type,
      });
    } catch (error) {
      setLocalError(toApiError(error).message);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      setLocalError(null);
      await deleteMediaMutation.mutateAsync({ mediaId, propertyId: store.propertyId ?? undefined });
      store.removeMedia(mediaId);
    } catch (error) {
      setLocalError(toApiError(error).message);
    }
  };

  const handleSubmit = async () => {
    const errors = [validateStep(1), validateStep(2), validateStep(3)].filter(Boolean);
    if (!store.media.some((media) => media.mediaType === "image")) errors.push("Upload at least one property image.");
    if (errors.length) {
      setLocalError(errors[0] as string);
      return;
    }
    try {
      store.setIsSubmitting(true);
      setLocalError(null);
      const propertyId = await upsertDraft();
      await submitMutation.mutateAsync(propertyId);
      notify("Submitted for verification", "Your listing is pending review.", {
        confirmLabel: "View my listings",
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
    const confirmed = await confirmAction("Log Out", "Are you sure you want to log out of your account?", {
      confirmLabel: "Log Out",
      destructive: true,
    });
    if (!confirmed) return;
    logout();
    router.replace("/home");
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
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/seller" },
    { key: "listings", label: "My Listings", icon: Building2, href: "/my-properties" },
    { key: "create", label: "Create Property", icon: PlusCircle, href: "/property/create", active: true },
    { key: "verification", label: "Verification", icon: ShieldCheck, href: "/verification" },
    { key: "boost", label: "Boost Listings", icon: Rocket, href: "/seller?tab=boost" },
    { key: "insights", label: "AI Insights", icon: Sparkles, href: "/seller?tab=insights" },
    { key: "analytics", label: "Analytics", icon: BarChart2, href: "/seller?tab=analytics" },
    { key: "payments", label: "Payments", icon: CreditCard, href: "/seller?tab=payments" },
    { key: "profile", label: "Profile", icon: User, href: "/seller/profile" },
    { key: "help", label: "Help Center", icon: CircleHelp, href: "/seller?tab=help" },
    { key: "logout", label: "Logout", icon: LogOut, danger: true, href: "/" },
  ];

  return (
    <View style={styles.outerContainer}>

      {/* Sidebar (Desktop View) */}
      {!isTablet && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Brand />
            <View style={styles.sellerRolePill}>
              <Text style={styles.sellerRoleText}>Seller Dashboard</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.sidebarNavScroll} showsVerticalScrollIndicator={false}>
            {sidebarNavItems.map((item) => {
              const IconComp = item.icon;
              return (
                <AppLink
                  href={item.href || "#"}
                  key={item.key}
                  onPress={() => {
                    if (item.key === "logout") {
                      handleLogout();
                    }
                  }}
                  style={[
                    styles.navItem,
                    item.active && styles.navItemActive,
                    item.danger && styles.navItemDanger,
                  ]}
                >
                  <IconComp
                    color={item.danger ? "#D4183D" : item.active ? "#04cf92" : "#5C6B66"}
                    size={20}
                  />
                  <Text
                    style={[
                      styles.navItemText,
                      item.active && styles.navItemTextActive,
                      item.danger && styles.navItemTextDanger,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.badgeCount ? (
                    <View style={styles.badgeCountPill}>
                      <Text style={styles.badgeCountText}>{item.badgeCount}</Text>
                    </View>
                  ) : null}
                </AppLink>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Main Workspace Content */}
      <View style={styles.mainContent}>
        {/* Top Header Bar */}
        {isTablet ? (
          <SellerTopHeader
            hasUnreadNotifications={unreadCount > 0}
            onPressMenu={() => setMobileDrawerOpen(true)}
            onSearchQueryChange={setSearchQuery}
            searchQuery={searchQuery}
            title="Create Property"
          />
        ) : (
          <View style={styles.topHeader}>
            <View>
              <Text style={styles.headerTitle}>Create Property</Text>
              <Text style={styles.headerSubtitle}>
                Follow the 5 steps to list your property across Bangladesh
              </Text>
            </View>

            <View style={styles.headerActions}>
              <View style={styles.searchContainer}>
                <Search color="rgba(11,26,23,0.5)" size={16} />
                <TextInput
                  onChangeText={setSearchQuery}
                  placeholder="Search listings…"
                  placeholderTextColor="rgba(11,26,23,0.5)"
                  style={styles.searchInput}
                  value={searchQuery}
                />
              </View>

              {/* Notification Bell with live functionalities & popover */}
              <View style={styles.notificationWrap}>
                <Pressable
                  accessibilityLabel="Notifications"
                  accessibilityRole="button"
                  onPress={() => setNotificationsOpen((prev) => !prev)}
                  style={({ pressed }) => [
                    styles.iconCircleBtn,
                    notificationsOpen && styles.iconCircleBtnActive,
                    webPointer,
                    pressed && styles.iconCircleBtnPressed,
                  ]}
                >
                  <Bell
                    color={notificationsOpen ? "#04cf92" : "#0B1A17"}
                    size={20}
                    strokeWidth={1.8}
                  />
                  {unreadCount > 0 ? (
                    <View style={styles.notificationBadgePill}>
                      <Text style={styles.notificationBadgeText}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>

                {/* Notifications dropdown popover */}
                {notificationsOpen && (
                  <View style={styles.notificationDropdown}>
                    <View style={styles.dropdownHeader}>
                      <View style={styles.dropdownHeaderLeft}>
                        <Text style={styles.dropdownTitle}>Notifications</Text>
                        {unreadCount > 0 && (
                          <View style={styles.unreadCountPill}>
                            <Text style={styles.unreadCountPillText}>
                              {unreadCount} new
                            </Text>
                          </View>
                        )}
                      </View>
                      {unreadCount > 0 && (
                        <Pressable
                          accessibilityRole="button"
                          disabled={markAllReadMutation.isPending}
                          onPress={() => markAllReadMutation.mutate()}
                          style={({ pressed }) => [
                            styles.markAllReadBtn,
                            webPointer,
                            pressed && { opacity: 0.7 },
                          ]}
                        >
                          <Text style={styles.markAllReadText}>
                            {markAllReadMutation.isPending ? "Marking..." : "Mark all read"}
                          </Text>
                        </Pressable>
                      )}
                    </View>

                    <ScrollView
                      contentContainerStyle={styles.dropdownScrollContent}
                      nestedScrollEnabled
                      style={styles.dropdownScroll}
                    >
                      {notificationsLoading ? (
                        <View style={styles.dropdownEmpty}>
                          <Text style={styles.dropdownEmptyText}>Loading notifications...</Text>
                        </View>
                      ) : notificationsList.length === 0 ? (
                        <View style={styles.dropdownEmpty}>
                          <Bell color="rgba(11,26,23,0.3)" size={32} />
                          <Text style={styles.dropdownEmptyText}>No notifications yet</Text>
                        </View>
                      ) : (
                        notificationsList.slice(0, 8).map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onPress={() => setNotificationsOpen(false)}
                          />
                        ))
                      )}
                    </ScrollView>

                    <View style={styles.dropdownFooter}>
                      <AppLink
                        href="/notifications"
                        onPress={() => setNotificationsOpen(false)}
                        style={styles.viewAllNotificationsBtn}
                      >
                        <Text style={styles.viewAllNotificationsText}>
                          View all notifications →
                        </Text>
                      </AppLink>
                    </View>
                  </View>
                )}
              </View>

              <ToggleViewButton />
            </View>
          </View>
        )}

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
            {/* STEP 1: BASICS */}
            {store.currentStep === 1 && (
              <WizardBasicsStep activeTypeConfig={activeTypeConfig} />
            )}

            {/* STEP 2: DETAILS */}
            {store.currentStep === 2 && (
              <WizardDetailsStep activeTypeConfig={activeTypeConfig} />
            )}

            {/* STEP 3: LOCATION (Figma Node 56:2) */}
            {store.currentStep === 3 && (
              <WizardLocationStep onOpenAreaPicker={() => setAreaPickerVisible(true)} />
            )}

            {/* STEP 4: MEDIA (Figma Node 56:1219) */}
            {store.currentStep === 4 && (
              <WizardMediaStep
                isUploading={uploadMediaMutation.isPending}
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
                  <Text style={[styles.backBtnTextMobile, isNarrowPhone && styles.btnTextNarrow]}>Back</Text>
                </Pressable>
              ) : store.currentStep > 1 ? (
                <Pressable
                  onPress={handleBack}
                  style={({ pressed }) => [styles.backBtn, webPointer, pressed && styles.pressed]}
                >
                  <ArrowLeft color="#0B1A17" size={16} />
                  <Text style={styles.backBtnText}>Back</Text>
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
                    {isNarrowPhone ? "Save" : "Save draft"}
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
                    <Text style={[styles.nextBtnText, isPhone && styles.nextBtnTextMobile, isNarrowPhone && styles.btnTextNarrow]}>Next</Text>
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
                      {isPhone ? "Submit" : "Submit for verification"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>
        <Footer />
      </ScrollView>
      </View>
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
      <SellerMobileDrawer
        activeNav="create"
        items={sidebarNavItems as any}
        onClose={() => setMobileDrawerOpen(false)}
        onSelectNav={(key) => {
          setMobileDrawerOpen(false);
          if (key === "logout") {
            handleLogout();
            return;
          }
          const found = sidebarNavItems.find((i) => i.key === key);
          if (found?.href) router.push(found.href as any);
        }}
        visible={isTablet && mobileDrawerOpen}
      />
    </View>
  );
}
