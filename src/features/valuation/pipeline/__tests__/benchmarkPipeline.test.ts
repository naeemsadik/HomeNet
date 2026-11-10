import {
  DEFAULT_THRESHOLDS,
  buildBenchmarks,
  canonicalArea,
  cleanListings,
  csvToRecords,
  parseCsv,
  parsePrice,
  parseSizeSqft,
  percentile,
  readAabason,
  readBikroy,
  readBproperty,
  readJominly,
  renderReport,
  statsFor,
  type Listing,
  type Priced,
} from "../benchmarkPipeline";

const listing = (over: Partial<Listing> = {}): Listing => ({
  source: "bproperty",
  purpose: "sale",
  areaRaw: "Gulshan 2, Dhaka",
  price: 20_000_000,
  sizeSqft: 1_600,
  id: "1",
  ...over,
});

describe("parseCsv", () => {
  it("reads quoted cells with commas, doubled quotes and line breaks", () => {
    const rows = parseCsv('a,b\r\n"1,5","say ""hi"""\r\n"line\nbreak",x\r\n');
    expect(rows).toEqual([
      ["a", "b"],
      ["1,5", 'say "hi"'],
      ["line\nbreak", "x"],
    ]);
  });

  it("skips blank lines and a leading byte-order mark", () => {
    expect(parseCsv("﻿a,b\n\n1,2\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("keeps empty cells so the columns still line up", () => {
    expect(csvToRecords("a,b,c\n1,,3\n")).toEqual([{ a: "1", b: "", c: "3" }]);
  });
});

describe("parsePrice", () => {
  it.each([
    ["BDT   4,200,000", 4_200_000],
    ["4200000.0", 4_200_000],
    [35_000_000, 35_000_000],
    ["  75,000 ", 75_000],
  ])("reads %p as %p", (input, expected) => {
    expect(parsePrice(input)).toBe(expected);
  });

  it.each(["", "Call for price", "0", "0.0", undefined, null])("gives null for %p", (input) => {
    expect(parsePrice(input as never)).toBeNull();
  });
});

describe("parseSizeSqft", () => {
  it("reads the number out of text and drops thousands commas", () => {
    expect(parseSizeSqft("1450 sqft")).toBe(1450);
    expect(parseSizeSqft("1,309")).toBe(1309);
    expect(parseSizeSqft(750)).toBe(750);
  });

  it("converts katha at 720 sqft each, from the unit or from the text", () => {
    expect(parseSizeSqft("3", "katha")).toBe(2160);
    expect(parseSizeSqft("2.5 Katha")).toBe(1800);
  });

  it("gives null for nothing, zero or text without a number", () => {
    expect(parseSizeSqft("")).toBeNull();
    expect(parseSizeSqft("0 sqft")).toBeNull();
    expect(parseSizeSqft("n/a")).toBeNull();
  });
});

describe("canonicalArea", () => {
  it.each([
    ["Gulshan 2, Gulshan, Dhaka", "gulshan"],
    ["North Gulshan", "gulshan"],
    ["Gulshan-2 Diplomatic Zone", "gulshan"],
    ["Baridhara Diplomatic Zone", "baridhara"],
    ["Banani DOHS", "banani"],
    ["Basundhara", "bashundhara"],
    ["Block-I, Bashundhara R-A, Dhaka", "bashundhara"],
    ["Uttra, Dhaka", "uttara"],
    ["Mohammedpur", "mohammadpur"],
    ["Malibag", "malibagh"],
    ["ECB Circle, Mirpur, Dhaka", "mirpur"],
  ])("reads %p as %p", (raw, expected) => {
    expect(canonicalArea(raw)).toBe(expected);
  });

  it("puts a place inside another before the larger one (Baridhara is not Gulshan)", () => {
    expect(canonicalArea("Baridhara, Gulshan")).toBe("baridhara");
  });

  it("gives null for a place it does not know, or nothing", () => {
    expect(canonicalArea("Barhmanbaria Sadar, Brahmanbaria")).toBeNull();
    expect(canonicalArea("")).toBeNull();
  });
});

describe("source readers", () => {
  it("bproperty: apartments with a price and a size only", () => {
    const rows = csvToRecords(
      [
        "listing_id,title,price,area_size,location_text,listing_type,property_type",
        "1,flat in mirpur,16600000,1233,\"Mirpur, Dhaka\",sale,apartment",
        "2,an office,5000000,900,Gulshan,sale,commercial",
        "3,no size,5000000,,Gulshan,sale,apartment",
      ].join("\n"),
    );
    const read = readBproperty(rows);
    expect(read).toHaveLength(1);
    expect(read[0]).toMatchObject({ source: "bproperty", purpose: "sale", price: 16_600_000, sizeSqft: 1233, id: "1" });
  });

  it("bikroy: reads the price and size columns it names", () => {
    const rows = csvToRecords(
      "title,price_amount,area_size_sqft,location_text,listing_type,property_type,listing_url\nx,3550000,750.0,Khilkhet,sale,apartment,u1",
    );
    expect(readBikroy(rows)[0]).toMatchObject({ price: 3_550_000, sizeSqft: 750, areaRaw: "Khilkhet" });
  });

  it("jominly: a price of 0 means missing, and katha is converted", () => {
    const rows = csvToRecords(
      [
        "title,price,listing_type,property_type,location_text,listing_url,area_size,area_unit",
        "a,0.0,sale,apartment,Uttara,u1,2200,sqft",
        "b,8500000.0,sale,apartment,Badda,u2,1309,sqft",
        "c,9000000.0,sale,apartment,Badda,u3,2,katha",
      ].join("\n"),
    );
    const read = readJominly(rows);
    expect(read.map((l) => l.sizeSqft)).toEqual([1309, 1440]);
  });

  it("aabason: only plain flats; land-share, hostels, rooms and offices are left out", () => {
    const rows = csvToRecords(
      [
        "category,listing_id,title,location,price,Area",
        "/property/for-sale/residential/flat,1,t,\"Dhanmondi, Dhaka\",BDT   27000000,1800 sqft",
        "/property/for-sale/residential/landshare,2,t,\"Dhanmondi, Dhaka\",BDT   9000000,1400 sqft",
        "/property/to-rent/residential/girls-hostel,3,t,\"Dhanmondi, Dhaka\",BDT   5000,",
        "/property/to-rent/residential/flat,4,t,\"Dhanmondi, Dhaka\",BDT   50000,",
        "/property/to-rent/commercial/office-space,5,t,\"Dhanmondi, Dhaka\",BDT   80000,1000 sqft",
      ].join("\n"),
    );
    const read = readAabason(rows);
    expect(read).toHaveLength(1);
    expect(read[0]).toMatchObject({ purpose: "sale", id: "1" });
  });
});

describe("cleanListings", () => {
  it("keeps a good listing as a price per sqft", () => {
    const { kept } = cleanListings([listing()]);
    expect(kept).toEqual([expect.objectContaining({ area: "gulshan", perSqft: 12_500 })]);
  });

  it("drops and counts an unknown area, and lists it", () => {
    const { kept, dropped, unmapped } = cleanListings([
      listing({ areaRaw: "Brahmanbaria", id: "a" }),
      listing({ areaRaw: "Brahmanbaria", id: "b", price: 1 }),
      listing({ areaRaw: "", id: "c" }),
    ]);
    expect(kept).toHaveLength(0);
    expect(dropped["unmapped-area"]).toBe(3);
    expect(unmapped[0]).toEqual({ raw: "Brahmanbaria", count: 2 });
    expect(unmapped[1]).toEqual({ raw: "(blank)", count: 1 });
  });

  it("finds the area in the title only when the site left the location blank", () => {
    const blank = cleanListings([listing({ areaRaw: "", areaHint: "1233 sft flat for sale in mirpur dhaka" })]);
    expect(blank.kept[0].area).toBe("mirpur");

    const given = cleanListings([listing({ areaRaw: "Gulshan", areaHint: "near Dhanmondi lake" })]);
    expect(given.kept[0].area).toBe("gulshan");

    const unknown = cleanListings([listing({ areaRaw: "Somewhere", areaHint: "flat in mirpur" })]);
    expect(unknown.kept).toHaveLength(0);
  });

  it("drops a size outside 200 to 10,000 sqft", () => {
    const { kept, dropped } = cleanListings([
      listing({ sizeSqft: 150, id: "a" }),
      listing({ sizeSqft: 20_000, id: "b", price: 500_000_000 }),
    ]);
    expect(kept).toHaveLength(0);
    expect(dropped["size-out-of-range"]).toBe(2);
  });

  it("drops a total price typed ten times too high, and a rent typed as a sale", () => {
    const { kept, dropped } = cleanListings([
      listing({ price: 200_000_000, id: "a" }),
      listing({ purpose: "rent", price: 600_000, sizeSqft: 1_000, id: "b" }),
      listing({ purpose: "rent", price: 70_000, sizeSqft: 1_400, id: "c" }),
    ]);
    expect(dropped["price-per-sqft-out-of-range"]).toBe(2);
    expect(kept).toEqual([expect.objectContaining({ purpose: "rent", perSqft: 50 })]);
  });

  it("drops the same site id twice, and the same flat posted on two sites", () => {
    const { kept, dropped } = cleanListings([
      listing({ id: "1" }),
      listing({ id: "1", price: 21_000_000 }),
      listing({ source: "bikroy", id: "https://x/1" }),
    ]);
    expect(kept).toHaveLength(1);
    expect(dropped.duplicate).toBe(2);
  });

  it("keeps identical units a developer lists on one site: each is a real flat", () => {
    const { kept, dropped } = cleanListings([
      listing({ id: "a" }),
      listing({ id: "b" }),
      listing({ id: "c" }),
    ]);
    expect(kept).toHaveLength(3);
    expect(dropped.duplicate).toBe(0);
  });

  it("still drops a listing on a second site that matches one already kept", () => {
    const { kept, dropped } = cleanListings([
      listing({ id: "a" }),
      listing({ id: "b" }),
      listing({ source: "bikroy", id: "https://x/1" }),
    ]);
    expect(kept.map((k) => k.source)).toEqual(["bproperty", "bproperty"]);
    expect(dropped.duplicate).toBe(1);
  });
});

describe("percentile", () => {
  it("interpolates between ranks, like a spreadsheet", () => {
    expect(percentile([1, 2, 3, 4], 50)).toBe(2.5);
    expect(percentile([10, 20, 30, 40, 50], 25)).toBe(20);
    expect(percentile([10, 20, 30, 40, 50], 75)).toBe(40);
  });

  it("handles one value and none", () => {
    expect(percentile([7], 90)).toBe(7);
    expect(percentile([], 50)).toBeNaN();
  });
});

describe("statsFor", () => {
  const priced = (n: number, source: Priced["source"] = "bikroy"): Priced[] =>
    Array.from({ length: n }, (_, i) => ({
      source,
      purpose: "sale" as const,
      area: "gulshan",
      perSqft: 10_000 + i * 100,
      id: String(i),
    }));

  it("calls 15 or more listings ok, 5 to 14 thin and fewer insufficient", () => {
    expect(statsFor(priced(15), "sale").status).toBe("ok");
    expect(statsFor(priced(14), "sale").status).toBe("thin");
    expect(statsFor(priced(5), "sale").status).toBe("thin");
    expect(statsFor(priced(4), "sale").status).toBe("insufficient");
  });

  it("gives the median, the quartiles and the spread", () => {
    const s = statsFor(priced(5), "sale");
    expect(s).toMatchObject({ n: 5, median: 10_200, p25: 10_100, p75: 10_300, min: 10_000, max: 10_400 });
  });

  it("says how much one source decides the figure", () => {
    const mixed = [...priced(6, "bikroy"), ...priced(2, "jominly")];
    expect(statsFor(mixed, "sale").bySource).toEqual({ bikroy: 6, jominly: 2 });
    expect(statsFor(mixed, "sale").largestSourceShare).toBe(0.75);
  });

  it("keeps one decimal on a rent, which is a small number", () => {
    const rent: Priced[] = [48.26, 52.71].map((perSqft, i) => ({
      source: "bproperty",
      purpose: "rent",
      area: "banani",
      perSqft,
      id: String(i),
    }));
    expect(statsFor(rent, "rent").median).toBe(50.5);
  });
});

describe("buildBenchmarks", () => {
  const many = (count: number, over: Partial<Listing>): Listing[] =>
    Array.from({ length: count }, (_, i) =>
      listing({ id: `${over.source ?? "bproperty"}-${i}`, price: 20_000_000 + i * 100_000, ...over }),
    );

  it("groups by area and purpose and keeps only aggregates", () => {
    const { file } = buildBenchmarks(
      { bproperty: many(16, {}), bikroy: many(3, { source: "bikroy", areaRaw: "Mirpur", price: 9_000_000 }) },
      { asOf: "2026-10-30" },
    );
    expect(file.asOf).toBe("2026-10-30");
    expect(file.areas.gulshan.sale?.status).toBe("ok");
    expect(file.areas.mirpur.sale?.status).toBe("insufficient");
    expect(file.totals.read).toBe(19);
    // Nothing that identifies a listing is carried into the output.
    const text = JSON.stringify(file);
    expect(text).not.toMatch(/bproperty-\d|https?:\/\//);
  });

  it("uses the thresholds it is given", () => {
    const { file } = buildBenchmarks(
      { bproperty: many(3, {}) },
      { asOf: "2026-10-30", limits: { ...DEFAULT_THRESHOLDS, minListings: 3 } },
    );
    expect(file.areas.gulshan.sale?.status).toBe("ok");
  });

  it("renders a report with the areas and the places it could not place", () => {
    const { file, unmapped } = buildBenchmarks(
      { bproperty: [...many(16, {}), listing({ id: "x", areaRaw: "Nowhere" })] },
      { asOf: "2026-10-30" },
    );
    const report = renderReport(file, unmapped);
    expect(report).toContain("Valuation benchmarks as of 2026-10-30");
    expect(report).toMatch(/gulshan\s+sale\s+16/);
    expect(report).toContain("Nowhere");
  });
});
