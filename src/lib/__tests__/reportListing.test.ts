import { SUPPORT_EMAIL } from "@/content/legal";
import { reportListingMailto } from "@/lib/reportListing";

describe("reportListingMailto", () => {
  const read = (id: string, title: string) => {
    const url = reportListingMailto({ id, title });
    const [address, query] = url.replace("mailto:", "").split("?");
    const params = new URLSearchParams(query);
    return { url, address, subject: params.get("subject"), body: params.get("body") };
  };

  it("writes to the support address with the listing named", () => {
    const { url, address, subject, body } = read("abc-123", "3 bed flat in Gulshan");
    expect(url.startsWith("mailto:")).toBe(true);
    expect(address).toBe(SUPPORT_EMAIL);
    expect(subject).toBe("Report listing abc-123");
    expect(body).toContain("3 bed flat in Gulshan");
    expect(body).toContain("ID: abc-123");
  });

  it("survives characters that would break a link: ampersands, line breaks, quotes, Bangla", () => {
    const title = 'Flat & "garden" — ফ্ল্যাট ?x=1#y';
    const { subject, body } = read("id/with spaces&odd=1", title);
    expect(subject).toBe("Report listing id/with spaces&odd=1");
    expect(body).toContain(title);
    // One mailto with exactly the two fields we set: nothing a title could inject.
    expect([...new URLSearchParams(reportListingMailto({ id: "1", title }).split("?")[1]).keys()]).toEqual(["subject", "body"]);
  });

  it("cannot be turned into a different address by the title", () => {
    const url = reportListingMailto({ id: "1", title: "x\nbcc=evil@example.com&cc=evil@example.com" });
    expect(url.split("?")[0]).toBe(`mailto:${SUPPORT_EMAIL}`);
    expect(url).not.toMatch(/[?&]bcc=/);
    expect(url).not.toMatch(/[?&]cc=/);
  });
});
