import type { PropertyGuide } from "@/features/news/types/news";

/**
 * Curated property and legal guides for Bangladesh.
 *
 * Serves as:
 * 1. Initial content for HomeNet's guides & insights.
 * 2. Instant zero-latency fallback whenever backend `/v1/guides` is unavailable.
 *
 * Rules for this file:
 * - Credit "HomeNet Team". Never invent a desk, specialist or credential.
 * - Any statutory fee, tax or rate needs the fee disclaimer, a cited source,
 *   and `updatedAt` set to the date the figure was last checked. Rates change
 *   with every Finance Act.
 */
export const CURATED_PROPERTY_GUIDES: PropertyGuide[] = [
  {
    id: "guide-namzari-mutation",
    slug: "namzari-mutation-bangladesh-guide",
    category: "Legal",
    title: "Understanding Namzari (Mutation) in Bangladesh: Step-by-Step Guide",
    titleBn: "বাংলাদেশে ই-নামজারি (মিউটেশন) করার নিয়ম: ধাপভিত্তিক পূর্ণাঙ্গ নির্দেশিকা",
    excerpt:
      "Why registering a deed at the Sub-registry is not enough: how to complete online Namzari via mutation.land.gov.bd and secure government revenue records.",
    excerptBn:
      "সাব-রেজিস্ট্রি অফিসে শুধু সাফ-কবলা দলিল করলেই মালিকানা নিশ্চিত হয় না, mutation.land.gov.bd-এর মাধ্যমে অনলাইনে নামজারি সম্পন্ন করার নিয়মাবলী।",
    readTime: "5 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=85",
    publishedAt: "2026-08-15T09:00:00.000Z",
    updatedAt: "2026-09-27T00:00:00.000Z",
    href: "/guides/namzari-mutation-bangladesh-guide",
    sourceType: "internal",
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["Namzari", "Mutation", "Land Ministry", "AC Land", "DCR"],
    tagsBn: ["নামজারি", "মিউটেশন", "ভূমি মন্ত্রণালয়", "এসিল্যান্ড", "ডিসিআর"],
    contentMarkdown: `
# Understanding Namzari (Mutation) in Bangladesh

> **Disclaimer:** Rates cited are for reference only. Verify all statutory fees with
> the relevant Sub-registry, NBR circular, or a qualified lawyer before any transaction.

Many property buyers in Bangladesh mistakenly believe that completing a purchase deed (*Saf-Kabala*) at the Sub-registry office is the final step in establishing ownership. **It is not.**

Until you mutate the land record in your name through **Namzari** (Mutation), the official government revenue record (*Khatian*) remains under the previous owner's name. This means:
- The previous owner can unlawfully attempt to sell or mortgage the land using old records.
- You cannot legally pay land development tax (*Khajna*) in your own name.
- You cannot secure a bank mortgage or obtain construction plan approvals from development authorities like RAJUK or CDA.

---

## What is Namzari?
Namzari is the legal procedure where the Assistant Commissioner of Land (AC Land) replaces the seller's name with the buyer's name in the government's Record of Rights (ROR/Khatian) and registers it in the Land Office Register-II (*Jamabandi*).

---

## Required Documents for Online Namzari
Applications are filed online through **mutation.land.gov.bd**:

1. **National ID Card (NID)** of the applicant.
2. **Original Sale Deed (*Saf-Kabala*)** or certified copy.
3. **Chain of Deeds (*Via Dolil*)** tracing ownership history.
4. **Latest Recorded Khatian** (RS / BS / City Survey).
5. **Up-to-date Land Development Tax Receipt (*Khajna Dakhila*)**.
6. **Inheritance Certificate (*Waris Sanad*)**, if the property was inherited.

---

## Step-by-Step Procedure

### 1. Online Application
Visit [mutation.land.gov.bd](https://mutation.land.gov.bd) and select "New Application" (*Notun Abedon*). Fill in your NID, mobile number, district, upazila/thana, and mouza details. Upload scanned copies of your deed and tax receipts; the portal lists the accepted file types and sizes. You pay a **Tk 20 court fee** and a **Tk 50 notice fee** online at this stage.

### 2. Application Tracking
Upon submission, an SMS with your **Application ID** and tracking link is sent to your registered mobile number.

### 3. Field Verification
The Union/Circle Land Sub-office (*Tahshil Office*) conducts field verification and submits a report to the AC Land office. Track progress with your Application ID rather than relying on a fixed timeline.

### 4. Hearing & Scrutiny
If required, the AC Land office schedules a hearing where both parties (or representatives) verify original documents.

### 5. Official Order & Fee Payment
Once approved:
- An official approval SMS arrives.
- Pay the **DCR fee of Tk 1,100** online: Tk 1,000 for the record correction and Tk 100 for the mutation khatian.

### 6. Download E-Khatian & DCR
Download your QR-code verified **E-Namzari Khatian** and **Duplicate Carbon Receipt (DCR)** directly from the portal. The QR-coded DCR issued online carries the same legal validity as one issued by the manual method.

---

## Sources

- [e-Mutation portal, Ministry of Land](https://mutation.land.gov.bd)
- [BSS: "Applicant can pay e-mutation fee online" (2 Nov 2021), fee breakdown](https://www.bssnews.net/news/25997)
    `.trim(),
    contentMarkdownBn: `
# বাংলাদেশে ই-নামজারি (মিউটেশন) করার নিয়মাবলী

> **সতর্কতা:** এখানে উল্লিখিত ফি ও তথ্যাবলী কেবল সাধারণ নির্দেশিকা হিসেবে প্রদত্ত। যেকোনো লেনদেনের পূর্বে সংশ্লিষ্ট সাব-রেজিস্ট্রি অফিস, এনবিআরের প্রজ্ঞাপন বা আইন বিশেষজ্ঞের সাথে যাচাই করুন।

বাংলাদেশে জমি বা ফ্ল্যাট কেনার পর অনেকের মধ্যেই একটি ভুল ধারণা থাকে যে, সাব-রেজিস্ট্রি অফিসে সাফ-কবলা দলিল সম্পন্ন করলেই মালিকানা প্রক্রিয়া শেষ। **প্রকৃতপক্ষে তা নয়।**

সহকারী কমিশনার (ভূমি) বা এসিল্যান্ড অফিসে সরকারি রাজস্ব রেকর্ডে আপনার নামে জমি নামজারি না করা পর্যন্ত খতিয়ানে পূর্ববর্তী মালিকের নামই থেকে যায়। এর ফলে:
- পূর্বের মালিক অসদুপায়ে পুরনো খতিয়ান দেখিয়ে জমি পুনরায় বিক্রি বা বন্ধক রাখার চেষ্টা করতে পারে।
- আপনি নিজের নামে ভূমি উন্নয়ন কর (খাজনা) পরিশোধ করতে পারবেন না।
- ব্যাংক ঋণ বা রাজউক/সিডিএ থেকে ভবন নির্মাণের নকশা অনুমোদন পেতে জটিলতা তৈরি হয়।

---

## নামজারি (মিউটেশন) কী?
নামজারি হলো এমন একটি আইনি প্রক্রিয়া যার মাধ্যমে হস্তান্তরিত জমির পূর্ববর্তী মালিকের নাম সরকারি রেকর্ড অফ রাইটস (খতিয়ান) ও ২ নম্বর রেজিস্টার (জমা trap) থেকে কেটে নতুন ক্রেতার নাম প্রতিস্থাপন করা হয়।

---

## অনলাইনে নামজারির জন্য প্রয়োজনীয় কাগজপত্র
ভূমি মন্ত্রণালয়ের **mutation.land.gov.bd** পোর্টালে আবেদনের জন্য যা যা লাগবে:

1. আবেদনকারীর **জাতীয় পরিচয়পত্র (এনআইডি)**।
2. মূল **সাফ-কবলা দলিল** বা দলিলের সার্টিফাইড কপি।
3. মালিকানার ধারাবাহিকতা প্রমাণের জন্য **বায়া দলিল**।
4. সর্বশেষ **রেকর্ডীয় খতিয়ান** (আরএস / বিএস / সিটি জরিপ)।
5. হালনাগাদ **ভূমি উন্নয়ন কর পরিশোধের দাখিলা (খাজনার রসিদ)**।
6. ওয়ারিশসূত্রে প্রাপ্ত সম্পত্তির ক্ষেত্রে **ওয়ারিশান সনদ**।

---

## ধাপভিত্তিক নামজারি প্রক্রিয়া

### ১. অনলাইন আবেদন
[mutation.land.gov.bd](https://mutation.land.gov.bd) পোর্টালে গিয়ে "নতুন আবেদন" অপশন নির্বাচন করুন। এনআইডি, মোবাইল নম্বর, জেলা, উপজেলা এবং মৌজা সংক্রান্ত তথ্য দিন। প্রয়োজনীয় দলিলের স্ক্যান কপি আপলোড করুন। এই ধাপে অনলাইনে কোর্ট ফি ২০ টাকা এবং নোটিশ জারি ফি ৫০ টাকা প্রদান করতে হয়।

### ২. আবেদন ট্র্যাকিং
আবেদন সম্পন্ন হলে মোবাইল নম্বরে এসএমএসের মাধ্যমে একটি **আবেদন আইডি** ও ট্র্যাকিং লিংক পাঠানো হবে।

### ৩. মাঠপর্যায়ে তদন্ত
সংশ্লিষ্ট ইউনিয়ন/সার্কেল ভূমি সহকারী কর্মকর্তা (তহশিলদার) সরেজমিনে জমি পরিদর্শন করে এসিল্যান্ড অফিসে প্রতিবেদন জমা দেন।

### ৪. শুনানি ও যাচাই
প্রয়োজনে এসিল্যান্ড অফিস থেকে শুনানির তারিখ নির্ধারণ করা হয়, যেখানে মূল কাগজপত্র প্রদর্শন করতে হয়।

### ৫. অনুমোদন ও ডিসিআর ফি পরিশোধ
আবেদন অনুমোদিত হলে এসএমএসের মাধ্যমে জানানো হয়। এরপর অনলাইনে মোট **১,১০০ টাকা ডিসিআর ফি** প্রদান করতে হবে (রেকর্ড সংশোধন ফি ১,০০০ টাকা ও খতিয়ান ফি ১০০ টাকা)।

### ৬. ই-খতিয়ান ও ডিসিআর ডাউনলোড
অনলাইন থেকে কিউআর কোডযুক্ত **ই-নামজারি খতিয়ান** এবং **ডুপ্লিকেট কার্বন রসিদ (ডিসিআর)** ডাউনলোড করে সংরক্ষণ করুন। এটি সনাতন পদ্ধতির মতোই পূর্ণ আইনি গ্রহণযোগ্যতা বহন করে।

---

## সহায়ক সূত্র

- [ভূমি মন্ত্রণালয় ই-নামজারি পোর্টাল](https://mutation.land.gov.bd)
- [বাংলাদেশ সংবাদ সংস্থা (বিএসএস): "ই-নামজারি ফি পরিশোধের বিস্তারিত"](https://www.bssnews.net/news/25997)
    `.trim(),
    author: {
      name: "HomeNet Team",
    },
  },

  {
    id: "guide-verify-khatian",
    slug: "how-to-verify-khatian-cs-sa-rs-bs",
    category: "Legal",
    title: "How to Verify Khatian (CS, SA, RS, BS) Before Buying Land or Flats",
    titleBn: "জমি বা ফ্ল্যাট কেনার আগে খতিয়ান (সিএস, এসএ, আরএস, বিএস) যাচাই করার উপায়",
    excerpt:
      "Learn the four major land surveys in Bangladesh, how to trace the chain of ownership via deed history, and how to verify records on eporcha.gov.bd.",
    excerptBn:
      "বাংলাদেশের চারটি প্রধান ভূমি জরিপ, বায়া দলিলের ধারাবাহিকতা এবং eporcha.gov.bd থেকে অনলাইনে খতিয়ান যাচাইয়ের নিয়ম।",
    readTime: "6 min read",
    imageUrl: null,
    publishedAt: "2026-08-20T10:30:00.000Z",
    href: "/guides/how-to-verify-khatian-cs-sa-rs-bs",
    sourceType: "internal",
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["Khatian", "Porcha", "CS", "SA", "RS", "BS", "City Survey"],
    tagsBn: ["খতিয়ান", "পর্চা", "সিএস", "এসএ", "আরএস", "বিএস", "সিটি জরিপ"],
    contentMarkdown: `
# How to Verify Khatian (CS, SA, RS, BS) Before Buying

> **Disclaimer:** This guide is general information, not legal advice. Land records and
> procedures vary by district; confirm with the AC Land office, the Sub-registry, or a
> qualified lawyer before any transaction.

In Bangladesh, real estate disputes usually originate from defective land titles or forged Khatians (*Porchas*). Understanding the progression of historical land surveys is essential for every property buyer.

---

## The Four Major Land Surveys in Bangladesh

### 1. CS (Cadastral Survey): 1888 to 1940
The foundational survey conducted under the British colonial administration. CS records establish the historical benchmark of land ownership.

### 2. SA (State Acquisition Survey): 1956 to 1962
Conducted following the abolition of the Zamindari system under the East Bengal State Acquisition and Tenancy Act of 1950. It recorded tenant farmers as direct owners under the government.

### 3. RS (Revisional Survey): 1965 to 1990
Initiated to rectify errors in the SA survey. In many parts of Bangladesh outside Dhaka, RS remains the most legally robust reference survey.

### 4. BS / City Survey (Bangladesh Survey): 1998 to Present
The modern survey. In Dhaka, it is commonly designated as **Dhaka City Survey**. If City Survey is complete in an area, all new registrations and mutations must reference the City Survey Khatian.

---

## 3 Critical Verification Steps

1. **Verify the Chain of Ownership (*Via Dolil*)**:
   Ensure there is an unbroken chain of registered deeds connecting the current seller back to the recorded owner in the RS or City Survey Khatian.

2. **Online Verification via E-Porcha**:
   Visit [eporcha.gov.bd](https://www.eporcha.gov.bd). Search by Division, District, Upazila, and Mouza to verify that the Khatian number and Dag (plot) number match the government database.

3. **Check for Injunctions & Vested Property Lists**:
   Confirm at the Sub-registry and AC Land office that the property is not classified as *Khas* (government land), *Arpita* (vested property), or encumbered by bank liens or ongoing court injunctions.
    `.trim(),
    contentMarkdownBn: `
# জমি বা ফ্ল্যাট কেনার আগে খতিয়ান যাচাইয়ের নিয়ম

> **সতর্কতা:** এই নির্দেশিকাটি সচেতনতা বৃদ্ধির উদ্দেশ্যে তৈরি, কোনো আনুষ্ঠানিক আইনি পরামর্শ নয়। ভূমি সংক্রান্ত কোনো চুক্তি সম্পাদনের আগে সংশ্লিষ্ট এসিল্যান্ড অফিস ও বিজ্ঞ আইনজীবীর মতামত নিন।

বাংলাদেশে জমিজমা সংক্রান্ত সিংহভাগ বিরোধের মূল কারণ হলো ত্রুটিপূর্ণ স্বত্ব বা জাল খতিয়ান (পর্চা)। তাই যেকোনো রিয়েল এস্টেট ক্রয়ের আগে জরিপের ইতিহাস বোঝা অত্যন্ত জরুরি।

---

## বাংলাদেশে ৪টি প্রধান ভূমি জরিপ

### ১. সিএস (ক্যাডাস্ট্রাল সার্ভে): ১৮৮৮ থেকে ১৯৪০
ব্রিটিশ শাসনামলে পরিচালিত প্রথম বিজ্ঞানসম্মত পূর্ণাঙ্গ জরিপ। সিএস খতিয়ান জমির মালিকানার ঐতিহাসিক আদি ভিত্তি হিসেবে স্বীকৃত।

### ২. এসএ (স্টেট অ্যাকুইজিশন সার্ভে): ১৯৫৬ থেকে ১৯৬২
১৯৫০ সালের জমিদারি উচ্ছেদ ও প্রজাস্বত্ব আইনের পর জমিদারি প্রথা বিলুপ্তির প্রেক্ষাপটে এই জরিপ হয়। এর মাধ্যমে রায়ত বা কৃষকদের সরাসরি সরকারের অধীনে জমির মালিক হিসেবে রেকর্ড করা হয়।

### ৩. আরএস (রিভিশনাল সার্ভে): ১৯৬৫ থেকে ১৯৯০
এসএ জরিপের ভুলভ্রান্তি সংশোধনের উদ্দেশ্যে পরিচালিত হয়। ঢাকার বাইরের বহু জেলায় আরএস খতিয়ান আইনি দিক থেকে সবচেয়ে নির্ভরযোগ্য ভিত্তি হিসেবে গণ্য হয়।

### ৪. বিএস / সিটি জরিপ: ১৯৯৮ থেকে বর্তমান
বাংলাদেশের আধুনিক ডিজিটাল জরিপ। রাজধানী ঢাকায় এটি **ঢাকা সিটি জরিপ** নামে পরিচিত। যেসব এলাকায় সিটি জরিপ সম্পন্ন হয়েছে, সেখানে সব ধরনের নতুন রেজিস্ট্রেশন ও নামজারির জন্য সিটি জরিপ খতিয়ান বাধ্যতামূলক।

---

## খতিয়ান যাচাইয়ের ৩টি অপরিহার্য পদক্ষেপ

১. **বায়া দলিলের ধারাবাহিকতা যাচাই:**
   বর্তমান বিক্রেতা কীভাবে জমির মালিক হলেন, সেই সূত্রে আরএস বা সিটি জরিপ খতিয়ানের মূল রেকর্ডীয় মালিক পর্যন্ত দলিলের ধারাবাহিক চেইন অব টাইটেল অক্ষুণ্ণ আছে কিনা নিশ্চিত হোন।

২. **ই-পর্চা পোর্টালে অনলাইন যাচাই:**
   [eporcha.gov.bd](https://www.eporcha.gov.bd) ওয়েবসাইটে গিয়ে বিভাগ, জেলা, উপজেলা এবং মৌজা নির্বাচন করে খতিয়ান নম্বর ও দাগ নম্বর সরকারি ডাটাবেজের সাথে মিলিয়ে দেখুন।

৩. **খাস, অর্পিত বা আদালতের নিষেধাজ্ঞা যাচাই:**
   সংশ্লিষ্ট সাব-রেজিস্ট্রি এবং এসিল্যান্ড অফিসে খোঁজ নিয়ে নিশ্চিত হোন যে জমিটি খাস, অর্পিত সম্পত্তি, কোনো ব্যাংকে দায়বদ্ধ বা দেওয়ানি আদালতের নিষেধাজ্ঞার আওতাভুক্ত নয়।
    `.trim(),
    author: {
      name: "HomeNet Team",
    },
  },

  {
    id: "guide-flat-registration-costs",
    slug: "dhaka-flat-registration-costs-breakdown",
    category: "Buying",
    title: "Dhaka Flat Registration Costs & Stamp Duty Breakdown",
    titleBn: "ঢাকায় ফ্ল্যাট রেজিস্ট্রেশন খরচ, স্ট্যাম্প ডিউটি ও সরকারি ফি-র হিসাব",
    excerpt:
      "What it costs to register a flat in Dhaka: stamp duty, registration fee and local government tax, plus the seller's and developer's taxes under the Income Tax Act 2023.",
    excerptBn:
      "ঢাকায় ফ্ল্যাট রেজিস্ট্রেশনের যাবতীয় খরচ: স্ট্যাম্প ডিউটি, রেজিস্ট্রেশন ফি, স্থানীয় সরকার কর এবং আয়কর আইন ২০২৩ অনুযায়ী করের হিসাব।",
    readTime: "5 min read",
    imageUrl: null,
    publishedAt: "2026-08-25T11:00:00.000Z",
    updatedAt: "2026-09-27T00:00:00.000Z",
    href: "/guides/dhaka-flat-registration-costs-breakdown",
    sourceType: "internal",
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["Registration", "Stamp Duty", "Transfer Tax", "Taxes", "Dhaka"],
    tagsBn: ["রেজিস্ট্রেশন", "স্ট্যাম্প ডিউটি", "গেইন ট্যাক্স", "কর", "ঢাকা"],
    contentMarkdown: `
# Dhaka Flat Registration Costs & Stamp Duty Breakdown

> **Disclaimer:** Rates cited are for reference only. Verify all statutory fees with
> the relevant Sub-registry, NBR circular, or a qualified lawyer before any transaction.

Registering a flat you have bought in Dhaka involves several statutory charges, collected by the Sub-registry office before the deed is registered. Rates change with Finance Acts and NBR rules, so treat the figures below as a starting point and confirm them before you budget.

---

## Standard Cost Breakdown (City Corporation Areas)

| Charge | Paid by | Rate | Source |
| :--- | :--- | :--- | :--- |
| **Stamp Duty** | Buyer | 1.5% of the deed value | [Finance Act 2022, Schedule I](https://bdlaws.minlaw.gov.bd/act-1409/act-chapter-print-2323.html) |
| **Registration Fee** | Buyer | Set by the Government's fee table. Sub-registry charters list 1% to 2% of the deed value; confirm the current rate | [Registration Act 1908, s.78](https://bdlaws.minlaw.gov.bd/act-90/part-details-293.html) |
| **Local Government Tax** | Buyer | Varies by area: reported as 2% in Dhaka's city corporations; Sub-registry charters elsewhere list 3% | Confirm at your Sub-registry |
| **Transfer Tax (s.125)** | Seller | Set by NBR rules and varies by area. Capped at the higher of Tk 20 lakh per katha of land, Tk 1,000 per sqft of flat, or 10% of the deed value | [Income Tax Act 2023, s.125](https://nbr.gov.bd/uploads/acts/Income_tax_act_2023.pdf) |
| **Developer Tax (s.126)** | Developer | Set by NBR rules and varies by area. Capped at Tk 1,600 per square metre of residential floor space, and 5% of the deed value for the land share | [Income Tax Act 2023, s.126](https://nbr.gov.bd/uploads/acts/Income_tax_act_2023.pdf) |

The seller's transfer tax is often called "gain tax". Sections 125 and 126 of the Income Tax Act 2023 replaced sections 53H and 53FF of the old Income Tax Ordinance 1984.

---

## Example: 1,500 Sqft Flat at Tk 1.5 Crore in Mirpur

The buyer's registration costs, using the rates above:

1. **Stamp Duty (1.5%)**: Tk 2,25,000
2. **Registration Fee (1% to 2%)**: Tk 1,50,000 to Tk 3,00,000
3. **Local Government Tax (2% to 3%)**: Tk 3,00,000 to Tk 4,50,000
4. **Total**: about Tk 6,75,000 to Tk 9,75,000, plus deed-writing and drafting charges, which vary.

The registration fee and local government tax are given as ranges because the official figures published online disagree and are out of date. Ask your Sub-registry for the current rates before you budget.

The seller's transfer tax and the developer's tax are not in this total. If you are buying from a developer, ask whether the price includes the developer's tax. For 1,500 sqft (about 139 square metres) it can be up to about Tk 2.2 lakh, plus up to 5% of the deed value for the land share.

> **Pro Tip**: Always demand an official receipt (e-Chalan) for every fee paid at the Sub-registry. Never hand over unreceipted cash for statutory fees.

---

## Sources

- [Finance Act 2022: stamp duty on instruments, Schedule I (Conveyance)](https://bdlaws.minlaw.gov.bd/act-1409/act-chapter-print-2323.html)
- [Registration Act 1908, Part XIII: fees for registration](https://bdlaws.minlaw.gov.bd/act-90/part-details-293.html)
- [Income Tax Act 2023 as amended by the Finance Act 2024, sections 125 and 126 (NBR)](https://nbr.gov.bd/uploads/acts/Income_tax_act_2023.pdf)
- Registration fee and local government tax as reported for Dhaka by [The Business Standard (27 May 2023)](https://www.tbsnews.net/economy/budget/govt-double-gain-tax-land-flat-registration-638738)
- Sub-registry citizen charters, which list different rates and predate current law: [Kumarkhali, updated 26 Mar 2021](https://sr.kumarkhali.kushtia.gov.bd/pages/static-pages/69811b1ca31054345f1de98b) and [Bheramara, updated 30 Mar 2019](https://sr.bheramara.kushtia.gov.bd/site/page/1b26ca6c-ec53-49f3-bc43-0ceeea7bf2f1)
    `.trim(),
    contentMarkdownBn: `
# ঢাকায় ফ্ল্যাট রেজিস্ট্রেশন খরচ ও স্ট্যাম্প ডিউটির বিস্তারিত

> **সতর্কতা:** উল্লেখিত কর ও ফি-র হার অর্থ আইন ও এনবিআরের বিধিমালার আলোকে পরিবর্তনশীল। চুক্তি করার পূর্বে নিকটস্থ সাব-রেজিস্ট্রি অফিসে হালনাগাদ সরকারি হার যাচাই করে নিন।

ঢাকায় ফ্ল্যাট কেনার পর সাব-রেজিস্ট্রি অফিসে দলিল রেজিস্ট্রি করতে বেশ কিছু সরকারি ফি ও শুল্ক পরিশোধ করতে হয়।

---

## আদর্শ খরচের তালিকা (সিটি কর্পোরেশন এলাকা)

| ফি বা শুল্কের বিবরণ | প্রদেয় পক্ষ | সরকারি হার | রেফারেন্স |
| :--- | :--- | :--- | :--- |
| **স্ট্যাম্প ডিউটি** | ক্রেতা | দলিলের মূল্যের ১.৫% | [অর্থ আইন ২০২২, প্রথম তফসিল](https://bdlaws.minlaw.gov.bd/act-1409/act-chapter-print-2323.html) |
| **রেজিস্ট্রেশন ফি** | ক্রেতা | ১% থেকে ২% (সাব-রেজিস্ট্রি চার্টার অনুযায়ী) | [রেজিস্ট্রেশন আইন ১৯০৮, ধারা ৭৮](https://bdlaws.minlaw.gov.bd/act-90/part-details-293.html) |
| **স্থানীয় সরকার কর** | ক্রেতা | সিটি কর্পোরেশন এলাকায় ২% (অন্যান্য এলাকায় ৩%) | সংশ্লিষ্ট সাব-রেজিস্ট্রি অফিস |
| **উৎস কর / গেইন ট্যাক্স (ধারা ১২৫)** | বিক্রেতা | এলাকাভেদে ভিন্ন (কাঠাপ্রতি বা দলিলের মূল্যের সর্বোচ্চ ১০%) | [আয়কর আইন ২০২৩, ধারা ১২৫](https://nbr.gov.bd/uploads/acts/Income_tax_act_2023.pdf) |
| **ডেভেলপার ট্যাক্স (ধারা ১২৬)** | ডেভেলপার | এলাকাভেদে প্রতি বর্গমিটারে সর্বোচ্চ ১,৬০০ টাকা | [আয়কর আইন ২০২৩, ধারা ১২৬](https://nbr.gov.bd/uploads/acts/Income_tax_act_2023.pdf) |

---

## উদাহরণ: মিরপুরে ১.৫ কোটি টাকার ১,৫০০ বর্গফুটের ফ্ল্যাট

ক্রেতার আনুমানিক রেজিস্ট্রেশন খরচ:
1. **স্ট্যাম্প ডিউটি (১.৫%)**: ২,২৫,০০০ টাকা
2. **রেজিস্ট্রেশন ফি (১%-২%)**: ১,৫০,০০০ থেকে ৩,০০,০০০ টাকা
3. **স্থানীয় সরকার কর (২%-৩%)**: ৩,০০,০০০ থেকে ৪,৫০,০০০ টাকা
4. **মোট খরচ**: প্রায় ৬,৭৫,০০০ থেকে ৯,৭৫,০০০ টাকা (দলিল লেখক ও হলফনামা খরচ ব্যতিরেকে)।

> **জরুরি পরামর্শ:** সাব-রেজিস্ট্রি অফিসে যেকোনো ফি পরিশোধের ক্ষেত্রে অবশ্যই সরকারি ই-চালান বা রসিদ সংগ্রহ করুন।
    `.trim(),
    author: {
      name: "HomeNet Team",
    },
  },

  {
    id: "guide-katha-bigha-decimal",
    slug: "understanding-katha-bigha-decimal-sqft",
    category: "Buying",
    title: "Understanding Katha, Bigha, Decimal & Sqft in Bangladesh",
    titleBn: "কাঠা, বিঘা, শতাংশ ও স্কয়ারফুটের পরিমাপ ও রূপান্তরের হিসাব",
    excerpt:
      "Demystifying land measurement units used across Dhaka, Chittagong, and rural Bangladesh, with quick formulas to convert katha to square feet.",
    excerptBn:
      "ঢাকা, চট্টগ্রামসহ সারাদেশে প্রচলিত ভূমি পরিমাপের একক এবং কাঠা থেকে বর্গফুটে রূপান্তরের সহজ হিসাব।",
    readTime: "4 min read",
    imageUrl: null,
    publishedAt: "2026-09-01T08:15:00.000Z",
    updatedAt: "2026-09-27T00:00:00.000Z",
    href: "/guides/understanding-katha-bigha-decimal-sqft",
    sourceType: "internal",
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["Katha", "Bigha", "Decimal", "Measurement", "Land Area"],
    tagsBn: ["কাঠা", "বিঘা", "শতাংশ", "পরিমাপ", "জমির আয়তন"],
    contentMarkdown: `
# Understanding Katha, Bigha, Decimal & Sqft

Property listings in Bangladesh switch fluidly between imperial, metric, and traditional Bengali measurement units. Here is the standard reference table.

---

## Key Land Conversion Benchmarks

- **1 Katha** = **720 Square Feet (sqft)** = **66.89 Square Metres (sqm)** = **1.65 Decimal (Shatangsho)**
- **20 Katha** = **1 Bigha** = **14,400 Square Feet** = **33 Decimal**
- **1 Acre** = **100 Decimal** = **43,560 Square Feet** (about 3 Bighas, which is 43,200 sqft)
- **1 Chhatak** = **45 Square Feet** (1/16th of a Katha)

---

## Carpet Area vs. Super Built-up Area in Apartments
When buying an apartment advertised as "1,800 sqft":
- **Carpet Area**: The actual net usable floor space inside walls (typically ~1,350 sqft).
- **Common Area Share**: Staircases, lift lobby, substation room, and generator space are added (typically 20% to 25% extra).
- **Always ask for the approved structural floor plan** to verify the exact usable carpet area before signing contracts.
    `.trim(),
    contentMarkdownBn: `
# কাঠা, বিঘা, শতাংশ ও স্কয়ারফুটের সহজ হিসাব

বাংলাদেশে প্রপার্টি লিস্টিংয়ে প্রচলিত দেশীয় এককের পাশাপাশি আন্তর্জাতিক মেট্রিক ও স্কয়ারফুটের ব্যবহার লক্ষ্য করা যায়। নিচে প্রয়োজনীয় হিসাবসমূহ তুলে ধরা হলো:

---

## প্রধান একক ও রূপান্তর

- **১ কাঠা** = **৭২০ বর্গফুট (sqft)** = **৬৬.৮৯ বর্গমিটার** = **১.৬৫ শতাংশ (শতক)**
- **২০ কাঠা** = **১ বিঘা** = **১৪,৪০০ বর্গফুট** = **৩৩ শতাংশ**
- **১ একর** = **১০০ শতাংশ** = **৪৩,৫৬০ বর্গফুট** (প্রায় ৩ বিঘা ৮ ছটাক)
- **১ ছটাক** = **৪৫ বর্গফুট** (১ কাঠার ১৬ ভাগের ১ ভাগ)

---

## ফ্ল্যাটের কার্পেট এরিয়া বনাম সুপার বিল্ট-আপ এরিয়া

একটি ফ্ল্যাট "১,৮০০ স্কয়ারফুট" হিসেবে বিজ্ঞাপন দেওয়া হলে বাস্তব হিসাব:
- **কার্পেট এরিয়া (প্রকৃত ব্যবহারের জায়গা):** ঘরের দেয়ালের ভেতরের ব্যবহারযোগ্য স্থান (সাধারণত প্রায় ১,৩৫০ বর্গফুট)।
- **কমন স্পেস শেয়ার:** সিঁড়ি, লিফট লবি, জেনারেটর রুম ও সাব-স্টেশনের জন্য অতিরিক্ত ২০% থেকে ২৫% যোগ করা হয়।
- ফ্ল্যাট বুকিং দেওয়ার আগে অনুমোদিত ফ্লোর প্ল্যান দেখে কার্পেট এরিয়া নিশ্চিত হয়ে নিন।
    `.trim(),
    author: {
      name: "HomeNet Team",
    },
  },

  {
    id: "guide-apartment-inspection-checklist",
    slug: "dhaka-apartment-buyer-inspection-checklist",
    category: "Buying",
    title: "Pre-Purchase Checklist: 7 Things to Inspect in a Dhaka Apartment",
    titleBn: "ফ্ল্যাট কেনার আগে গুরুত্বপূর্ণ চেকলিস্ট: ঢাকায় ফ্ল্যাট পরিদর্শনের ৭টি বিষয়",
    excerpt:
      "Essential checks before buying an apartment in Dhaka: RAJUK plan approval, standby generator backup limits, sub-station specs, and parking allocation.",
    excerptBn:
      "ঢাকায় ফ্ল্যাট কেনার পূর্বে করণীয়: রাজউক অনুমোদিত নকশা, ব্যাকআপ জেনারেটর ক্ষমতা, সাব-স্টেশন ও পার্কিং বরাদ্দের সুস্পষ্ট যাচাই।",
    readTime: "5 min read",
    imageUrl: null,
    publishedAt: "2026-09-05T12:00:00.000Z",
    href: "/guides/dhaka-apartment-buyer-inspection-checklist",
    sourceType: "internal",
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["Checklist", "Inspection", "Dhaka", "RAJUK", "Amenities"],
    tagsBn: ["চেকলিস্ট", "পরিদর্শন", "ঢাকা", "রাজউক", "সুযোগ-সুবিধা"],
    contentMarkdown: `
# Pre-Purchase Checklist: 7 Things to Inspect in a Dhaka Apartment

Before signing a deed or transferring a booking deposit for a Dhaka flat, run through this inspection checklist:

1. **RAJUK Approved Plan vs. Built Reality**:
   Check if the building matches the sanctioned setback rules and floor count. Deviation from the RAJUK approved design exposes the building to demolition notices or utility disconnection.

2. **Occupancy Certificate (*Shonod*)**:
   Under building construction rules, buildings constructed in Dhaka require an official Occupancy Certificate from RAJUK before residents move in.

3. **Dedicated Generator Load Capacity**:
   Ask specifically: *Does the standby generator support air conditioning and refrigerators during load-shedding, or only lights and fans?*

4. **Gas Connection vs. LPG Reticulation**:
   With new pipeline connections paused, confirm whether the building has a centralized LPG cylinder manifold system or requires individual 12kg cylinder hauling.

5. **Car Parking Allocation in Deed**:
   Verify whether your parking spot is explicitly earmarked with a number on the ground plan in the deed, rather than sold on a vague "common allocation" basis.

6. **Sub-station & Transformer Capacity**:
   For buildings over 6 stories, confirm the presence of a dedicated electrical sub-station and DESCO/DPDC sanctioned transformer capacity.

7. **Solar Panel Compliance**:
   Ensure rooftop solar setups meet utility net-metering standards where applicable.
    `.trim(),
    contentMarkdownBn: `
# ঢাকায় ফ্ল্যাট কেনার পূর্বে ৭টি জরুরি পরিদর্শন চেকলিস্ট

বায়না চুক্তি করার আগে ফ্ল্যাট পরিদর্শনের এই গুরুত্বপূর্ণ বিষয়গুলো মিলিয়ে নিন:

১. **রাজউক অনুমোদিত নকশা বনাম বাস্তব নির্মাণ:**
   ভবনের সেটব্যাক ও ফ্লোর সংখ্যা রাজউকের অনুমোদিত প্ল্যানের সাথে মিলছে কিনা তা যাচাই করুন। প্ল্যান বহির্ভূত নির্মাণ পরবর্তীতে উচ্ছেদ ঝুঁকির মুখে পড়তে পারে।

২. **অকুপেন্সি সার্টিফিকেট (ব্যবহার সনদ):**
   ইমারত নির্মাণ বিধিমালা অনুযায়ী ভবন নির্মাণের পর রাজউক থেকে অকুপেন্সি সার্টিফিকেট নেওয়া বাধ্যতামূলক।

৩. **স্ট্যান্ডবাই জেনারেটরের লোড ক্ষমতা:**
   বিদ্যুৎ চলে গেলে জেনারেটরে এসি ও ফ্রিজ চলবে কি না, নাকি কেবল লাইট ও ফ্যান চলবে, তা নির্দিষ্টভাবে জেনে নিন।

৪. **গ্যাস সংযোগ ব্যবস্থা:**
   পাইপলাইন সংযোগ বন্ধ থাকায় ভবনে সেন্ট্রালাইজড এলপিজি রিটিকুলেশন সিস্টেম আছে কি না তা নিশ্চিত হোন।

৫. **দলিলে সুনির্দিষ্ট পার্কিং নম্বর:**
   গাড়ি পার্কিং স্পেস দলিলে সুনির্দিষ্ট নম্বর ও লেআউটসহ বরাদ্দ আছে কি না তা দেখুন।

৬. **বৈদ্যুতিক সাব-স্টেশন ও ট্রান্সফরমার:**
   ছয় তলার অধিক ভবনের ক্ষেত্রে নিজস্ব বৈদ্যুতিক সাব-স্টেশন ও ট্রান্সফরমারের সঠিক ক্ষমতা যাচাই করুন।

৭. **সোলার প্যানেল সুবিধা:**
   ভবনের ছাদে স্থাপিত সৌর প্যানেলের কার্যক্ষমতা নিশ্চিত করুন।
    `.trim(),
    author: {
      name: "HomeNet Team",
    },
  },

  {
    id: "guide-direct-listing-saves-broker-commission",
    slug: "direct-listing-saves-broker-commission-dhaka",
    category: "Selling",
    title: "How Direct Property Listing Saves Lakhs in Dhaka",
    titleBn: "সরাসরি প্রপার্টি লিস্টিংয়ে ঢাকায় কীভাবে লাখ লাখ টাকা ব্রোকার কমিশন বাঁচে",
    excerpt:
      "How a typical 1-2% broker commission can cost each side up to Tk 5 lakh on a Tk 2.5 crore flat, and why direct-owner listings offer cleaner transactions.",
    excerptBn:
      "ফ্ল্যাট কেনাবেচায় অপ্রয়োজনীয় ১-২% দালাল খরচ কীভাবে লেনদেনের খরচ বাড়ায় এবং সরাসরি মালিকের সাথে লেনদেন কেন বেশি নিরাপদ।",
    readTime: "3 min read",
    imageUrl: null,
    publishedAt: "2026-09-10T14:30:00.000Z",
    href: "/guides/direct-listing-saves-broker-commission-dhaka",
    sourceType: "internal",
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["Direct Listing", "Zero Commission", "Broker Fee", "Dhaka Owners"],
    tagsBn: ["সরাসরি লিস্টিং", "শূন্য কমিশন", "দালালমুক্ত", "ঢাকা ওনার্স"],
    contentMarkdown: `
# How Direct Property Listing Saves Lakhs in Dhaka

In Dhaka's traditional property market, informal brokers (*Dalals*) frequently insert themselves between owners and seekers.

---

## The Hidden Cost of Intermediaries
- On a **Tk 2.5 Crore flat** in Gulshan or Dhanmondi, a 2% brokerage commission is Tk 5 lakh from each side: **Tk 10 lakh** in total drained from the transaction.
- Beyond fees, intermediaries often inflate asking prices or conceal physical drawbacks to rush deals through.

---

## The HomeNet Advantage
1. **Direct Owner Contact**: Talk directly to the actual title holder.
2. **Verified Listing Details**: Confirmed floor, facing, amenities, and exact coordinates before you travel for an inspection.
3. **Zero Commission**: HomeNet charges zero broker commission to both seekers and owners.
    `.trim(),
    contentMarkdownBn: `
# সরাসরি প্রপার্টি লিস্টিংয়ে ঢাকায় কীভাবে লাখ লাখ টাকা বাঁচে

ঢাকার সনাতন প্রপার্টি বাজারে অনানুষ্ঠানিক মধ্যস্বত্বভোগী বা দালালদের কারণে ক্রেতা ও মালিক উভয় পক্ষই ক্ষতিগ্রস্ত হন।

---

## মধ্যস্বত্বভোগীর অদৃশ্য ব্যয়
- গুলশান বা ধানমন্ডিতে **২.৫ কোটি টাকার ফ্ল্যাটে** উভয় পক্ষ থেকে ২% করে কমিশন বাবদ **১০ লাখ টাকা** অপচয় হয়।
- এছাড়া দ্রুত চুক্তি করানোর উদ্দেশ্যে অনেক সময় প্রপার্টির ত্রুটি গোপন করা বা অবাস্তব দাম হাঁকানোর প্রবণতা থাকে।

---

## হোমনেটের সরাসরি সুবিধা
১. **সরাসরি মালিকের সাথে যোগাযোগ:** প্রকৃত মালিকের সাথে সরাসরি কথা বলে দরদাম করুন।
২. **যাচাইকৃত তথ্য:** ফ্লোর, অভিমুখ ও সুনির্দিষ্ট ম্যাপ লোকেশন আগেই যাচাই করে পরিদর্শনে যান।
৩. **সম্পূর্ণ দালালমুক্ত ও শূন্য কমিশন:** হোমনেটে ক্রেতা ও বিক্রেতা উভয় পক্ষের জন্যই কোনো ব্রোকার ফি নেই।
    `.trim(),
    author: {
      name: "HomeNet Team",
    },
  },
];
