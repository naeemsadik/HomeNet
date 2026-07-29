import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  CalendarCheck2,
  Check,
  ChevronRight,
  Heart,
  LandPlot,
  MapPin,
  MessageSquareText,
  Phone,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react-native";
import { useState } from "react";
import { ImageBackground, Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGrid } from "@/components/PropertyGrid";
import { AppLink, Eyebrow, SectionHeader } from "@/components/ui";
import { allProperties, propertyImages, savedPropertyIds } from "@/data/properties";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, shadow, webPointer } from "@/theme";

export function PropertyDetailsScreen({ propertyId }: { propertyId: number }) {
  const { isPhone, isTablet } = useResponsive();
  const property = allProperties.find((item) => item.id === propertyId) ?? allProperties[0];
  const [savedIds, setSavedIds] = useState(savedPropertyIds);
  const [messageSent, setMessageSent] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(`I would like to know more about ${property.title}.`);
  const saved = savedIds.includes(property.id);
  const gallery = [property.image, propertyImages.interior, propertyImages.living, propertyImages.kitchen, propertyImages.lobby];
  const visibleSecondary = isPhone ? [] : isTablet ? gallery.slice(1, 3) : gallery.slice(1);

  function toggleSaved(id: number) {
    setSavedIds((current) => current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id]);
  }

  return (
    <AppChrome active="property">
      <View style={styles.breadcrumbs}>
        <AppLink href="/buy"><Text style={styles.breadcrumbLink}>Homes for sale</Text></AppLink><ChevronRight color={colors.muted} size={13} />
        <AppLink href="/buy"><Text style={styles.breadcrumbLink}>{property.location.split(",")[0]}</Text></AppLink><ChevronRight color={colors.muted} size={13} />
        <Text numberOfLines={1} style={styles.breadcrumbCurrent}>{property.title}</Text>
      </View>

      <View style={[styles.gallery, isTablet && styles.galleryTablet, isPhone && styles.galleryPhone]}>
        <ImageBackground source={{ uri: gallery[0] }} style={styles.galleryMain} />
        {visibleSecondary.length ? (
          <View style={[styles.gallerySide, isTablet && styles.gallerySideTablet]}>
            {visibleSecondary.map((image, index) => (
              <ImageBackground key={image} source={{ uri: image }} style={[styles.gallerySecondary, isTablet && styles.gallerySecondaryTablet]}>
                {!isTablet && index === visibleSecondary.length - 1 ? <View style={styles.viewPhotos}><Text style={styles.viewPhotosText}>View all photos</Text></View> : null}
              </ImageBackground>
            ))}
          </View>
        ) : null}
      </View>

      <View style={[styles.detailLayout, isTablet && styles.detailLayoutTablet]}>
        <View style={styles.detailContent}>
          <View style={styles.detailHead}>
            <View style={styles.detailHeadCopy}>
              <View style={styles.detailTag}><ShieldCheck color={colors.greenDark} size={14} /><Text style={styles.detailTagText}>{property.tag}</Text></View>
              <Text style={[styles.detailTitle, isPhone && styles.detailTitlePhone]}>{property.title}</Text>
              <View style={styles.detailLocation}><MapPin color={colors.muted} size={14} /><Text style={styles.detailLocationText}>{property.location}</Text></View>
            </View>
            {!isPhone ? <View style={styles.detailActions}><Pressable accessibilityLabel="Share property" onPress={() => void Share.share({ message: `${property.title} — ${property.location}` })} style={[styles.detailAction, webPointer]}><Share2 color="#5F7169" size={17} /></Pressable><Pressable accessibilityLabel={saved ? "Remove from saved homes" : "Save property"} onPress={() => toggleSaved(property.id)} style={[styles.detailAction, webPointer]}><Heart color={saved ? colors.coral : "#5F7169"} fill={saved ? colors.coral : "transparent"} size={17} /></Pressable></View> : null}
          </View>

          <View style={[styles.keyDetails, isPhone && styles.keyDetailsPhone]}>
            <View style={[styles.priceDetail, isPhone && styles.priceDetailPhone]}><Text style={styles.keyLabel}>Asking price</Text><Text style={styles.askingPrice}>{property.price}</Text></View>
            <View style={styles.keyDetail}><BedDouble color={colors.green} size={18} /><View><Text style={styles.keyValue}>{property.beds}</Text><Text style={styles.keyLabel}>Bedrooms</Text></View></View>
            <View style={styles.keyDetail}><Bath color={colors.green} size={18} /><View><Text style={styles.keyValue}>{property.baths}</Text><Text style={styles.keyLabel}>Bathrooms</Text></View></View>
            <View style={[styles.keyDetail, styles.keyDetailLast]}><LandPlot color={colors.green} size={18} /><View><Text style={styles.keyValue}>{property.area.replace(" sq ft", "")}</Text><Text style={styles.keyLabel}>Square feet</Text></View></View>
          </View>

          <LinearGradient colors={["#EAF7F1", "#EEF3FB"]} end={{ x: 1, y: 0 }} style={styles.aiScore}>
            <LinearGradient colors={[colors.green, colors.blue]} style={styles.aiScoreIcon}><Sparkles color={colors.white} size={21} /></LinearGradient>
            <View style={styles.aiScoreCopy}><Eyebrow style={styles.aiScoreEyebrow}>HomeNet price intelligence</Eyebrow><Text style={styles.aiScoreTitle}>This property is priced within its fair-value range</Text><Text style={styles.aiScoreDescription}>Compared with 46 verified homes nearby and current neighborhood demand.</Text></View>
            {!isPhone ? <View style={styles.scoreRing}><Text style={styles.scoreValue}>{property.score}</Text><Text style={styles.scoreLabel}>AI score</Text></View> : null}
          </LinearGradient>

          <View style={styles.copySection}><Text style={styles.copyTitle}>About this home</Text><Text style={styles.copyText}>A carefully planned residence with generous natural light, quiet bedrooms, and a flowing living area designed for everyday family life. The building combines secure access with practical amenities and close links to schools, parks, and neighborhood services.</Text><Text style={styles.copyText}>Recent maintenance and verified documents make this a strong option for buyers looking to move with fewer unknowns.</Text></View>
          <View style={styles.copySection}>
            <Text style={styles.copyTitle}>Features and amenities</Text>
            <View style={styles.amenities}>{["Backup power", "Secure parking", "24-hour security", "Passenger lift", "Service lift", "Rooftop access", "Natural gas", "Verified ownership"].map((amenity) => <View key={amenity} style={[styles.amenity, isPhone && styles.amenityPhone]}><Check color={colors.green} size={13} /><Text style={styles.amenityText}>{amenity}</Text></View>)}</View>
          </View>
        </View>

        <View style={[styles.inquiryCard, isTablet && styles.inquiryCardTablet]}>
          <Eyebrow style={styles.inquiryEyebrow}>Speak with a property advisor</Eyebrow>
          <Text style={styles.inquiryTitle}>Interested in this home?</Text>
          <Text style={styles.inquiryCopy}>Ask a question or schedule a private viewing with a verified advisor.</Text>
          <View style={styles.form}>
            <View style={styles.formGroup}><Text style={styles.formLabel}>Name</Text><TextInput onChangeText={setName} placeholder="Your full name" placeholderTextColor="#899790" style={styles.formInput} value={name} /></View>
            <View style={styles.formGroup}><Text style={styles.formLabel}>Phone</Text><TextInput keyboardType="phone-pad" onChangeText={setPhone} placeholder="Phone number" placeholderTextColor="#899790" style={styles.formInput} value={phone} /></View>
            <View style={styles.formGroup}><Text style={styles.formLabel}>Message</Text><TextInput multiline onChangeText={setMessage} style={[styles.formInput, styles.messageInput]} value={message} /></View>
            <Pressable onPress={() => setMessageSent(Boolean(name && phone))} style={[styles.inquiryButton, webPointer]}><MessageSquareText color={colors.white} size={15} /><Text style={styles.inquiryButtonText}>Send inquiry</Text></Pressable>
          </View>
          {messageSent ? <View style={styles.success}><Check color={colors.greenDark} size={14} /><Text style={styles.successText}>Inquiry sent. An advisor will contact you shortly.</Text></View> : null}
          <View style={styles.divider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>or</Text></View>
          <AppLink href="tel:+8801700000000" style={styles.callButton}><Phone color={colors.green} size={15} /><Text style={styles.callButtonText}>Call property advisor</Text></AppLink>
          <Pressable style={[styles.scheduleButton, webPointer]}><CalendarCheck2 color={colors.green} size={15} /><Text style={styles.scheduleText}>Schedule a viewing</Text><ArrowRight color={colors.green} size={14} /></Pressable>
        </View>
      </View>

      <View style={styles.similarSection}><SectionHeader eyebrow="Compare nearby" href="/buy" title="Similar verified homes" /><PropertyGrid>{allProperties.filter((item) => item.id !== property.id).slice(0, 3).map((item) => <PropertyCard key={item.id} onSave={() => toggleSaved(item.id)} property={item} saved={savedIds.includes(item.id)} />)}</PropertyGrid></View>
      <AppLink href="/buy" style={styles.backLink}><ArrowLeft color={colors.green} size={14} /><Text style={styles.backLinkText}>Back to search results</Text></AppLink>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  breadcrumbs: { flexDirection: "row", alignItems: "center", gap: 6, overflow: "hidden", marginTop: 4, marginBottom: 15 },
  breadcrumbLink: { color: colors.muted, fontFamily: fonts.regular, fontSize: 8 },
  breadcrumbCurrent: { minWidth: 0, flex: 1, color: colors.ink, fontFamily: fonts.regular, fontSize: 8 },
  gallery: { height: 430, flexDirection: "row", gap: 8, overflow: "hidden", borderRadius: 19 },
  galleryTablet: { height: 400 },
  galleryPhone: { height: 330 },
  galleryMain: { flex: 1.4, backgroundColor: "#DCE5E1" },
  gallerySide: { flex: 1.2, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gallerySideTablet: { flex: 0.65, flexDirection: "column", flexWrap: "nowrap" },
  gallerySecondary: { width: "49%", height: "49%", justifyContent: "flex-end", alignItems: "flex-end", backgroundColor: "#DCE5E1" },
  gallerySecondaryTablet: { width: "100%", flex: 1, height: "auto" },
  viewPhotos: { margin: 9, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 7, backgroundColor: "rgba(255,255,255,0.92)" },
  viewPhotosText: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 8 },
  detailLayout: { flexDirection: "row", alignItems: "flex-start", gap: 30, marginTop: 27 },
  detailLayoutTablet: { flexDirection: "column", gap: 20 },
  detailContent: { minWidth: 0, flex: 1 },
  detailHead: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 18 },
  detailHeadCopy: { minWidth: 0, flex: 1 },
  detailTag: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 99, backgroundColor: colors.greenLight },
  detailTagText: { color: colors.greenDark, fontFamily: fonts.extraBold, fontSize: 8 },
  detailTitle: { maxWidth: 720, marginTop: 11, marginBottom: 7, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 42, lineHeight: 45, letterSpacing: -2.3 },
  detailTitlePhone: { maxWidth: 340, fontSize: 31, lineHeight: 34, letterSpacing: -1.7 },
  detailLocation: { flexDirection: "row", alignItems: "center", gap: 5 },
  detailLocationText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 10 },
  detailActions: { flexDirection: "row", gap: 7 },
  detailAction: { width: 37, height: 37, alignItems: "center", justifyContent: "center", borderRadius: 19, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  keyDetails: { flexDirection: "row", marginTop: 25, overflow: "hidden", borderRadius: 13, borderWidth: 1, borderColor: colors.line },
  keyDetailsPhone: { flexWrap: "wrap" },
  priceDetail: { flex: 1.5, minHeight: 80, justifyContent: "center", alignItems: "flex-start", paddingLeft: 19, borderRightWidth: 1, borderRightColor: colors.line },
  priceDetailPhone: { flexBasis: "100%", minHeight: 70, borderRightWidth: 0, borderBottomWidth: 1, borderBottomColor: colors.line },
  keyDetail: { minWidth: 0, flex: 1, minHeight: 80, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, padding: 12, borderRightWidth: 1, borderRightColor: colors.line },
  keyDetailLast: { borderRightWidth: 0 },
  keyValue: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 13 },
  keyLabel: { color: colors.muted, fontFamily: fonts.regular, fontSize: 7 },
  askingPrice: { marginTop: 4, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 19, letterSpacing: -0.8 },
  aiScore: { flexDirection: "row", alignItems: "center", gap: 13, marginTop: 19, padding: 17, borderRadius: 14, borderWidth: 1, borderColor: "#DFEAE5" },
  aiScoreIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  aiScoreCopy: { minWidth: 0, flex: 1 },
  aiScoreEyebrow: { marginBottom: 4 },
  aiScoreTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 10 },
  aiScoreDescription: { marginTop: 4, color: colors.muted, fontFamily: fonts.regular, fontSize: 7 },
  scoreRing: { width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: 27, backgroundColor: colors.white, borderWidth: 4, borderColor: "#9FCFBB" },
  scoreValue: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 14 },
  scoreLabel: { color: colors.muted, fontFamily: fonts.regular, fontSize: 6 },
  copySection: { marginTop: 27, paddingTop: 25, borderTopWidth: 1, borderTopColor: colors.line },
  copyTitle: { marginBottom: 12, color: colors.ink, fontFamily: fonts.extraBold, fontSize: 17, letterSpacing: -0.6 },
  copyText: { marginBottom: 10, color: colors.muted, fontFamily: fonts.regular, fontSize: 9, lineHeight: 16 },
  amenities: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  amenity: { width: "48%", flexDirection: "row", alignItems: "center", gap: 7 },
  amenityPhone: { width: "100%" },
  amenityText: { color: "#53675E", fontFamily: fonts.regular, fontSize: 9 },
  inquiryCard: { width: 315, padding: 21, borderRadius: 16, backgroundColor: "#FBFDFC", borderWidth: 1, borderColor: colors.line, ...shadow },
  inquiryCardTablet: { width: "100%" },
  inquiryEyebrow: { marginBottom: 7 },
  inquiryTitle: { color: colors.ink, fontFamily: fonts.extraBold, fontSize: 18, letterSpacing: -0.7 },
  inquiryCopy: { marginTop: 7, marginBottom: 15, color: colors.muted, fontFamily: fonts.regular, fontSize: 8, lineHeight: 12 },
  form: { gap: 10 },
  formGroup: { gap: 5 },
  formLabel: { color: "#53675E", fontFamily: fonts.extraBold, fontSize: 7 },
  formInput: { width: "100%", minHeight: 38, padding: 10, color: colors.ink, fontFamily: fonts.regular, fontSize: 8, borderRadius: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  messageInput: { minHeight: 76, textAlignVertical: "top" },
  inquiryButton: { width: "100%", minHeight: 41, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 999, backgroundColor: colors.green },
  inquiryButtonText: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 10 },
  success: { flexDirection: "row", alignItems: "flex-start", gap: 5, marginTop: 10, padding: 9, borderRadius: 8, backgroundColor: colors.greenLight },
  successText: { flex: 1, color: colors.greenDark, fontFamily: fonts.regular, fontSize: 7, lineHeight: 10 },
  divider: { position: "relative", alignItems: "center", justifyContent: "center", marginVertical: 15 },
  dividerLine: { position: "absolute", right: 0, left: 0, height: 1, backgroundColor: colors.line },
  dividerText: { paddingHorizontal: 8, color: "#9AA69F", fontFamily: fonts.regular, fontSize: 7, backgroundColor: "#FBFDFC" },
  callButton: { width: "100%", minHeight: 41, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  callButtonText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 10 },
  scheduleButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8, padding: 8 },
  scheduleText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 8 },
  similarSection: { marginTop: 54 },
  backLink: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, marginTop: 30 },
  backLinkText: { color: colors.green, fontFamily: fonts.extraBold, fontSize: 8 },
});
