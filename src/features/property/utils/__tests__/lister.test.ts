import { contactPhone, listerDisplay, toWhatsAppFormat, whatsappUrl } from "../lister";

const person = {
  id: "u1",
  full_name: "Karim Ali",
  avatar_url: "https://cdn/karim.png",
};

describe("listerDisplay", () => {
  it("shows an individual under their own name and photo", () => {
    expect(listerDisplay({ ...person, account_type: "individual" }, "Owner")).toEqual({
      name: "Karim Ali",
      logoUrl: "https://cdn/karim.png",
      isCompany: false,
    });
  });

  it("treats a user the API sent no account type for as an individual", () => {
    expect(listerDisplay(person, "Owner").isCompany).toBe(false);
  });

  it("shows a company under its own name and logo", () => {
    expect(
      listerDisplay(
        {
          ...person,
          account_type: "company",
          company_name: " Rahim Properties Ltd ",
          company_logo_url: "https://cdn/logo.png",
        },
        "Owner",
      ),
    ).toEqual({ name: "Rahim Properties Ltd", logoUrl: "https://cdn/logo.png", isCompany: true });
  });

  it("falls back to the person's photo when the company has no logo yet", () => {
    const result = listerDisplay(
      { ...person, account_type: "company", company_name: "X Ltd", company_logo_url: null },
      "Owner",
    );
    expect(result.logoUrl).toBe("https://cdn/karim.png");
  });

  it("falls back to the person when a company has not set its name", () => {
    const result = listerDisplay({ ...person, account_type: "company", company_name: "  " }, "Owner");
    expect(result).toMatchObject({ name: "Karim Ali", isCompany: false });
  });

  it("uses the fallback name when there is no user at all", () => {
    expect(listerDisplay(null, "Owner")).toEqual({ name: "Owner", logoUrl: null, isCompany: false });
  });
});

describe("contactPhone", () => {
  it("prefers the number on the listing", () => {
    expect(
      contactPhone({
        phone: ["", " 01711000000 "],
        user: { ...person, auth_identities: [{ email: null, phone: "01999999999" }] },
      }),
    ).toBe("01711000000");
  });

  it("falls back to the number on the owner's account", () => {
    expect(
      contactPhone({
        phone: [],
        user: { ...person, auth_identities: [{ email: null, phone: "01999999999" }] },
      }),
    ).toBe("01999999999");
  });

  it("is null when neither exists", () => {
    expect(contactPhone({ user: null })).toBeNull();
  });
});

describe("toWhatsAppFormat", () => {
  it("converts a standard Bangladesh 01... phone to +8801...", () => {
    expect(toWhatsAppFormat("01711000000")).toBe("+8801711000000");
    expect(toWhatsAppFormat(" 01812-345678 ")).toBe("+8801812345678");
  });

  it("reads the 00 international prefix as +, instead of as a local 0", () => {
    expect(toWhatsAppFormat("00880 1711 000000")).toBe("+8801711000000");
    expect(toWhatsAppFormat("00447911123456")).toBe("+447911123456");
  });

  it("builds the same link from every way of writing one number", () => {
    const forms = ["01711000000", "+880 1711-000000", "8801711000000", "008801711000000", "1711000000"];
    expect(new Set(forms.map((n) => whatsappUrl(n)))).toEqual(new Set(["https://wa.me/8801711000000"]));
  });

  it("leaves international numbers starting with +880 or + intact", () => {
    expect(toWhatsAppFormat("+8801711000000")).toBe("+8801711000000");
    expect(toWhatsAppFormat("+447911123456")).toBe("+447911123456");
  });

  it("adds + when 880 is typed without +", () => {
    expect(toWhatsAppFormat("8801711000000")).toBe("+8801711000000");
  });

  it("returns empty string for empty input", () => {
    expect(toWhatsAppFormat("")).toBe("");
  });
});

describe("whatsappUrl", () => {
  it("builds a wa.me link from the digits only", () => {
    expect(whatsappUrl("+880 1711-000000")).toBe("https://wa.me/8801711000000");
  });

  it("automatically prepends 88 to an 11-digit Bangladesh 01... number", () => {
    expect(whatsappUrl("01711000000")).toBe("https://wa.me/8801711000000");
  });

  it("adds the message, encoded", () => {
    expect(whatsappUrl("8801711000000", "Hi there")).toBe(
      "https://wa.me/8801711000000?text=Hi%20there",
    );
  });

  it("is null without a usable number", () => {
    expect(whatsappUrl(null)).toBeNull();
    expect(whatsappUrl("")).toBeNull();
    expect(whatsappUrl("12")).toBeNull();
  });
});
