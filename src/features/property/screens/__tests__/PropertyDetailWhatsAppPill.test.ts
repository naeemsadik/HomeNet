import { styles } from "../PropertyDetailScreen.styles";
import { fonts } from "@/theme";
import { en } from "@/i18n/locales/en";
import { bn } from "@/i18n/locales/bn";

describe("PropertyDetailScreen WhatsApp & Seller Action Button Styles", () => {
  it("conforms to compact geometry and production real estate UI specifications", () => {
    expect(styles.whatsAppActionBtn).toMatchObject({
      height: 44,
      minHeight: 44,
      maxHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 0,
      paddingHorizontal: 16,
      borderRadius: 4,
      borderWidth: 0,
      backgroundColor: "#0B1A17",
    });
  });

  it("ensures WhatsApp icon has inline flex rules without extraneous margins", () => {
    expect(styles.whatsAppIcon).toMatchObject({
      flexShrink: 0,
    });
  });

  it("ensures sleek single-line containment and typography tokens", () => {
    expect(styles.whatsAppActionText).toMatchObject({
      fontSize: 14,
      fontFamily: fonts.bold,
      color: "#FFFFFF",
      letterSpacing: 0.1,
      flexShrink: 1,
    });
  });

  it("ensures action row cohesion with companion Call Seller button", () => {
    expect(styles.sellerActionBtn).toMatchObject({
      height: 44,
      minHeight: 44,
      maxHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 0,
      paddingHorizontal: 16,
      borderRadius: 4,
      borderWidth: 0,
      backgroundColor: "#00D284",
    });

    expect(styles.sellerActionText).toMatchObject({
      fontSize: 14,
      fontFamily: fonts.bold,
      color: "#0B1A17",
      letterSpacing: 0.1,
      flexShrink: 1,
    });
  });

  it("maintains 1:1 locale parity for the simplified Contact Owner copy", () => {
    expect(en.propertyDetail.whatsappAgent).toBe("Contact Owner");
    expect(bn.propertyDetail.whatsappAgent).toBe("মালিকের সাথে যোগাযোগ করুন");
  });
});
