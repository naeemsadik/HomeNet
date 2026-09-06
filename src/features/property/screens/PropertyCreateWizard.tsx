import { router } from "expo-router";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart2,
  Bell,
  Building2,
  Camera,
  Check,
  CheckCircle2,
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
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { AreaPicker } from "@/components/AreaPicker";
import { AppLink } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { toApiError } from "@/services/apiClient";
import type { UploadInput } from "@/services/upload";
import { colors, fonts, webPointer } from "@/theme";
import type { Area, PropertyType, UpsertPropertyDto } from "@/types/api";
import {
  useCreateProperty,
  useDeleteMedia,
  useSubmitForVerification,
  useUpdateProperty,
  useUploadMedia,
} from "../hooks/usePropertyMutations";
import { usePropertyWizardStore } from "../stores/propertyWizardStore";

export function PropertyCreateWizard() {
  const { isPhone, isTablet } = useResponsive();
  const store = usePropertyWizardStore();
  const createPropertyMutation = useCreateProperty();
  const updatePropertyMutation = useUpdateProperty();
  const uploadMediaMutation = useUploadMedia();
  const deleteMediaMutation = useDeleteMedia();
  const submitMutation = useSubmitForVerification();
  const [searchQuery, setSearchQuery] = useState("");
  const [areaPickerVisible, setAreaPickerVisible] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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

  const amenityOptions = [
    "Lift",
    "Parking",
    "Generator",
    "Gym",
    "Pool",
    "Security",
    "Garden",
    "Smart Home",
    "CCTV",
    "Rooftop",
    "Servant Quarter",
    "Mosque",
  ];

  const propertyTypes: { value: PropertyType; label: string }[] = [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "land", label: "Land" },
    { value: "parking", label: "Parking" },
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
    area_unit: "sqft",
    location_lat: store.locationLat ?? undefined,
    location_lng: store.locationLng ?? undefined,
    address: store.address.trim() || undefined,
    amenities: {
      bedrooms: store.bedrooms ? Number(store.bedrooms) : undefined,
      bathrooms: store.bathrooms ? Number(store.bathrooms) : undefined,
      floor: store.floor ? Number(store.floor) : undefined,
      facing: store.facing.trim() || undefined,
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

  // Sidebar items
  const sidebarNavItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/seller" },
    { key: "listings", label: "My Listings", icon: Building2, href: "/my-properties" },
    { key: "create", label: "Create Property", icon: PlusCircle, href: "/property/create", active: true },
    { key: "verification", label: "Verification", icon: ShieldCheck },
    { key: "boost", label: "Boost Listings", icon: Rocket },
    { key: "insights", label: "AI Insights", icon: Sparkles, href: "/ai-finder" },
    { key: "analytics", label: "Analytics", icon: BarChart2, href: "/market" },
    { key: "payments", label: "Payments", icon: CreditCard },
    { key: "notifications", label: "Notifications", icon: Bell, badgeCount: 3, href: "/notifications" },
    { key: "profile", label: "Profile", icon: User, href: "/profile" },
    { key: "settings", label: "Settings", icon: Settings, href: "/settings" },
    { key: "help", label: "Help Center", icon: CircleHelp, href: "/about" },
    { key: "logout", label: "Logout", icon: LogOut, danger: true, href: "/" },
  ];

  return (
    <View style={styles.outerContainer}>
      {/* Sidebar (Desktop View) */}
      {!isTablet && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <View style={styles.brandRow}>
              <View style={styles.brandIconBg}>
                <Building2 color="#FFFFFF" size={20} />
              </View>
              <Text style={styles.brandText}>
                Home<Text style={styles.brandTextAccent}>net</Text>
              </Text>
            </View>
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
                  style={[
                    styles.navItem,
                    item.active && styles.navItemActive,
                    item.danger && styles.navItemDanger,
                  ]}
                >
                  <IconComp
                    color={item.danger ? "#D4183D" : item.active ? "#0F6D55" : "#5C6B66"}
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
        <View style={styles.topHeader}>
          <Text style={styles.headerTitle}>Create Property</Text>

          <View style={styles.headerActions}>
            {!isPhone && (
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
            )}

            <AppLink href="/notifications" style={styles.iconCircleBtn}>
              <Bell color="#0B1A17" size={19} />
              <View style={styles.headerDotIndicator} />
            </AppLink>

            <AppLink href="/" style={styles.viewSiteBtn}>
              <Globe color="#0B1A17" size={16} />
              <Text style={styles.viewSiteText}>View site</Text>
            </AppLink>
          </View>
        </View>

        {/* Scrollable Wizard Body */}
        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
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
          <View style={styles.stepCard}>
            {localError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{localError}</Text>
              </View>
            ) : null}
            {/* STEP 1: BASICS */}
            {store.currentStep === 1 && (
              <View style={styles.stepFormBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Property Title</Text>
                  <TextInput
                    onChangeText={(v) => store.setBasics({ title: v })}
                    placeholder="e.g. Premium 3 Bedroom Apartment"
                    placeholderTextColor="#899790"
                    style={styles.formInput}
                    value={store.title}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Property category</Text>
                  <View style={styles.toggleRow}>
                    {propertyTypes.map((propertyType) => (
                      <Pressable
                        key={propertyType.value}
                        onPress={() => store.setBasics({ type: propertyType.value })}
                        style={[
                          styles.toggleBtn,
                          store.type === propertyType.value && styles.toggleBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.toggleBtnText,
                            store.type === propertyType.value && styles.toggleBtnTextActive,
                          ]}
                        >
                          {propertyType.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Subtype</Text>
                    <TextInput
                      onChangeText={(v) => store.setBasics({ subtype: v })}
                      placeholder="e.g. Apartment / House / Commercial"
                      placeholderTextColor="#899790"
                      style={styles.formInput}
                      value={store.subtype}
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Listing Purpose</Text>
                    <View style={styles.toggleRow}>
                      <Pressable
                        onPress={() => store.setBasics({ listingType: "sale" })}
                        style={[
                          styles.toggleBtn,
                          store.listingType === "sale" && styles.toggleBtnActive,
                        ]}
                      >
                        <Text style={[styles.toggleBtnText, store.listingType === "sale" && styles.toggleBtnTextActive]}>
                          For Sale
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => store.setBasics({ listingType: "rent" })}
                        style={[
                          styles.toggleBtn,
                          store.listingType === "rent" && styles.toggleBtnActive,
                        ]}
                      >
                        <Text style={[styles.toggleBtnText, store.listingType === "rent" && styles.toggleBtnTextActive]}>
                          For Rent
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Description</Text>
                  <TextInput
                    multiline
                    numberOfLines={4}
                    onChangeText={(v) => store.setBasics({ description: v })}
                    placeholder="Describe your property details, condition, and key features..."
                    placeholderTextColor="#899790"
                    style={[styles.formInput, { height: 100, textAlignVertical: "top" }]}
                    value={store.description}
                  />
                </View>
              </View>
            )}

            {/* STEP 2: DETAILS (Figma Node 37:4988) */}
            {store.currentStep === 2 && (
              <View style={styles.stepFormBody}>
                {/* Price & Area Size Row */}
                <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Price (BDT)</Text>
                    <TextInput
                      keyboardType="numeric"
                      onChangeText={(v) => store.setDetails({ price: v })}
                      placeholder="e.g. 18,500,000"
                      placeholderTextColor="#899790"
                      style={styles.formInput}
                      value={store.price}
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Area (sqft)</Text>
                    <TextInput
                      keyboardType="numeric"
                      onChangeText={(v) => store.setDetails({ areaSize: v })}
                      placeholder="e.g. 2150"
                      placeholderTextColor="#899790"
                      style={styles.formInput}
                      value={store.areaSize}
                    />
                  </View>
                </View>

                {/* Bedrooms, Bathrooms, Floor, Facing Row */}
                <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
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

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Floor</Text>
                    <TextInput
                      keyboardType="numeric"
                      onChangeText={(v) => store.setDetails({ floor: v })}
                      placeholder="7"
                      placeholderTextColor="#899790"
                      style={styles.formInput}
                      value={store.floor}
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Facing</Text>
                    <TextInput
                      onChangeText={(v) => store.setDetails({ facing: v })}
                      placeholder="South / East"
                      placeholderTextColor="#899790"
                      style={styles.formInput}
                      value={store.facing}
                    />
                  </View>
                </View>

                {/* Amenities Pill Checklist */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Amenities</Text>
                  <View style={styles.amenitiesWrap}>
                    {amenityOptions.map((item) => {
                      const isSelected = !!store.amenities[item];
                      return (
                        <Pressable
                          key={item}
                          onPress={() => store.toggleAmenity(item)}
                          style={[
                            styles.amenityPill,
                            isSelected && styles.amenityPillSelected,
                            webPointer,
                          ]}
                        >
                          {isSelected ? <Check color="#0F6D55" size={14} /> : null}
                          <Text style={[styles.amenityPillText, isSelected && styles.amenityPillTextSelected]}>
                            {item}
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
                      <MapPin color="#0F6D55" size={17} />
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
                      <ActivityIndicator color="#0F6D55" />
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
                      <Video color="#0F6D55" size={20} />
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
                    <CheckCircle2 color="#0F6D55" size={18} />
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
                    <Text style={styles.reviewCardLabel}>Type</Text>
                    <Text style={styles.reviewCardValue}>
                      {store.subtype || store.type} · {store.listingType === "sale" ? "For Sale" : "For Rent"}
                    </Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Price</Text>
                    <Text style={styles.reviewCardValue}>
                      BDT {Number(store.price).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Area</Text>
                    <Text style={styles.reviewCardValue}>{store.areaSize || "Not specified"} sqft</Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Beds / Baths</Text>
                    <Text style={styles.reviewCardValue}>
                      {store.bedrooms || "Not specified"} / {store.bathrooms || "Not specified"}
                    </Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Facing</Text>
                    <Text style={styles.reviewCardValue}>{store.facing || "Not specified"}</Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Location</Text>
                    <Text style={styles.reviewCardValue}>{store.address || "Not specified"}</Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Amenities</Text>
                    <Text style={styles.reviewCardValue}>
                      {Object.values(store.amenities).filter(Boolean).length} selected
                    </Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Media</Text>
                    <Text style={styles.reviewCardValue}>{store.media.length} uploaded</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Bottom Wizard Actions Navigation Bar */}
            <View style={styles.wizardActionBar}>
              {store.currentStep > 1 ? (
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

              <View style={styles.wizardRightActions}>
                <Pressable
                  disabled={store.isSubmitting}
                  onPress={() => void handleSaveDraft()}
                  style={({ pressed }) => [styles.saveDraftBtn, webPointer, pressed && styles.pressed]}
                >
                  <Building2 color="#0B1A17" size={16} />
                  <Text style={styles.saveDraftText}>Save draft</Text>
                </Pressable>

                {store.currentStep < 5 ? (
                  <Pressable
                    disabled={store.isSubmitting}
                    onPress={() => void handleNext()}
                    style={({ pressed }) => [styles.nextBtn, webPointer, pressed && styles.pressed]}
                  >
                    <Text style={styles.nextBtnText}>Next</Text>
                    <ArrowLeft color="#FFFFFF" size={16} style={{ transform: [{ rotate: "180deg" }] }} />
                  </Pressable>
                ) : (
                  <Pressable
                    disabled={store.isSubmitting}
                    onPress={() => void handleSubmit()}
                    style={({ pressed }) => [styles.publishBtn, webPointer, pressed && styles.pressed]}
                  >
                    {store.isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Send color="#FFFFFF" size={16} />
                    )}
                    <Text style={styles.publishBtnText}>Submit for verification</Text>
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
    backgroundColor: "#0F6D55",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
  },
  brandTextAccent: {
    color: "#0F6D55",
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
    backgroundColor: "#E7F2EE",
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
    color: "#0F6D55",
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
  },
  headerTitle: {
    fontSize: 19,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
    letterSpacing: -0.38,
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
    borderColor: "#0F6D55",
    backgroundColor: "#FFFFFF",
  },
  stepCircleDone: {
    backgroundColor: "#0F6D55",
    borderColor: "#0F6D55",
  },
  stepCircleText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#5C6B66",
  },
  stepCircleTextCurrent: {
    color: "#0F6D55",
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
    backgroundColor: "#0F6D55",
  },
  stepCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    padding: 32,
    gap: 24,
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
  formInput: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F4F6F5",
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
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
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: "#FFFFFF",
  },
  toggleBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#5C6B66",
  },
  toggleBtnTextActive: {
    color: "#0F6D55",
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
    borderColor: "#0F6D55",
    backgroundColor: "#E7F2EE",
  },
  amenityPillText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
  },
  amenityPillTextSelected: {
    fontFamily: fonts.semiBold,
    color: "#0F6D55",
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
    backgroundColor: "#0F6D55",
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
    backgroundColor: "#0F6D55",
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
    backgroundColor: "#E7F2EE",
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
    padding: 12,
  },
  uploadedVideoText: { color: "#0B1A17", flex: 1, fontFamily: fonts.regular, fontSize: 13 },
  readyAlertBanner: {
    backgroundColor: "#E7F2EE",
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
    color: "#0F6D55",
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
    borderRadius: 12,
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
    backgroundColor: "#0F6D55",
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
    backgroundColor: "#0F6D55",
    borderRadius: 999,
    paddingHorizontal: 22,
  },
  publishBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
});
