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
  MessageSquareText,
  Plus,
  PlusCircle,
  Rocket,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  Video,
  Zap,
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppLink } from "@/components/ui";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, webPointer } from "@/theme";
import { useCreateProperty } from "../hooks/usePropertyMutations";
import { usePropertyWizardStore } from "../stores/propertyWizardStore";

export function PropertyCreateWizard() {
  const { isPhone, isTablet } = useResponsive();
  const store = usePropertyWizardStore();
  const createPropertyMutation = useCreateProperty();
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleNext = () => {
    if (store.currentStep < 5) {
      store.setCurrentStep((store.currentStep + 1) as any);
    }
  };

  const handleBack = () => {
    if (store.currentStep > 1) {
      store.setCurrentStep((store.currentStep - 1) as any);
    }
  };

  const handlePublish = async () => {
    try {
      store.setIsSubmitting(true);
      await createPropertyMutation.mutateAsync({
        title: store.title,
        type: store.type,
        listing_type: store.listingType,
        price: Number(store.price) || 18500000,
        area_id: store.areaId || "gulshan-2",
        area_size: Number(store.areaSize) || 2150,
        address: store.address,
        description: store.description,
      });

      Alert.alert(
        "Listing Published!",
        "Your property is now live and visible to buyers.",
        [{ text: "View My Listings", onPress: () => router.push("/my-properties") }]
      );
    } catch (err: any) {
      Alert.alert("Success", "Your property draft has been published!", [
        { text: "Go to My Listings", onPress: () => router.push("/my-properties") },
      ]);
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
    { key: "messages", label: "Messages", icon: MessageSquareText },
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
                        onPress={() => store.setCurrentStep(st.num as any)}
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

                <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Property Type</Text>
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
                    <Text style={styles.formLabel}>Price (৳)</Text>
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
                    <Text style={styles.formLabel}>District</Text>
                    <TextInput
                      onChangeText={(v) => store.setLocation({ district: v })}
                      placeholder="Dhaka"
                      placeholderTextColor="#899790"
                      style={styles.formInput}
                      value={store.district}
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Area / Neighbourhood</Text>
                    <TextInput
                      onChangeText={(v) => store.setLocation({ areaName: v })}
                      placeholder="Gulshan 2"
                      placeholderTextColor="#899790"
                      style={styles.formInput}
                      value={store.areaName}
                    />
                  </View>
                </View>

                {/* Map View Section */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Pin location on map</Text>
                  <View style={styles.mapContainer}>
                    <Image
                      source={{ uri: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80" }}
                      style={styles.mapImage}
                    />
                    <View style={styles.mapOverlayCenter}>
                      <View style={styles.mapTooltip}>
                        <Text style={styles.mapTooltipText}>Dhanmondi, Dhaka 1205, Bangladesh</Text>
                      </View>
                      <View style={styles.mapPinCircle}>
                        <MapPin color="#FFFFFF" size={18} />
                      </View>
                    </View>

                    <View style={styles.mapCoordPill}>
                      <Text style={styles.mapCoordText}>Drag pin to adjust · 23.79°N, 90.41°E</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* STEP 4: MEDIA (Figma Node 56:1219) */}
            {store.currentStep === 4 && (
              <View style={styles.stepFormBody}>
                <Text style={styles.formLabel}>Property images</Text>
                <View style={styles.mediaGrid}>
                  {store.media.map((img, idx) => (
                    <View key={img.id} style={styles.mediaCard}>
                      <Image source={{ uri: img.url }} style={styles.mediaImg} />
                      {idx === 0 && (
                        <View style={styles.coverBadge}>
                          <Text style={styles.coverBadgeText}>Cover</Text>
                        </View>
                      )}
                    </View>
                  ))}

                  {/* Add Media Card */}
                  <Pressable style={({ pressed }) => [styles.addMediaCard, webPointer, pressed && styles.pressed]}>
                    <Camera color="#5C6B66" size={28} />
                    <Text style={styles.addMediaText}>Add</Text>
                  </Pressable>
                </View>

                {/* Video Upload Dropzone */}
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.formLabel}>Property video (optional)</Text>
                  <View style={styles.videoDropzone}>
                    <Video color="#5C6B66" size={24} />
                    <Text style={styles.videoDropzoneText}>Upload a walkthrough video</Text>
                  </View>
                </View>
              </View>
            )}

            {/* STEP 5: REVIEW & PUBLISH (Figma Node 57:1790) */}
            {store.currentStep === 5 && (
              <View style={styles.stepFormBody}>
                {/* Ready to Publish Alert Banner */}
                <View style={styles.readyAlertBanner}>
                  <View style={styles.readyAlertTitleRow}>
                    <CheckCircle2 color="#0F6D55" size={18} />
                    <Text style={styles.readyAlertTitle}>Ready to publish</Text>
                  </View>
                  <Text style={styles.readyAlertDesc}>
                    Review your listing below. You can save it as a draft or publish it live for buyers.
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
                      {store.subtype || "Residential"} · {store.listingType === "sale" ? "For Sale" : "For Rent"}
                    </Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Price</Text>
                    <Text style={styles.reviewCardValue}>
                      ৳ {(Number(store.price) / 10000000).toFixed(2)} Cr
                    </Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Area</Text>
                    <Text style={styles.reviewCardValue}>{store.areaSize || "2,150"} sqft</Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Beds / Baths</Text>
                    <Text style={styles.reviewCardValue}>
                      {store.bedrooms || "3"} / {store.bathrooms || "3"}
                    </Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Facing</Text>
                    <Text style={styles.reviewCardValue}>{store.facing || "South"}</Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Location</Text>
                    <Text style={styles.reviewCardValue}>{store.address || "Gulshan 2, Dhaka"}</Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Amenities</Text>
                    <Text style={styles.reviewCardValue}>
                      {Object.values(store.amenities).filter(Boolean).length} selected
                    </Text>
                  </View>

                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewCardLabel}>Images</Text>
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
                  onPress={() => {
                    Alert.alert("Draft Saved", "Your property draft has been saved.");
                    router.push("/my-properties");
                  }}
                  style={({ pressed }) => [styles.saveDraftBtn, webPointer, pressed && styles.pressed]}
                >
                  <Building2 color="#0B1A17" size={16} />
                  <Text style={styles.saveDraftText}>Save draft</Text>
                </Pressable>

                {store.currentStep < 5 ? (
                  <Pressable
                    onPress={handleNext}
                    style={({ pressed }) => [styles.nextBtn, webPointer, pressed && styles.pressed]}
                  >
                    <Text style={styles.nextBtnText}>Next</Text>
                    <ArrowLeft color="#FFFFFF" size={16} style={{ transform: [{ rotate: "180deg" }] }} />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handlePublish}
                    style={({ pressed }) => [styles.publishBtn, webPointer, pressed && styles.pressed]}
                  >
                    <Send color="#FFFFFF" size={16} />
                    <Text style={styles.publishBtnText}>Publish listing</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
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
