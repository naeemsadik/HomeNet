import { styles } from "../PropertyDetailScreen.styles";
import { colorTokens, fonts, radius } from "@/theme";
import { en } from "@/i18n/locales/en";
import { bn } from "@/i18n/locales/bn";

describe("PropertyDetailScreen WhatsApp & Seller Action Button Styles", () => {
  it("conforms to compact geometry and production real estate UI specifications", () => {
    expect(styles.whatsAppActionBtn).toMatchObject({
      height: 40,
      minHeight: 40,
      maxHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 0,
      paddingHorizontal: 16,
      borderRadius: radius.pill,
      borderWidth: 1.25,
      borderColor: colorTokens.brand,
      backgroundColor: colorTokens.surface,
    });
  });

  it("ensures WhatsApp icon has inline flex rules without extraneous margins", () => {
    expect(styles.whatsAppIcon).toMatchObject({
      flexShrink: 0,
    });
  });

  it("ensures sleek single-line containment and typography tokens", () => {
    expect(styles.whatsAppActionText).toMatchObject({
      fontSize: 13,
      fontFamily: fonts.semiBold,
      color: colorTokens.brandText,
      letterSpacing: 0.1,
      flexShrink: 1,
    });
  });

  it("ensures action row cohesion with companion Call Seller button", () => {
    expect(styles.sellerActionBtn).toMatchObject({
      height: 40,
      minHeight: 40,
      maxHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 0,
      paddingHorizontal: 16,
      borderRadius: radius.pill,
      borderWidth: 1.25,
      borderColor: colorTokens.border,
      backgroundColor: colorTokens.surface,
    });

    expect(styles.sellerActionText).toMatchObject({
      fontSize: 13,
      fontFamily: fonts.semiBold,
      color: colorTokens.ink,
      letterSpacing: 0.1,
      flexShrink: 1,
    });
  });

  it("maintains 1:1 locale parity for the simplified Contact Owner copy", () => {
    expect(en.propertyDetail.whatsappAgent).toBe("Contact Owner");
    expect(bn.propertyDetail.whatsappAgent).toBe("মালিকের সাথে যোগাযোগ করুন");
  });
});
