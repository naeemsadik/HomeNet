import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart2,
  Bell,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Compass,
  CreditCard,
  Globe,
  Grid,
  Image as ImageIcon,
  LayoutDashboard,
  Layers,
  LogOut,
  MapPin,
  Maximize2,
  Plus,
  PlusCircle,
  Rocket,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  Video,
  Zap,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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
import { useResponsive } from "@/hooks/useResponsive";
import { toApiError } from "@/services/apiClient";
import type { UploadInput } from "@/services/upload";
import { colors, fonts, webPointer } from "@/theme";
import type { Area, PropertyType, UpsertPropertyDto } from "@/types/api";
import {
  PROPERTY_TYPE_CONFIGS,
  type PropertyTypeConfig,
} from "../constants/propertyCategories";
import {
  useCreateProperty,
  useDeleteMedia,
  useSubmitForVerification,
  useUpdateProperty,
  useUploadMedia,
} from "../hooks/usePropertyMutations";
import { usePropertyWizardStore } from "../stores/propertyWizardStore";

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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
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
        subtype: params.subtype || cfg.defaultSubtype,
        areaUnit: cfg.defaultUnit,
      });
    }
  }, [params.type, params.listing_type, params.subtype]);

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
    subtype: store.subtype.trim() || undefined,
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
      Alert.alert("Draft saved", "Your latest property details were saved.", [
        {
          text: "View my listings",
          onPress: () => {
            store.reset();
            router.replace("/my-properties" as never);
          },
        },
      ]);
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
      Alert.alert("Submitted for verification", "Your listing is pending review.", [
        {
          text: "View my listings",
          onPress: () => {
            store.reset();
            router.replace("/my-properties" as never);
          },
        },
      ]);
    } catch (error) {
      setLocalError(toApiError(error).message);
    } finally {
      store.setIsSubmitting(false);
    }
  };

  // Sidebar items - aligned with HomeNet standards (Notification removed as requested)
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
    { key: "insights", label: "AI Insights", icon: Sparkles, href: "/ai-finder" },
    { key: "analytics", label: "Analytics", icon: BarChart2, href: "/market" },
    { key: "profile", label: "Profile", icon: User, href: "/seller/profile" },
    { key: "settings", label: "Settings", icon: Settings, href: "/settings" },
    { key: "help", label: "Help Center", icon: CircleHelp, href: "/about" },
    { key: "logout", label: "Logout", icon: LogOut, danger: true, href: "/" },
  ];

  return (
    <View style={styles.outerContainer}>
      {/* Mobile navigation drawer */}
      <SellerMobileDrawer
        activeNav="create"
        items={sidebarNavItems as any}
        onClose={() => setMobileDrawerOpen(false)}
        onSelectNav={() => {}}
        visible={mobileDrawerOpen}
      />

      {/* Sidebar (Desktop View) */}
      {!isTablet && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Brand />
            <View style={styles.sellerRolePill}>
              <Text style={styles.sellerRoleText}>Seller Portal</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.sidebarNavScroll} showsVerticalScrollIndicator={false}>
            {sidebarNavItems.map((item) => {
              const IconComp = item.icon;
              return (
                <AppLink
                  href={item.href || "#"}
                  key={item.key}
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

              <AppLink href="/" style={styles.viewSiteBtn}>
                <Globe color="#04cf92" size={16} />
                <Text style={styles.viewSiteText}>View site</Text>
              </AppLink>
            </View>
          </View>
        )}

        {/* Scrollable Wizard Body */}
        <ScrollView contentContainerStyle={[styles.scrollBody, isPhone && styles.scrollBodyPhone, isNarrowPhone && styles.scrollBodyNarrow]} showsVerticalScrollIndicator={false}>
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
                          <Check color="#FFFFFF" size={16} />
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
              <View style={styles.stepFormBody}>
                {/* Property Title */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Property Title *</Text>
                  <TextInput
                    onChangeText={(v) => store.setBasics({ title: v })}
                    placeholder="e.g. Modern 3-Bedroom Apartment in Gulshan 2"
                    placeholderTextColor="#899790"
                    style={styles.formInput}
                    value={store.title}
                  />
                  <Text style={styles.formHelperText}>
                    A clear, descriptive title attracts more serious buyers.
                  </Text>
                </View>

                {/* Primary Category (Residential, Commercial, Land, Parking) */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Property Category *</Text>
                  <View style={[styles.categoryGrid, isPhone && styles.categoryGridMobile]}>
                    {(Object.keys(PROPERTY_TYPE_CONFIGS) as PropertyType[]).map((typeKey) => {
                      const cfg = PROPERTY_TYPE_CONFIGS[typeKey];
                      const isSelected = store.type === typeKey;
                      const TypeIcon = cfg.icon;

                      return (
                        <Pressable
                          key={typeKey}
                          accessibilityLabel={cfg.label}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                          onPress={() => {
                            store.setBasics({
                              type: typeKey,
                              subtype: cfg.defaultSubtype,
                              areaUnit: cfg.defaultUnit,
                            });
                          }}
                          style={[
                            styles.categoryCard,
                            isSelected && styles.categoryCardSelected,
                            webPointer,
                          ]}
                        >
                          <View
                            style={[
                              styles.categoryIconWrap,
                              isSelected && styles.categoryIconWrapSelected,
                            ]}
                          >
                            <TypeIcon
                              color={isSelected ? "#04cf92" : "#5C6B66"}
                              size={20}
                            />
                          </View>
                          <Text
                            style={[
                              styles.categoryLabel,
                              isSelected && styles.categoryLabelSelected,
                            ]}
                          >
                            {cfg.label}
                          </Text>
                          <Text
                            numberOfLines={2}
                            style={[
                              styles.categoryDesc,
                              isSelected && styles.categoryDescSelected,
                            ]}
                          >
                            {cfg.description}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Property Subtypes (Specific to Category) */}
                <View style={styles.formGroup}>
                  <View style={styles.formLabelRow}>
                    <Text style={styles.formLabel}>
                      {activeTypeConfig.label} Subtype *
                    </Text>
                    <Text style={styles.formHint}>Select specific unit classification</Text>
                  </View>
                  <View style={styles.subtypeWrap}>
                    {activeTypeConfig.subtypes.map((sub) => {
                      const isSelected = store.subtype === sub.value;
                      return (
                        <Pressable
                          key={sub.value}
                          accessibilityLabel={sub.label}
                          accessibilityRole="button"
                          onPress={() => store.setBasics({ subtype: sub.value })}
                          style={[
                            styles.subtypePill,
                            isSelected && styles.subtypePillSelected,
                            webPointer,
                          ]}
                        >
                          {isSelected ? <Check color="#04cf92" size={14} /> : null}
                          <Text
                            style={[
                              styles.subtypePillText,
                              isSelected && styles.subtypePillTextSelected,
                            ]}
                          >
                            {sub.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Listing Purpose */}
                <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Listing Purpose *</Text>
                    <View style={styles.toggleRow}>
                      <Pressable
                        onPress={() => {
                          store.setBasics({
                            listingType: "sale",
                            ...(store.subtype === "short-let" ? { subtype: "apartment" } : {}),
                          });
                        }}
                        style={[
                          styles.toggleBtn,
                          store.listingType === "sale" && store.subtype !== "short-let" && styles.toggleBtnActive,
                          webPointer,
                        ]}
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.toggleBtnText,
                            store.listingType === "sale" && store.subtype !== "short-let" && styles.toggleBtnTextActive,
                          ]}
                        >
                          For Sale
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          store.setBasics({
                            listingType: "rent",
                            ...(store.subtype === "short-let" ? { subtype: "apartment" } : {}),
                          });
                        }}
                        style={[
                          styles.toggleBtn,
                          store.listingType === "rent" && store.subtype !== "short-let" && styles.toggleBtnActive,
                          webPointer,
                        ]}
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.toggleBtnText,
                            store.listingType === "rent" && store.subtype !== "short-let" && styles.toggleBtnTextActive,
                          ]}
                        >
                          For Rent
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          store.setBasics({
                            listingType: "rent",
                            type: "residential",
                            subtype: "short-let",
                          });
                        }}
                        style={[
                          styles.toggleBtn,
                          store.subtype === "short-let" && styles.toggleBtnActive,
                          webPointer,
                        ]}
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.toggleBtnText,
                            store.subtype === "short-let" && styles.toggleBtnTextActive,
                          ]}
                        >
                          Short-let
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.formGroup}>
                  <View style={styles.formLabelRow}>
                    <Text style={styles.formLabel}>Description *</Text>
                    {store.description.trim().length > 0 && (
                      <Text style={styles.formHelperCharCount}>
                        {store.description.length} {store.description.length === 1 ? "char" : "chars"}
                      </Text>
                    )}
                  </View>
                  <TextInput
                    multiline
                    numberOfLines={4}
                    onBlur={() => setDescFocused(false)}
                    onFocus={() => setDescFocused(true)}
                    onChangeText={(v) => store.setBasics({ description: v })}
                    placeholder="Describe key features, nearby landmarks, orientation, and building condition..."
                    placeholderTextColor="#899790"
                    style={[styles.formTextarea, descFocused && styles.formTextareaFocused]}
                    value={store.description}
                  />
                </View>
              </View>
            )}

            {/* STEP 2: DETAILS */}
            {store.currentStep === 2 && (
              <View style={styles.stepFormBody}>
                {/* Price & Area Size Row */}
                <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>
                      Price (BDT) {store.subtype === "short-let" ? "/ night or / mo" : store.listingType === "rent" ? "/ month" : ""} *
                    </Text>
                    <TextInput
                      keyboardType="numeric"
                      onChangeText={(v) => store.setDetails({ price: v })}
                      placeholder={store.subtype === "short-let" ? "e.g. 5,000" : "e.g. 18,500,000"}
                      placeholderTextColor="#899790"
                      style={styles.formInput}
                      value={store.price}
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <View style={styles.formLabelRow}>
                      <Text style={styles.formLabel}>Area Size *</Text>
                      {/* Area unit selector */}
                      <View style={styles.unitSelectorRow}>
                        {activeTypeConfig.allowedUnits.map((u) => {
                          const isUnitSelected = (store.areaUnit || activeTypeConfig.defaultUnit) === u;
                          return (
                            <Pressable
                              key={u}
                              onPress={() => store.setDetails({ areaUnit: u })}
                              style={[
                                styles.unitPill,
                                isUnitSelected && styles.unitPillActive,
                                webPointer,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.unitPillText,
                                  isUnitSelected && styles.unitPillTextActive,
                                ]}
                              >
                                {u}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                    <TextInput
                      keyboardType="numeric"
                      onChangeText={(v) => store.setDetails({ areaSize: v })}
                      placeholder={
                        (store.areaUnit || activeTypeConfig.defaultUnit) === "katha"
                          ? "e.g. 5"
                          : "e.g. 2150"
                      }
                      placeholderTextColor="#899790"
                      style={styles.formInput}
                      value={store.areaSize}
                    />
                  </View>
                </View>

                {/* Conditional fields based on PROPERTY_TYPES_SPECIFICATION */}
                {(activeTypeConfig.hasBedrooms ||
                  activeTypeConfig.hasBathrooms ||
                  activeTypeConfig.hasFloor ||
                  activeTypeConfig.hasFacing) && (
                  <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
                    {activeTypeConfig.hasBedrooms && (
                      <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.formLabel}>Bedrooms</Text>
                        <TextInput
                          keyboardType="numeric"
                          onChangeText={(v) => store.setDetails({ bedrooms: v })}
                          placeholder="3"
                          placeholderTextColor="#899790"
                          style={styles.formInput}
                          value={store.bedrooms}
                        />
                      </View>
                    )}

                    {activeTypeConfig.hasBathrooms && (
                      <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.formLabel}>Bathrooms</Text>
                        <TextInput
                          keyboardType="numeric"
                          onChangeText={(v) => store.setDetails({ bathrooms: v })}
                          placeholder="3"
                          placeholderTextColor="#899790"
                          style={styles.formInput}
                          value={store.bathrooms}
                        />
                      </View>
                    )}

                    {activeTypeConfig.hasFloor && (
                      <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.formLabel}>Floor Level</Text>
                        <TextInput
                          keyboardType="numeric"
                          onChangeText={(v) => store.setDetails({ floor: v })}
                          placeholder="7"
                          placeholderTextColor="#899790"
                          style={styles.formInput}
                          value={store.floor}
                        />
                      </View>
                    )}

                    {activeTypeConfig.hasFacing && (
                      <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.formLabel}>Facing Direction</Text>
                        <TextInput
                          onChangeText={(v) => store.setDetails({ facing: v })}
                          placeholder="South / East"
                          placeholderTextColor="#899790"
                          style={styles.formInput}
                          value={store.facing}
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* Type-Specific Amenities Checklist */}
                <View style={styles.formGroup}>
                  <View style={styles.formLabelRow}>
                    <Text style={styles.formLabel}>
                      {activeTypeConfig.label} Amenities & Features
                    </Text>
                    <Text style={styles.formHint}>Select all that apply</Text>
                  </View>
                  <View style={styles.amenitiesWrap}>
                    {activeTypeConfig.amenities.map((item) => {
                      const isSelected = !!store.amenities[item.key];
                      return (
                        <Pressable
                          key={item.key}
                          accessibilityLabel={item.label}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                          onPress={() => store.toggleAmenity(item.key)}
                          style={[
                            styles.amenityPill,
                            isSelected && styles.amenityPillSelected,
                            webPointer,
                          ]}
                        >
                          {isSelected ? <Check color="#04cf92" size={14} /> : null}
                          <Text
                            style={[
                              styles.amenityPillText,
                              isSelected && styles.amenityPillTextSelected,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* STEP 3: LOCATION (Figma Node 56:2) */}
            {store.currentStep === 3 && (
              <View style={styles.stepFormBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Property address</Text>
                  <TextInput
                    onChangeText={(v) => store.setLocation({ address: v })}
                    placeholder="e.g. House 12, Road 45, Gulshan 2"
                    placeholderTextColor="#899790"
                    style={styles.formInput}
                    value={store.address}
                  />
                </View>

                <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Area / Neighbourhood</Text>
                    <Pressable
                      onPress={() => setAreaPickerVisible(true)}
                      style={({ pressed }) => [styles.formInput, styles.areaPickerButton, pressed && styles.pressed]}
                    >
                      <MapPin color="#04cf92" size={17} />
                      <Text style={[styles.areaPickerText, !store.areaId && styles.areaPickerPlaceholder]}>
                        {store.areaId
                          ? [store.areaName, store.district].filter(Boolean).join(", ")
                          : "Select an area from the API"}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Latitude</Text>
                    <TextInput
                      keyboardType="numbers-and-punctuation"
                      onChangeText={(value) =>
                        store.setLocation({ locationLat: value.trim() === "" ? null : Number(value) })
                      }
                      placeholder="23.8103"
                      placeholderTextColor="#899790"
                      style={styles.formInput}
                      value={store.locationLat === null ? "" : String(store.locationLat)}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Longitude</Text>
                    <TextInput
                      keyboardType="numbers-and-punctuation"
                      onChangeText={(value) =>
                        store.setLocation({ locationLng: value.trim() === "" ? null : Number(value) })
                      }
                      placeholder="90.4125"
                      placeholderTextColor="#899790"
                      style={styles.formInput}
                      value={store.locationLng === null ? "" : String(store.locationLng)}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* STEP 4: MEDIA (Figma Node 56:1219) */}
            {store.currentStep === 4 && (
              <View style={styles.stepFormBody}>
                <Text style={styles.formLabel}>Property images</Text>
                <View style={styles.mediaGrid}>
                  {store.media.filter((media) => media.mediaType === "image").map((media, idx) => (
                    <View key={media.id} style={styles.mediaCard}>
                      <Image source={{ uri: media.url }} style={styles.mediaImg} />
                      {idx === 0 ? (
                        <View style={styles.coverBadge}>
                          <Text style={styles.coverBadgeText}>Cover</Text>
                        </View>
                      ) : null}
                      <Pressable onPress={() => void handleDeleteMedia(media.id)} style={styles.removeMediaButton}>
                        <Trash2 color="#FFFFFF" size={14} />
                      </Pressable>
                    </View>
                  ))}

                  <Pressable
                    disabled={uploadMediaMutation.isPending}
                    onPress={() => void handlePickMedia("image")}
                    style={({ pressed }) => [styles.addMediaCard, webPointer, pressed && styles.pressed]}
                  >
                    {uploadMediaMutation.isPending ? (
                      <ActivityIndicator color="#04cf92" />
                    ) : (
                      <Camera color="#5C6B66" size={28} />
                    )}
                    <Text style={styles.addMediaText}>Add image</Text>
                  </Pressable>
                </View>
                <Text style={styles.uploadHint}>JPEG, PNG, or WebP. Up to 20 images, 10 MB each.</Text>

                <View style={{ marginTop: 16 }}>
                  <Text style={styles.formLabel}>Property video (optional)</Text>
                  {store.media.filter((media) => media.mediaType === "video").map((media) => (
                    <View key={media.id} style={styles.uploadedVideoRow}>
                      <Video color="#04cf92" size={20} />
                      <Text numberOfLines={1} style={styles.uploadedVideoText}>{media.url}</Text>
                      <Pressable onPress={() => void handleDeleteMedia(media.id)}>
                        <Trash2 color="#D4183D" size={17} />
                      </Pressable>
                    </View>
                  ))}
                  <Pressable
                    disabled={uploadMediaMutation.isPending}
                    onPress={() => void handlePickMedia("video")}
                    style={styles.videoDropzone}
                  >
                    <Video color="#5C6B66" size={24} />
                    <Text style={styles.videoDropzoneText}>Upload a walkthrough video</Text>
                  </Pressable>
                  <Text style={styles.uploadHint}>MP4 or WebM. Up to 3 videos, 100 MB each.</Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Virtual tour URL (optional)</Text>
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="url"
                    onChangeText={store.setVirtualTourUrl}
                    placeholder="https://example.com/virtual-tour"
                    placeholderTextColor="#899790"
                    style={styles.formInput}
                    value={store.virtualTourUrl}
                  />
                </View>
              </View>
            )}

            {/* STEP 5: REVIEW */}
            {store.currentStep === 5 && (
              <View style={styles.stepFormBody}>
                {/* Ready to Publish Alert Banner */}
                <View style={styles.readyAlertBanner}>
                  <View style={styles.readyAlertTitleRow}>
                    <CheckCircle2 color="#04cf92" size={18} />
                    <Text style={styles.readyAlertTitle}>Ready for verification</Text>
                  </View>
                  <Text style={styles.readyAlertDesc}>
                    Review your listing below. Submission sends it to the verification queue.
                  </Text>
                </View>

                {/* Summary Key-Value Cards Grid */}
                <View style={styles.reviewGrid}>
                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Title</Text>
                    <Text style={styles.reviewCardValue}>{store.title}</Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Category & Subtype</Text>
                    <Text style={styles.reviewCardValue}>
                      {activeTypeConfig.label} ({activeTypeConfig.subtypes.find((s) => s.value === store.subtype)?.label || store.subtype}) ·{" "}
                      {store.listingType === "sale" ? "For Sale" : "For Rent"}
                    </Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Price</Text>
                    <Text style={styles.reviewCardValue}>
                      BDT {Number(store.price).toLocaleString()}
                      {store.subtype === "short-let" ? " (Short-let rate)" : store.listingType === "rent" ? "/mo" : ""}
                    </Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Area Size</Text>
                    <Text style={styles.reviewCardValue}>
                      {store.areaSize || "Not specified"} {store.areaUnit || activeTypeConfig.defaultUnit}
                    </Text>
                  </View>

                  {activeTypeConfig.hasBedrooms && (
                    <View style={styles.reviewCard}>
                      <Text style={styles.reviewCardLabel}>Beds / Baths</Text>
                      <Text style={styles.reviewCardValue}>
                        {store.bedrooms || "0"} Beds / {store.bathrooms || "0"} Baths
                      </Text>
                    </View>
                  )}

                  {activeTypeConfig.hasFloor && (
                    <View style={styles.reviewCard}>
                      <Text style={styles.reviewCardLabel}>Floor Level</Text>
                      <Text style={styles.reviewCardValue}>{store.floor || "Not specified"}</Text>
                    </View>
                  )}

                  {activeTypeConfig.hasFacing && (
                    <View style={styles.reviewCard}>
                      <Text style={styles.reviewCardLabel}>Facing</Text>
                      <Text style={styles.reviewCardValue}>{store.facing || "Not specified"}</Text>
                    </View>
                  )}

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Location</Text>
                    <Text style={styles.reviewCardValue}>
                      {[store.address, store.areaName, store.district].filter(Boolean).join(", ") || "Not specified"}
                    </Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Amenities</Text>
                    <Text style={styles.reviewCardValue}>
                      {Object.values(store.amenities).filter(Boolean).length} features selected
                    </Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Media</Text>
                    <Text style={styles.reviewCardValue}>
                      {store.media.filter((m) => m.mediaType === "image").length} photos
                      {store.media.some((m) => m.mediaType === "video") ? " · 1 video" : ""}
                    </Text>
                  </View>
                </View>
              </View>
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
                    <ChevronRight color="#FFFFFF" size={15} strokeWidth={2} />
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
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Send color="#FFFFFF" size={14} />
                    )}
                    <Text style={[styles.publishBtnText, isPhone && styles.publishBtnTextMobile, isNarrowPhone && styles.btnTextNarrow]}>
                      {isPhone ? "Submit" : "Submit for verification"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
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
          const found = sidebarNavItems.find((i) => i.key === key);
          if (found?.href) router.push(found.href as any);
        }}
        visible={isTablet && mobileDrawerOpen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  outerContainer: {
    width: "100%",
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F8FAF9",
  },
  sidebar: {
    width: 256,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 0.8,
    borderRightColor: "rgba(11,26,23,0.08)",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  sidebarHeader: {
    gap: 16,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#04cf92",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
  },
  brandTextAccent: {
    color: "#04cf92",
  },
  sellerRolePill: {
    backgroundColor: "#E8EEFC",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  sellerRoleText: {
    color: "#2251D6",
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  sidebarNavScroll: {
    gap: 2,
    paddingVertical: 8,
  },
  navItem: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: "#E6FAF4",
  },
  navItemDanger: {
    marginTop: 8,
  },
  navItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  navItemTextActive: {
    color: "#04cf92",
    fontFamily: fonts.bold,
  },
  navItemTextDanger: {
    color: "#D4183D",
  },
  badgeCountPill: {
    backgroundColor: "#F4823A",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: "column",
    zIndex: 10,
  },
  topHeader: {
    minHeight: 64,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderBottomWidth: 0.8,
    borderBottomColor: "rgba(11,26,23,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: 19,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
    letterSpacing: -0.38,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchContainer: {
    width: 256,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F4F6F5",
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    paddingHorizontal: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#FFFFFF",
  },
  iconCircleBtnActive: {
    borderColor: "#04cf92",
    backgroundColor: "#E6FAF4",
  },
  iconCircleBtnPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: "rgba(11,26,23,0.04)",
  },
  notificationWrap: {
    position: "relative",
    zIndex: 10000,
  },
  notificationBadgePill: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F4823A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  notificationBadgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: "#FFFFFF",
    lineHeight: 12,
  },
  notificationDropdown: {
    position: "absolute",
    top: 48,
    right: 0,
    width: 360,
    maxHeight: 460,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.08)",
    shadowColor: "#0B1A17",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
    zIndex: 999,
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11,26,23,0.06)",
    backgroundColor: "#FAFBFB",
  },
  dropdownHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dropdownTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: "#0B1A17",
  },
  unreadCountPill: {
    backgroundColor: "#E6FAF4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  unreadCountPillText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: "#04cf92",
  },
  markAllReadBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  markAllReadText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#04cf92",
  },
  dropdownScroll: {
    maxHeight: 320,
  },
  dropdownScrollContent: {
    padding: 12,
    gap: 8,
  },
  dropdownEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    gap: 10,
  },
  dropdownEmptyText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "rgba(11,26,23,0.5)",
  },
  dropdownFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(11,26,23,0.06)",
    backgroundColor: "#FAFBFB",
    alignItems: "center",
  },
  viewAllNotificationsBtn: {
    paddingVertical: 4,
  },
  viewAllNotificationsText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: "#04cf92",
  },
  headerDotIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F4823A",
  },
  viewSiteBtn: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  viewSiteText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  scrollBody: {
    padding: 24,
    gap: 20,
  },
  scrollBodyPhone: {
    padding: 12,
    gap: 16,
  },
  scrollBodyNarrow: {
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  stepperContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 600,
    width: "100%",
  },
  stepItemWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircleWrap: {
    alignItems: "center",
    gap: 6,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F4F6F5",
    borderWidth: 1.5,
    borderColor: "rgba(11,26,23,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleCurrent: {
    borderColor: "#04cf92",
    backgroundColor: "#FFFFFF",
  },
  stepCircleDone: {
    backgroundColor: "#04cf92",
    borderColor: "#04cf92",
  },
  stepCircleText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#5C6B66",
  },
  stepCircleTextCurrent: {
    color: "#04cf92",
  },
  stepLabelText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  stepLabelTextActive: {
    fontFamily: fonts.bold,
    color: "#0B1A17",
  },
  stepConnectorLine: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(11,26,23,0.12)",
    marginHorizontal: 8,
    marginBottom: 20,
  },
  stepConnectorLineDone: {
    backgroundColor: "#04cf92",
  },
  stepCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.11)",
    shadowColor: "#0B1A17",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
    padding: 32,
    gap: 24,
  },
  stepCardPhone: {
    padding: 16,
    borderRadius: 18,
    gap: 16,
  },
  stepCardNarrow: {
    paddingHorizontal: 10,
    paddingVertical: 14,
    borderRadius: 14,
  },
  errorBanner: {
    backgroundColor: "#FDEBEC",
    borderColor: "#F4B9C1",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  errorBannerText: { color: "#A50F2D", fontFamily: fonts.semiBold, fontSize: 13 },
  stepFormBody: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#0B1A17",
  },
  formLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  formHelperCharCount: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#899790",
  },
  formInput: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F4F6F5",
    borderWidth: 1.2,
    borderColor: "rgba(11,26,23,0.12)",
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  formTextarea: {
    minHeight: 116,
    borderRadius: 16,
    backgroundColor: "#F4F6F5",
    borderWidth: 1.2,
    borderColor: "rgba(11,26,23,0.12)",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
    textAlignVertical: "top",
    lineHeight: 22,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  formTextareaFocused: {
    borderColor: "#00C885",
    backgroundColor: "#FFFFFF",
    shadowColor: "#00C885",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  areaPickerButton: { alignItems: "center", flexDirection: "row", gap: 10 },
  areaPickerText: { color: "#0B1A17", flex: 1, fontFamily: fonts.regular, fontSize: 14 },
  areaPickerPlaceholder: { color: "#899790" },
  formRow: {
    flexDirection: "row",
    gap: 16,
  },
  formRowPhone: {
    flexDirection: "column",
  },
  toggleRow: {
    flexDirection: "row",
    height: 48,
    backgroundColor: "#F4F6F5",
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "rgba(11,26,23,0.12)",
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  toggleBtnActive: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(11,26,23,0.08)",
    shadowColor: "rgba(11,26,23,0.06)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  toggleBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  toggleBtnTextActive: {
    color: "#04cf92",
  },
  toggleGridMobile: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#F4F6F5",
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "rgba(11,26,23,0.12)",
    padding: 4,
    gap: 6,
  },
  toggleGridBtnMobile: {
    width: "48.5%",
    flexGrow: 1,
    minWidth: 0,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  amenitiesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  amenityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.12)",
  },
  amenityPillSelected: {
    borderColor: "#04cf92",
    backgroundColor: "#E6FAF4",
  },
  amenityPillText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
  },
  amenityPillTextSelected: {
    fontFamily: fonts.semiBold,
    color: "#04cf92",
  },
  categoryGrid: {
    flexDirection: "row",
    gap: 12,
  },
  categoryGridMobile: {
    flexDirection: "column",
  },
  categoryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#F8FAF9",
    borderWidth: 1.5,
    borderColor: "rgba(11, 26, 23, 0.08)",
    gap: 6,
    ...(Platform.select({
      web: {
        transition: "all 0.18s ease-in-out",
        cursor: "pointer",
      },
      default: {},
    }) as any),
  },
  categoryCardSelected: {
    borderColor: "#04cf92",
    backgroundColor: "#E6FAF4",
    ...(Platform.select({
      web: {
        boxShadow: "0 2px 10px rgba(4, 207, 146, 0.18)",
      },
      default: {},
    }) as any),
  },
  categoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  categoryIconWrapSelected: {
    backgroundColor: "rgba(4, 207, 146, 0.15)",
  },
  categoryLabel: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: "#0B1A17",
  },
  categoryLabelSelected: {
    color: "#04cf92",
  },
  categoryDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    lineHeight: 16,
  },
  categoryDescSelected: {
    color: "#0B1A17",
  },
  subtypeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  subtypePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.12)",
  },
  subtypePillSelected: {
    borderColor: "#04cf92",
    backgroundColor: "#E6FAF4",
  },
  subtypePillText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#5C6B66",
  },
  subtypePillTextSelected: {
    fontFamily: fonts.semiBold,
    color: "#04cf92",
  },
  unitSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F4F6F5",
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(11, 26, 23, 0.08)",
  },
  unitPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  unitPillActive: {
    backgroundColor: "#04cf92",
  },
  unitPillText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
    textTransform: "uppercase",
  },
  unitPillTextActive: {
    color: "#FFFFFF",
  },
  formHint: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  formHelperText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#5C6B66",
    marginTop: 2,
  },
  mapContainer: {
    height: 320,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapOverlayCenter: {
    position: "absolute",
    top: "35%",
    left: "40%",
    alignItems: "center",
    gap: 6,
  },
  mapTooltip: {
    backgroundColor: "#0B1A17",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mapTooltipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  mapPinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#04cf92",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  mapCoordPill: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  mapCoordText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#0B1A17",
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  mediaCard: {
    width: 140,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  mediaImg: {
    width: "100%",
    height: "100%",
  },
  coverBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#04cf92",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  coverBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  removeMediaButton: {
    alignItems: "center",
    backgroundColor: "rgba(11,26,23,0.82)",
    borderRadius: 16,
    height: 30,
    justifyContent: "center",
    position: "absolute",
    right: 8,
    top: 8,
    width: 30,
  },
  addMediaCard: {
    width: 140,
    height: 140,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(11,26,23,0.2)",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FAFBFB",
  },
  addMediaText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  videoDropzone: {
    height: 100,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(11,26,23,0.2)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FAFBFB",
  },
  videoDropzoneText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  uploadHint: { color: "#6B7D78", fontFamily: fonts.regular, fontSize: 12, marginTop: 8 },
  uploadedVideoRow: {
    alignItems: "center",
    backgroundColor: "#E6FAF4",
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
    padding: 12,
  },
  uploadedVideoText: { color: "#0B1A17", flex: 1, fontFamily: fonts.regular, fontSize: 13 },
  readyAlertBanner: {
    backgroundColor: "#E6FAF4",
    borderRadius: 16,
    padding: 18,
    gap: 6,
  },
  readyAlertTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  readyAlertTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: "#04cf92",
  },
  readyAlertDesc: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  reviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  reviewCard: {
    width: "48%",
    backgroundColor: "#F4F6F5",
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "rgba(11,26,23,0.12)",
    padding: 14,
    gap: 4,
  },
  reviewCardLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  reviewCardValue: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#0B1A17",
  },
  wizardActionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 0.8,
    borderTopColor: "rgba(11,26,23,0.08)",
  },
  backBtn: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.12)",
    paddingHorizontal: 18,
  },
  backBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  wizardRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  saveDraftBtn: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.12)",
    paddingHorizontal: 18,
  },
  saveDraftText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  nextBtn: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#04cf92",
    borderRadius: 999,
    paddingHorizontal: 22,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  publishBtn: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#04cf92",
    borderRadius: 999,
    paddingHorizontal: 22,
  },
  publishBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  wizardActionBarMobile: {
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    borderTopWidth: 1.5,
    borderTopColor: "rgba(11,26,23,0.1)",
  },
  wizardRightActionsMobile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  wizardRightActionsNarrow: {
    gap: 5,
  },
  backBtnMobile: {
    height: 38,
    paddingHorizontal: 12,
    gap: 4,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.12)",
    backgroundColor: "#FFFFFF",
  },
  backBtnNarrow: {
    paddingHorizontal: 9,
    height: 36,
  },
  backBtnTextMobile: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  saveDraftBtnMobile: {
    height: 38,
    paddingHorizontal: 11,
    gap: 4,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.12)",
    backgroundColor: "#FFFFFF",
  },
  saveDraftBtnNarrow: {
    paddingHorizontal: 8,
    height: 36,
  },
  saveDraftTextMobile: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  nextBtnMobile: {
    height: 38,
    paddingHorizontal: 14,
    gap: 4,
    borderRadius: 999,
    backgroundColor: "#04cf92",
  },
  nextBtnNarrow: {
    paddingHorizontal: 10,
    height: 36,
  },
  nextBtnTextMobile: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: "#FFFFFF",
  },
  publishBtnMobile: {
    height: 38,
    paddingHorizontal: 14,
    gap: 4,
    borderRadius: 999,
  },
  publishBtnNarrow: {
    paddingHorizontal: 10,
    height: 36,
  },
  publishBtnTextMobile: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: "#FFFFFF",
  },
  btnTextNarrow: {
    fontSize: 12,
  },
});
