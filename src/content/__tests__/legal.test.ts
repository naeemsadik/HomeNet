import { DELETE_ACCOUNT, PRIVACY_POLICY, SUPPORT_EMAIL, TERMS_OF_USE, type LegalDocument } from "@/content/legal";

const documents: [string, LegalDocument][] = [
  ["privacy policy", PRIVACY_POLICY],
  ["terms of use", TERMS_OF_USE],
  ["delete account", DELETE_ACCOUNT],
];

const everyText = (doc: LegalDocument) =>
  doc.sections.flatMap((s) => [s.heading, ...(s.paragraphs ?? []), ...(s.bullets ?? [])]);

describe.each(documents)("the %s", (_name, doc) => {
  it("is finished: every section has a heading and some text, and nothing is blank or a placeholder", () => {
    expect(doc.title.length).toBeGreaterThan(0);
    expect(doc.summary.length).toBeGreaterThan(0);
    expect(doc.updated).toMatch(/^\d{1,2} [A-Z][a-z]+ 20\d\d$/);
    expect(doc.sections.length).toBeGreaterThan(2);
    for (const section of doc.sections) {
      expect((section.paragraphs?.length ?? 0) + (section.bullets?.length ?? 0)).toBeGreaterThan(0);
    }
    for (const text of everyText(doc)) {
      expect(text.trim()).toBe(text);
      expect(text.length).toBeGreaterThan(2);
      expect(text).not.toMatch(/lorem|todo|tbd|\[[^\]]*\]|xxx|example\.com/i);
    }
  });

  it("has no two sections with the same heading (the page keys on it)", () => {
    const headings = doc.sections.map((s) => s.heading);
    expect(new Set(headings).size).toBe(headings.length);
  });
});

describe("what the policies say matches what the app does", () => {
  const privacy = everyText(PRIVACY_POLICY).join("\n");
  const terms = everyText(TERMS_OF_USE).join("\n");
  const deletion = everyText(DELETE_ACCOUNT).join("\n");

  it("gives a real contact address, the same one everywhere", () => {
    expect(SUPPORT_EMAIL).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i);
    for (const text of [privacy, terms, deletion]) expect(text).toContain(SUPPORT_EMAIL);
  });

  it("does not claim to collect a phone number, location, contacts or an advertising ID", () => {
    // The app collects none of these. Mentioning them is fine only in the "we do not collect" section.
    const collects = PRIVACY_POLICY.sections.find((s) => s.heading === "What we collect")!.bullets!.join("\n");
    expect(collects).not.toMatch(/phone number|location of your|contacts|advertising/i);
    const notCollected = PRIVACY_POLICY.sections.find((s) => s.heading === "What we do not collect")!.bullets!.join("\n");
    expect(notCollected).toMatch(/location/i);
    expect(notCollected).toMatch(/advertising/i);
  });

  it("says plainly that uploaded media can outlast deletion until we erase it", () => {
    expect(privacy).toMatch(/media provider/);
    expect(deletion).toMatch(/may stay with the provider/);
  });

  it("describes the real deletion path in the app", () => {
    for (const text of [privacy, deletion]) {
      expect(text).toMatch(/Account security/);
      expect(text).toMatch(/Permanently delete account/);
    }
  });

  it("gives a way to report a listing, and does not sell data", () => {
    expect(terms).toMatch(/Report this listing/);
    expect(privacy).toMatch(/do not sell/i);
  });

  it("makes no promise the app cannot keep", () => {
    for (const text of [privacy, terms, deletion]) {
      expect(text).not.toMatch(/\b(guarantee[sd]? (that )?(the )?(property|listing|price)|always (safe|secure)|100%)/i);
      expect(text).not.toMatch(/within \d+ (hours|days)/i); // no response-time commitments
    }
  });
});
