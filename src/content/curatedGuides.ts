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
  {
    id: "guide-rent-advance-law",
    slug: "bangladesh-rent-advance-law-tenant-rights",
    category: "Renting",
    title: "How Much Advance Rent Can a Landlord Legally Demand in Bangladesh?",
    titleBn: "বাড়িভাড়ায় অগ্রিম কত মাস নেওয়া যায়? ভাড়াটিয়ার আইনি অধিকার",
    excerpt:
      "The Premises Rent Control Act 1991 caps advance rent at one month and bars security deposits outright — yet three to six months is routinely demanded. What the law says, and what a tenant can do.",
    excerptBn:
      "১৯৯১ সালের বাড়ি ভাড়া নিয়ন্ত্রণ আইনে অগ্রিম ভাড়ার সীমা এক মাস এবং জামানত নেওয়া নিষিদ্ধ, অথচ ৩–৬ মাস অগ্রিম চাওয়াই স্বাভাবিক হয়ে দাঁড়িয়েছে। আইন কী বলে এবং ভাড়াটিয়া কী করতে পারেন।",
    readTime: "6 min read",
    imageUrl: null,
    publishedAt: "2026-10-30T09:00:00.000Z",
    updatedAt: "2026-10-30T00:00:00.000Z",
    href: "/guides/bangladesh-rent-advance-law-tenant-rights",
    sourceType: "internal",
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["Renting", "Rent Control Act", "Tenant Rights", "Advance Rent", "Dhaka"],
    tagsBn: ["ভাড়া", "বাড়ি ভাড়া নিয়ন্ত্রণ আইন", "ভাড়াটিয়ার অধিকার", "অগ্রিম ভাড়া", "ঢাকা"],
    author: {
      name: "HomeNet Team",
    },
    contentMarkdown: `
# How Much Advance Rent Can a Landlord Legally Demand?

> **Disclaimer:** This is general information, not legal advice. Section numbers and
> penalties under the Premises Rent Control Act 1991 are reported differently by
> different commentators. Confirm the current text with the Rent Controller's office
> or a qualified lawyer before acting.

Ask almost any tenant in Dhaka what they paid to move in and the answer is three months' advance. Sometimes six. Occasionally twelve. Ask what the law allows, and almost nobody knows.

The gap between those two answers is the subject of this guide.

---

## What the law actually says

Tenancies in Bangladesh are governed by the **Premises Rent Control Act, 1991**. On advance money, the Act is far stricter than common practice suggests:

- A landlord **may not take a security deposit** — not as *salami*, not as *premium*, not under any other name.
- A landlord **may not take more than one month's rent in advance** without the **prior written permission of the Rent Controller**.

There is one narrow exception: a **long lease of not less than twenty years** granted for development purposes, where a premium may be allowed.

So the ordinary Dhaka arrangement — three months' advance, non-refundable, agreed verbally — has no basis in the Act.

---

## Why nobody follows it

Three reasons, and it is worth being honest about all three:

1. **Demand outruns supply.** In sought-after areas a landlord can simply move to the next applicant, so the tenant who insists on the law loses the flat.
2. **Penalties are weak.** The Act's fines were set in 1991 and have never been revised for inflation. Commentators disagree on the exact figures — some describe a multiple of the excess amount, others a flat sum in the low thousands of taka — but all agree the deterrent is negligible today.
3. **Almost nobody files.** Enforcement requires a tenant to approach the Rent Controller, which most will not do while they still need the flat.

---

## What a tenant can realistically do

Insisting on the one-month rule will often cost you the flat. These steps are more practical:

**Get every taka in writing.** A receipt naming the amount, the date, and what it is for turns a disputed payment into a documented one. Refusal to issue a receipt is itself a warning sign.

**Write the refund terms into the agreement.** State when the advance is returned, what may be deducted, and within how many days after vacating. "Adjusted against the last months' rent" is clearer than "refundable", because it is self-executing.

**Record the flat's condition on day one.** Photograph every room, the fittings, the meters and any existing damage, and email the set to yourself and the landlord. Most deposit disputes are arguments about who broke what.

**Know where the Rent Controller sits.** You may never need the office, but a landlord who learns the tenant knows it exists often becomes more reasonable.

---

## Questions tenants ask

**Is a three-month advance illegal?**
Without the Rent Controller's prior written permission, it is outside what the Act permits. Common, but not lawful.

**Can the landlord keep the advance if I leave early?**
The agreement governs, which is exactly why the refund terms matter. The Act does not entitle a landlord to retain money as a penalty.

**Can rent be raised whenever the landlord likes?**
No. The Act provides for a fair rent and limits how often it may be increased. A yearly increase written into the agreement is the norm in practice.

**Does any of this apply to short stays?**
A holiday or serviced stay of a few nights is a different kind of arrangement, and the booking terms govern it.

---

## Where HomeNet fits

Most of the pressure to pay a large advance comes through a broker who has no stake in the tenancy that follows. On HomeNet you talk to the owner directly — which is also the person who can actually agree to the terms above.

Browse [flats to rent](/rent) and ask the owner about the advance before you visit.
`,
    contentMarkdownBn: `
# বাড়িভাড়ায় অগ্রিম কত মাস নেওয়া যায়?

> **দ্রষ্টব্য:** এটি সাধারণ তথ্য, আইনি পরামর্শ নয়। ১৯৯১ সালের বাড়ি ভাড়া নিয়ন্ত্রণ আইনের ধারা
> ও জরিমানার অঙ্ক নিয়ে বিভিন্ন সূত্রে ভিন্ন তথ্য আছে। পদক্ষেপ নেওয়ার আগে ভাড়া নিয়ন্ত্রকের
> দপ্তর বা একজন আইনজীবীর সঙ্গে যাচাই করে নিন।

ঢাকায় যেকোনো ভাড়াটিয়াকে জিজ্ঞেস করুন বাসায় ওঠার সময় কত দিতে হয়েছিল — উত্তর আসবে তিন মাসের অগ্রিম। কখনো ছয় মাস, কখনো বারো। আর আইনে কত অনুমোদিত জিজ্ঞেস করলে প্রায় কেউই জানেন না।

এই দুই উত্তরের ফারাকটাই এই লেখার বিষয়।

---

## আইন আসলে কী বলে

বাংলাদেশে ভাড়া সম্পর্ক পরিচালিত হয় **বাড়ি ভাড়া নিয়ন্ত্রণ আইন, ১৯৯১** দিয়ে। অগ্রিম টাকার ব্যাপারে আইনটি প্রচলিত রীতির চেয়ে অনেক কড়া:

- বাড়িওয়ালা **কোনো জামানত বা সিকিউরিটি নিতে পারবেন না** — সালামি, প্রিমিয়াম বা অন্য যে নামেই হোক।
- ভাড়া নিয়ন্ত্রকের **পূর্ব লিখিত অনুমতি ছাড়া এক মাসের ভাড়ার বেশি অগ্রিম নেওয়া যাবে না**।

একটি সংকীর্ণ ব্যতিক্রম আছে: উন্নয়নের উদ্দেশ্যে **কমপক্ষে বিশ বছরের দীর্ঘমেয়াদি ইজারার** ক্ষেত্রে প্রিমিয়াম নেওয়া যেতে পারে।

অর্থাৎ ঢাকার স্বাভাবিক ব্যবস্থা — মুখের কথায় তিন মাসের অফেরতযোগ্য অগ্রিম — আইনে এর ভিত্তি নেই।

---

## তবু কেন কেউ মানে না

তিনটি কারণ, এবং তিনটিই খোলাখুলি বলা দরকার:

১. **চাহিদা জোগানের চেয়ে বেশি।** ভালো এলাকায় বাড়িওয়ালা সহজেই পরের আবেদনকারীর কাছে যেতে পারেন, ফলে আইন ধরে বসে থাকা ভাড়াটিয়া বাসাটাই হারান।

২. **জরিমানা দুর্বল।** আইনের জরিমানা ১৯৯১ সালে নির্ধারিত, মূল্যস্ফীতি অনুযায়ী কখনো সংশোধন হয়নি। সঠিক অঙ্ক নিয়ে সূত্রে মতভেদ আছে — কেউ বলেন অতিরিক্ত অর্থের কয়েক গুণ, কেউ বলেন কয়েক হাজার টাকার নির্দিষ্ট জরিমানা — তবে সবাই একমত যে আজকের দিনে এটি কার্যত নিরুৎসাহক নয়।

৩. **প্রায় কেউ অভিযোগ করেন না।** এর জন্য ভাড়া নিয়ন্ত্রকের কাছে যেতে হয়, যা বাসায় থাকা অবস্থায় বেশিরভাগ মানুষ করতে চান না।

---

## ভাড়াটিয়া বাস্তবে কী করতে পারেন

এক মাসের নিয়মে অনড় থাকলে প্রায়ই বাসাটি হাতছাড়া হয়। নিচের পদক্ষেপগুলো বেশি কাজে দেয়:

**প্রতিটি টাকার রসিদ নিন।** অঙ্ক, তারিখ ও কী বাবদ — এই তিনটি লেখা রসিদ বিতর্কিত লেনদেনকে প্রমাণে পরিণত করে। রসিদ দিতে অস্বীকৃতি নিজেই একটি সতর্কসংকেত।

**ফেরতের শর্ত চুক্তিতে লিখুন।** কবে ফেরত, কী কাটা যাবে, বাসা ছাড়ার কত দিনের মধ্যে — সব লিখুন। "শেষ মাসগুলোর ভাড়ার সঙ্গে সমন্বয় হবে" লেখা "ফেরতযোগ্য" লেখার চেয়ে নিরাপদ, কারণ তা নিজে থেকেই কার্যকর হয়।

**প্রথম দিনেই বাসার অবস্থা রেকর্ড করুন।** প্রতিটি ঘর, ফিটিংস, মিটার ও আগে থেকে থাকা ক্ষতির ছবি তুলে নিজের ও বাড়িওয়ালার ইমেইলে পাঠিয়ে রাখুন। জামানত নিয়ে বেশিরভাগ বিরোধ আসলে "কে কী নষ্ট করেছে" নিয়ে।

**ভাড়া নিয়ন্ত্রকের দপ্তর কোথায় জেনে রাখুন।** হয়তো কখনো দরকার হবে না, তবে ভাড়াটিয়া বিষয়টি জানেন বুঝলে বাড়িওয়ালা অনেক সময় নমনীয় হন।

---

## যে প্রশ্নগুলো ভাড়াটিয়ারা করেন

**তিন মাসের অগ্রিম কি বেআইনি?**
ভাড়া নিয়ন্ত্রকের পূর্ব লিখিত অনুমতি ছাড়া এটি আইনের অনুমোদিত সীমার বাইরে। প্রচলিত, কিন্তু আইনসম্মত নয়।

**আগে চলে গেলে বাড়িওয়ালা কি অগ্রিম রেখে দিতে পারেন?**
চুক্তিই নির্ধারক — ঠিক এ কারণেই ফেরতের শর্ত লিখে রাখা জরুরি। শাস্তি হিসেবে টাকা আটকে রাখার অধিকার আইন দেয় না।

**বাড়িওয়ালা কি যখন খুশি ভাড়া বাড়াতে পারেন?**
না। আইনে ন্যায্য ভাড়ার বিধান আছে এবং কত ঘন ঘন বাড়ানো যাবে তার সীমা আছে। বাস্তবে চুক্তিতে বছরে একবার বৃদ্ধির শর্ত লেখাই রীতি।

**শর্ট-স্টের ক্ষেত্রেও কি এসব প্রযোজ্য?**
কয়েক রাতের হলিডে বা সার্ভিস স্টে ভিন্ন ধরনের ব্যবস্থা, সেখানে বুকিংয়ের শর্তই প্রযোজ্য।

---

## এখানে HomeNet কোথায়

বড় অঙ্কের অগ্রিমের চাপ বেশিরভাগ সময় আসে এমন দালালের মাধ্যমে, যার ভাড়া-সম্পর্কে কোনো দায় থাকে না। HomeNet-এ আপনি সরাসরি মালিকের সঙ্গে কথা বলেন — অর্থাৎ যিনি আসলে উপরের শর্তগুলোতে রাজি হতে পারেন।

[ভাড়ার ফ্ল্যাট দেখুন](/rent) এবং বাসা দেখতে যাওয়ার আগেই অগ্রিমের বিষয়ে জেনে নিন।
`,
  },
  {
    id: "guide-rent-checklist",
    slug: "dhaka-flat-rent-checklist-before-signing",
    category: "Renting",
    title: "Renting a Flat in Dhaka: What to Check Before You Sign",
    titleBn: "ঢাকায় বাসা ভাড়া নেওয়ার আগে যে ১০টি বিষয় দেখে নেবেন",
    excerpt:
      "Water pressure on the top floor, which lift runs during load-shedding, whose name the gas line is in, and what the agreement must say — the checks that decide whether a flat is livable.",
    excerptBn:
      "উপরের তলায় পানির চাপ, লোডশেডিংয়ে কোন লিফট চলে, গ্যাস লাইন কার নামে, আর চুক্তিতে কী কী থাকতেই হবে — যে বিষয়গুলো ঠিক করে দেয় বাসাটি আসলে বাসযোগ্য কি না।",
    readTime: "7 min read",
    imageUrl: null,
    publishedAt: "2026-10-30T09:30:00.000Z",
    updatedAt: "2026-10-30T00:00:00.000Z",
    href: "/guides/dhaka-flat-rent-checklist-before-signing",
    sourceType: "internal",
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["Renting", "Dhaka", "Checklist", "Tenant", "Rental Agreement"],
    tagsBn: ["ভাড়া", "ঢাকা", "চেকলিস্ট", "ভাড়াটিয়া", "ভাড়ার চুক্তি"],
    author: {
      name: "HomeNet Team",
    },
    contentMarkdown: `
# Renting a Flat in Dhaka: What to Check Before You Sign

Most people view a flat for fifteen minutes, in daylight, on a day the water happens to be running. Then they live with the decision for two years.

This is the list worth working through before you commit.

---

## 1. Visit at the worst hour, not the best

Ask to see the flat between 7 and 9 in the evening. That is when the building is full, the lift queue is longest, the kitchen smells of every floor reach the stairwell, and the street noise peaks. A flat that is pleasant then is pleasant always.

## 2. Water — run every tap yourself

Do not accept "water is fine". Open the kitchen tap and both bathroom taps at once and watch the pressure. On the fifth floor and above, ask specifically:
- What hours is the pump run?
- Is there a reserve tank, and when was it last cleaned?
- Has the building had a WASA supply problem this year?

Weak water pressure is the single most common reason tenants leave early.

## 3. Lift and generator — ask what runs during load-shedding

Buildings often have two lifts and a generator that powers only one. Ask which one, and whether the generator covers flats or only common areas. "Full generator backup" and "generator backup" mean very different things in practice.

## 4. Gas line — whose name, and is it legal

A Titas connection registered to the building is normal. An unregistered or shared line is a risk you inherit. Ask to see a recent bill, and check the name on it matches the owner.

## 5. Parking — written into the agreement or it does not exist

Verbal parking promises evaporate. If a space is included, the agreement must name it: which slot, for how many vehicles, and whether it is covered.

## 6. Who actually owns the flat

Ask to see the owner's NID and a document showing ownership. If you are dealing with a caretaker or a relative, ask for written authority to let. Paying advance to someone with no authority is the most expensive mistake in this list.

## 7. The service charge — what it covers and who sets it

Find out the amount, what it includes (lift, guard, cleaning, generator fuel, water bill), how often it has risen, and whether it is paid to the owner or to a flat-owners' association.

## 8. Mobile signal and internet

Check your own phone's signal inside the flat, not on the balcony. Ask which ISPs have a line into the building — in many areas only one or two do.

## 9. The agreement must say these things

- Monthly rent, and the date it is due
- Advance paid, and exactly how and when it is returned
- Any annual increase, as a stated percentage or amount
- Notice period on both sides
- Who pays for which repairs
- Service charge and utility responsibility

Both parties sign every page. You keep an original, not a photocopy.

## 10. Photograph everything on day one

Every room, every fitting, both meters with their readings, and every existing crack or stain. Email the set to yourself and to the owner on the day you move in. When the advance is being settled two years later, this is the only evidence that matters.

---

## Questions renters ask

**Should I pay anything before seeing the papers?**
No. A token to "hold" a flat before you have seen proof of ownership is money you may not see again.

**Is a broker necessary?**
No. On HomeNet listings come from owners, so the person showing you the flat is the person who can agree the terms.

**What if the owner refuses a written agreement?**
Treat it as a decision, not an obstacle. An owner unwilling to put the terms in writing is telling you how disputes will go.

---

Browse [flats to rent](/rent) and message the owner directly with the questions above before you spend an afternoon travelling.
`,
    contentMarkdownBn: `
# ঢাকায় বাসা ভাড়া নেওয়ার আগে যা দেখে নেবেন

বেশিরভাগ মানুষ দিনের বেলায় পনেরো মিনিট বাসা দেখেন — এমন একদিন, যেদিন ঘটনাচক্রে পানি আসছিল। তারপর সেই সিদ্ধান্ত নিয়ে দুই বছর থাকতে হয়।

চুক্তি করার আগে এই তালিকাটা একবার মিলিয়ে নেওয়া ভালো।

---

## ১. সবচেয়ে খারাপ সময়ে গিয়ে দেখুন

সন্ধ্যা ৭টা থেকে ৯টার মধ্যে বাসা দেখতে চান। তখনই ভবন ভর্তি থাকে, লিফটের লাইন সবচেয়ে বড় হয়, সিঁড়িতে সব তলার রান্নার গন্ধ আসে, রাস্তার শব্দও সর্বোচ্চ। যে বাসা তখন স্বস্তিদায়ক, সেটি সব সময়ই স্বস্তিদায়ক।

## ২. পানি — প্রতিটি কল নিজে খুলে দেখুন

"পানির সমস্যা নেই" কথাটা মেনে নেবেন না। রান্নাঘরের ও দুই বাথরুমের কল একসঙ্গে খুলে চাপ দেখুন। পাঁচতলা বা তার উপরে হলে আলাদা করে জিজ্ঞেস করুন:
- পাম্প কোন কোন সময় চালানো হয়?
- রিজার্ভ ট্যাংক আছে কি, শেষ কবে পরিষ্কার হয়েছে?
- এ বছর ওয়াসার সরবরাহে সমস্যা হয়েছে কি?

পানির চাপ কম — ভাড়াটিয়াদের আগেভাগে বাসা ছাড়ার সবচেয়ে সাধারণ কারণ এটিই।

## ৩. লিফট ও জেনারেটর — লোডশেডিংয়ে কী চলে জিজ্ঞেস করুন

অনেক ভবনে দুটি লিফট থাকে, কিন্তু জেনারেটরে চলে একটি। কোনটি চলে জেনে নিন, আর জেনারেটর ফ্ল্যাট পর্যন্ত যায় নাকি শুধু কমন এরিয়ায় — সেটিও। "ফুল জেনারেটর ব্যাকআপ" আর "জেনারেটর ব্যাকআপ" বাস্তবে সম্পূর্ণ আলাদা জিনিস।

## ৪. গ্যাস লাইন — কার নামে, বৈধ কি না

তিতাসের সংযোগ ভবনের নামে থাকা স্বাভাবিক। অনিবন্ধিত বা ভাগাভাগির লাইন হলে ঝুঁকিটা আপনার ঘাড়েই আসে। সাম্প্রতিক একটি বিল দেখতে চান এবং নাম মালিকের সঙ্গে মেলে কি না দেখুন।

## ৫. পার্কিং — চুক্তিতে লেখা না থাকলে নেই

মুখের পার্কিং প্রতিশ্রুতি টেকে না। জায়গা অন্তর্ভুক্ত থাকলে চুক্তিতে লিখতে হবে: কোন স্লট, কয়টি গাড়ির জন্য, ছাউনি আছে কি না।

## ৬. ফ্ল্যাটের মালিক আসলে কে

মালিকের এনআইডি ও মালিকানার প্রমাণপত্র দেখতে চান। কেয়ারটেকার বা আত্মীয়ের সঙ্গে কথা হলে ভাড়া দেওয়ার লিখিত অনুমতি দেখতে চান। অনুমতিহীন কারও হাতে অগ্রিম দেওয়া এই তালিকার সবচেয়ে ব্যয়বহুল ভুল।

## ৭. সার্ভিস চার্জ — কী কী অন্তর্ভুক্ত, কে ঠিক করে

অঙ্ক কত, কী কী ধরা (লিফট, দারোয়ান, পরিচ্ছন্নতা, জেনারেটরের তেল, পানির বিল), কত ঘন ঘন বেড়েছে, এবং টাকা মালিককে না ফ্ল্যাট ওনার্স সমিতিকে দিতে হয় — জেনে নিন।

## ৮. মোবাইল নেটওয়ার্ক ও ইন্টারনেট

বারান্দায় নয়, ঘরের ভেতরে নিজের ফোনের নেটওয়ার্ক দেখুন। ভবনে কোন কোন আইএসপির লাইন আছে জিজ্ঞেস করুন — অনেক এলাকায় মাত্র এক-দুটিরই থাকে।

## ৯. চুক্তিতে এই বিষয়গুলো থাকতেই হবে

- মাসিক ভাড়া এবং কত তারিখে দিতে হবে
- কত অগ্রিম দেওয়া হলো, কীভাবে ও কবে ফেরত
- বার্ষিক বৃদ্ধি থাকলে নির্দিষ্ট শতাংশ বা অঙ্কে
- দুই পক্ষের নোটিশের সময়সীমা
- কোন মেরামতের খরচ কে দেবে
- সার্ভিস চার্জ ও ইউটিলিটি বিলের দায়

দুই পক্ষ প্রতিটি পাতায় সই করবে। আপনি ফটোকপি নয়, মূল কপি রাখবেন।

## ১০. প্রথম দিনেই সব ছবি তুলে রাখুন

প্রতিটি ঘর, প্রতিটি ফিটিংস, রিডিংসহ দুই মিটার, এবং আগে থেকে থাকা প্রতিটি ফাটল বা দাগ। ওঠার দিনেই ছবিগুলো নিজের ও মালিকের ইমেইলে পাঠিয়ে রাখুন। দুই বছর পর অগ্রিমের হিসাব মেলানোর সময় একমাত্র এই প্রমাণটিই কাজে লাগে।

---

## যে প্রশ্নগুলো ভাড়াটিয়ারা করেন

**কাগজ দেখার আগে কি কোনো টাকা দেওয়া উচিত?**
না। মালিকানার প্রমাণ দেখার আগে বাসা "আটকে রাখার" জন্য দেওয়া টাকা অনেক সময় আর ফেরত আসে না।

**দালাল কি লাগবেই?**
না। HomeNet-এ বিজ্ঞাপন দেন মালিক নিজেই, তাই যিনি বাসা দেখাচ্ছেন তিনিই শর্তে রাজি হতে পারেন।

**মালিক লিখিত চুক্তিতে রাজি না হলে?**
এটিকে বাধা নয়, একটি তথ্য হিসেবে দেখুন। যিনি শর্ত লিখতে চান না, তিনি আগেই জানিয়ে দিচ্ছেন ভবিষ্যতে বিরোধ হলে কী হবে।

---

[ভাড়ার ফ্ল্যাট দেখুন](/rent) এবং বিকেলটা যাতায়াতে খরচ করার আগেই মালিককে উপরের প্রশ্নগুলো পাঠিয়ে দিন।
`,
  },
  {
    id: "guide-rajuk-verify",
    slug: "rajuk-approved-flat-how-to-verify",
    category: "Buying",
    title: "Is This Flat RAJUK-Approved? How to Check Before You Buy",
    titleBn: "ফ্ল্যাটটি কি রাজউক অনুমোদিত? কেনার আগে যেভাবে যাচাই করবেন",
    excerpt:
      "An approval seal on a plan proves the design was approved — not that the building matches it. RAJUK itself has reported that most buildings deviate from their approved designs.",
    excerptBn:
      "নকশায় অনুমোদনের সিল থাকার অর্থ নকশাটি অনুমোদিত হয়েছিল — ভবনটি সেই নকশা মেনে উঠেছে, তা নয়। রাজউকের নিজের প্রতিবেদনেই এসেছে, বেশিরভাগ ভবন অনুমোদিত নকশা থেকে সরে গেছে।",
    readTime: "6 min read",
    imageUrl: null,
    publishedAt: "2026-10-30T10:00:00.000Z",
    updatedAt: "2026-10-30T00:00:00.000Z",
    href: "/guides/rajuk-approved-flat-how-to-verify",
    sourceType: "internal",
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["RAJUK", "Buying", "Building Approval", "Dhaka", "Due Diligence"],
    tagsBn: ["রাজউক", "ক্রয়", "ভবন অনুমোদন", "ঢাকা", "যাচাই"],
    author: {
      name: "HomeNet Team",
    },
    contentMarkdown: `
# Is This Flat RAJUK-Approved?

> **Disclaimer:** General guidance only. Approval requirements and procedures differ
> between RAJUK, CDA, KDA, RDA and municipal authorities, and change over time.
> Have a lawyer review the documents before any payment.

"RAJUK approved" appears in nearly every Dhaka flat advertisement. It is worth knowing what the phrase does and does not promise.

---

## What RAJUK approval is

RAJUK (Rajdhani Unnayan Kartripakkha) is the authority that grants construction permission in Dhaka and its surrounding areas. Before building begins, the design is submitted and checked against planning rules, setbacks, height limits and the National Building Code. If it passes, RAJUK approves **the plan**.

Outside Dhaka the equivalent authority is CDA in Chattogram, KDA in Khulna, RDA in Rajshahi, or the local municipality.

---

## What it does not prove

Here is the part most buyers miss: **approval attaches to the drawing, not to the finished building.**

A plan can be approved for six floors and eight built. Setbacks approved on paper can be absorbed into extra floor area on site. RAJUK has itself reported that the large majority of buildings in parts of Dhaka deviate from their approved designs.

So "RAJUK approved" is a necessary check, not a sufficient one.

---

## How to actually verify

**1. Ask for the approved plan itself.**
Not a photocopy of a summary. The approved drawing carries an approval seal, a reference or memo number, and a date. Note all three.

**2. Check the names and the plot.**
The approval is issued for a specific plot and owner. Confirm the plot number and the owner's name match the deed and the mutation record you have been shown.

**3. Count the floors.**
Stand outside and count. Then count the floors on the approved plan. If the building has more, you are looking at a deviation — and deviations can expose owners to penalties or demolition orders.

**4. Walk the setbacks.**
The plan shows how much open space must remain on each side. Pace it out. Extensions into the setback are the most common deviation after extra floors.

**5. Take the reference number to the authority.**
If the seller resists this step, treat that as the answer. A genuine approval can be checked against the issuing office's records.

**6. Have a lawyer read it alongside the title documents.**
Approval, deed, mutation and khatian should all describe the same plot and the same owner. A lawyer will spot a mismatch you will not.

---

## Questions buyers ask

**Can I check RAJUK approval online?**
There is no widely available public portal for verifying an individual building's approval. In practice verification means the approved plan plus a check with the issuing office.

**The building is old — is approval still relevant?**
Yes. An unapproved or deviated structure stays unapproved regardless of age, and that is inherited by whoever buys into it.

**Does an approved plan mean the flat is safe?**
It means the design was reviewed. Whether the construction followed the design, and what materials were used, are separate questions — which is why the floor count and setback checks matter.

**What if the building is already deviated?**
Get legal advice before paying. Some deviations are regularised, others are not, and the exposure sits with the owner.

---

See our [pre-purchase inspection checklist](/guides/dhaka-apartment-buyer-inspection-checklist) for what to examine inside the flat, and browse [verified listings](/buy) where ownership documents have been reviewed.
`,
    contentMarkdownBn: `
# ফ্ল্যাটটি কি রাজউক অনুমোদিত?

> **দ্রষ্টব্য:** এটি সাধারণ দিকনির্দেশনা। রাজউক, সিডিএ, কেডিএ, আরডিএ ও পৌরসভাভেদে
> অনুমোদনের শর্ত ও পদ্ধতি আলাদা এবং সময়ের সঙ্গে বদলায়। টাকা দেওয়ার আগে একজন
> আইনজীবীকে দিয়ে কাগজপত্র দেখিয়ে নিন।

ঢাকার প্রায় প্রতিটি ফ্ল্যাটের বিজ্ঞাপনেই "রাজউক অনুমোদিত" লেখা থাকে। কথাটা আসলে কী নিশ্চিত করে আর কী করে না, সেটা জানা দরকার।

---

## রাজউক অনুমোদন কী

রাজউক (রাজধানী উন্নয়ন কর্তৃপক্ষ) ঢাকা ও আশপাশের এলাকায় নির্মাণের অনুমতি দেয়। নির্মাণ শুরুর আগে নকশা জমা দিতে হয়, সেটি পরিকল্পনা বিধি, সেটব্যাক, উচ্চতার সীমা ও ন্যাশনাল বিল্ডিং কোডের সঙ্গে মিলিয়ে দেখা হয়। উতরে গেলে রাজউক **নকশাটি** অনুমোদন করে।

ঢাকার বাইরে একই কাজ করে চট্টগ্রামে সিডিএ, খুলনায় কেডিএ, রাজশাহীতে আরডিএ, কিংবা স্থানীয় পৌরসভা।

---

## যা এটি প্রমাণ করে না

এখানেই বেশিরভাগ ক্রেতা ভুল করেন: **অনুমোদন নকশার সঙ্গে যুক্ত, নির্মিত ভবনের সঙ্গে নয়।**

ছয়তলার অনুমোদন নিয়ে আটতলা উঠতে পারে। কাগজে অনুমোদিত সেটব্যাক বাস্তবে বাড়তি ফ্লোরে ঢুকে যেতে পারে। রাজউকের নিজের প্রতিবেদনেই এসেছে, ঢাকার কিছু এলাকায় অধিকাংশ ভবনই অনুমোদিত নকশা থেকে সরে গেছে।

তাই "রাজউক অনুমোদিত" একটি প্রয়োজনীয় যাচাই, কিন্তু যথেষ্ট নয়।

---

## আসলে যেভাবে যাচাই করবেন

**১. অনুমোদিত নকশাটিই দেখতে চান।**
সারসংক্ষেপের ফটোকপি নয়। অনুমোদিত নকশায় অনুমোদনের সিল, স্মারক বা রেফারেন্স নম্বর এবং তারিখ থাকে। তিনটিই টুকে নিন।

**২. নাম ও প্লট মিলিয়ে দেখুন।**
অনুমোদন নির্দিষ্ট প্লট ও মালিকের নামে হয়। প্লট নম্বর ও মালিকের নাম দলিল এবং নামজারির কাগজের সঙ্গে মেলে কি না নিশ্চিত করুন।

**৩. তলা গুনুন।**
বাইরে দাঁড়িয়ে গুনুন, তারপর অনুমোদিত নকশায় গুনুন। ভবনে বেশি তলা থাকলে সেটি ব্যত্যয় — আর ব্যত্যয়ের কারণে জরিমানা বা অপসারণের নির্দেশ আসতে পারে।

**৪. সেটব্যাক মেপে দেখুন।**
নকশায় লেখা থাকে চারপাশে কতটুকু খোলা জায়গা রাখতে হবে। পা ফেলে মেপে নিন। বাড়তি তলার পরেই সবচেয়ে সাধারণ ব্যত্যয় হলো সেটব্যাকের ভেতরে নির্মাণ।

**৫. রেফারেন্স নম্বর নিয়ে কর্তৃপক্ষের কাছে যান।**
বিক্রেতা এই ধাপে আপত্তি করলে সেটাই উত্তর। প্রকৃত অনুমোদন ইস্যুকারী দপ্তরের নথির সঙ্গে মিলিয়ে দেখা যায়।

**৬. আইনজীবীকে দিয়ে মালিকানার কাগজের সঙ্গে মিলিয়ে পড়ান।**
অনুমোদন, দলিল, নামজারি ও খতিয়ান — সবগুলোতে একই প্লট ও একই মালিকের কথা থাকতে হবে। অমিল থাকলে আইনজীবী ধরতে পারবেন, আপনি হয়তো পারবেন না।

---

## যে প্রশ্নগুলো ক্রেতারা করেন

**রাজউক অনুমোদন কি অনলাইনে যাচাই করা যায়?**
একক ভবনের অনুমোদন যাচাইয়ের জন্য সর্বজনীন কোনো পোর্টাল সহজলভ্য নয়। বাস্তবে যাচাই মানে অনুমোদিত নকশা, সঙ্গে ইস্যুকারী দপ্তরে মিলিয়ে দেখা।

**ভবন পুরনো — অনুমোদন কি এখনো জরুরি?**
হ্যাঁ। অনুমোদনহীন বা ব্যত্যয়যুক্ত ভবন বয়সের কারণে বৈধ হয়ে যায় না, আর সেই দায় ক্রেতার ঘাড়েই আসে।

**অনুমোদিত নকশা মানে কি ফ্ল্যাট নিরাপদ?**
মানে নকশাটি পরীক্ষা করা হয়েছিল। নির্মাণ নকশা মেনে হয়েছে কি না এবং কী মানের সামগ্রী ব্যবহার হয়েছে — সেগুলো আলাদা প্রশ্ন। এ কারণেই তলা গোনা ও সেটব্যাক মাপা জরুরি।

**ভবনে ইতিমধ্যে ব্যত্যয় থাকলে কী করব?**
টাকা দেওয়ার আগে আইনি পরামর্শ নিন। কিছু ব্যত্যয় নিয়মিতকরণ হয়, কিছু হয় না — আর ঝুঁকিটা মালিকের।

---

ফ্ল্যাটের ভেতরে কী দেখবেন তার জন্য দেখুন [কেনার আগের পরিদর্শন চেকলিস্ট](/guides/dhaka-apartment-buyer-inspection-checklist), আর ঘুরে দেখুন [ভেরিফায়েড লিস্টিং](/buy)।
`,
  },
  {
    id: "guide-baina-nama",
    slug: "baina-nama-agreement-to-sell-bangladesh",
    category: "Legal",
    title: "What Is a Baina-nama? The Agreement That Protects Your Deposit",
    titleBn: "বায়না দলিল কী? যে চুক্তি আপনার অগ্রিম টাকা রক্ষা করে",
    excerpt:
      "A baina-nama is the agreement to sell signed before the final deed. Unregistered, it is far weaker than most buyers assume — and the deposit is usually already paid by then.",
    excerptBn:
      "বায়না দলিল হলো চূড়ান্ত সাফ-কবলার আগে করা বিক্রয়চুক্তি। রেজিস্ট্রি না করালে এটি ক্রেতারা যা ভাবেন তার চেয়ে অনেক দুর্বল — অথচ অগ্রিম টাকা ততক্ষণে দেওয়া হয়ে গেছে।",
    readTime: "6 min read",
    imageUrl: null,
    publishedAt: "2026-10-30T10:30:00.000Z",
    updatedAt: "2026-10-30T00:00:00.000Z",
    href: "/guides/baina-nama-agreement-to-sell-bangladesh",
    sourceType: "internal",
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["Baina", "Legal", "Agreement to Sell", "Deposit", "Saf-Kabala"],
    tagsBn: ["বায়না", "আইন", "বিক্রয়চুক্তি", "অগ্রিম", "সাফ-কবলা"],
    author: {
      name: "HomeNet Team",
    },
    contentMarkdown: `
# What Is a Baina-nama?

> **Disclaimer:** General information, not legal advice. Registration requirements and
> time limits under the Registration Act and the Specific Relief Act have been amended
> over the years. Have a lawyer draft or review any baina before you pay.

Between agreeing a price and signing the final sale deed (*Saf-Kabala*), there is usually a gap of weeks or months — while the buyer arranges funds and the seller clears paperwork.

The **baina-nama**, or agreement to sell, is the document that holds that gap together. It is also the point at which most of the buyer's money is already at risk.

---

## What it is

A baina-nama records that:
- The seller agrees to sell a specified property to a specified buyer
- At an agreed price
- With an earnest payment (the *baina*) made now
- And the balance payable by a stated deadline, at which point the sale deed is executed

It is a promise to transfer. It is **not** the transfer itself — ownership passes only when the sale deed is registered.

---

## Registered or unregistered: the distinction that matters

Many baina agreements in Bangladesh are written on stamp paper, signed by witnesses, and never registered. That is cheaper and quicker, and it is where buyers get hurt.

An unregistered agreement is far harder to enforce if the seller changes their mind or sells to someone else. A **registered** baina-nama, by contrast, creates a public record that the property is already under agreement — which is what deters a second sale.

The rule of thumb: the larger the earnest money, the less sense an unregistered baina makes.

---

## What a baina-nama must contain

- **Full identification of the property** — plot or flat number, khatian, mouza, area, boundaries. Copied from the deed, not written from memory.
- **Both parties' details** — full names, parentage, addresses, NID numbers.
- **The total price, in words and figures.**
- **The earnest amount paid**, the date, and the method. Pay by bank transfer or cheque, never cash, so that payment is independently provable.
- **The deadline** for completing the sale.
- **What happens on default** — on both sides. If the buyer fails, is the earnest forfeited in whole or part? If the seller fails, what is the remedy?
- **Who bears registration costs.**
- **Possession** — when it passes, and in what condition.
- Signatures of both parties and witnesses on every page.

---

## Before you sign, verify the seller can actually sell

A baina with someone who does not own the property is worth nothing. Before paying:
- Read the current title deed and trace the chain backwards
- Check the **khatian** and the **mutation** record are in the seller's name
- Confirm land development tax (*khajna*) receipts are up to date
- Search for existing mortgages or charges
- If a developer is selling, check the power of attorney from the landowner

See our guides on [khatian verification](/guides/how-to-verify-khatian-cs-sa-rs-bs) and [namjari](/guides/namzari-mutation-bangladesh-guide).

---

## Questions buyers ask

**Is a baina-nama compulsory?**
No, but paying any significant earnest money without one leaves nothing in writing about what the money was for.

**How much earnest money is normal?**
There is no fixed rule; it is negotiated. The relevant question is not the percentage but whether the agreement is registered and what the default terms say.

**Can the seller sell to someone else after taking baina?**
They should not, and a registered agreement makes it far harder. With an unregistered one, recovery becomes a court matter.

**What if the seller simply refuses to execute the final deed?**
Specific performance — asking a court to compel the sale — is the usual route, and the agreement's terms and registration status weigh heavily. Take legal advice early; time limits apply.

---

Browse [verified listings](/buy) where ownership documents have already been reviewed before the listing goes live.
`,
    contentMarkdownBn: `
# বায়না দলিল কী?

> **দ্রষ্টব্য:** এটি সাধারণ তথ্য, আইনি পরামর্শ নয়। রেজিস্ট্রেশন আইন ও সুনির্দিষ্ট প্রতিকার
> আইনের রেজিস্ট্রির শর্ত ও সময়সীমা সময়ে সময়ে সংশোধিত হয়েছে। টাকা দেওয়ার আগে
> আইনজীবীকে দিয়ে বায়নানামা তৈরি বা যাচাই করিয়ে নিন।

দাম ঠিক হওয়া আর চূড়ান্ত সাফ-কবলা দলিল সম্পাদনের মাঝে সাধারণত কয়েক সপ্তাহ বা কয়েক মাসের ব্যবধান থাকে — ক্রেতা টাকার ব্যবস্থা করেন, বিক্রেতা কাগজপত্র গোছান।

এই সময়টা ধরে রাখে **বায়না দলিল** বা বিক্রয়চুক্তি। আর এই পর্যায়েই ক্রেতার বেশিরভাগ টাকা ঝুঁকিতে চলে আসে।

---

## এটি কী

বায়না দলিলে লেখা থাকে:
- বিক্রেতা নির্দিষ্ট সম্পত্তি নির্দিষ্ট ক্রেতার কাছে বিক্রি করতে সম্মত
- নির্ধারিত দামে
- এখন কিছু অগ্রিম (বায়না) দেওয়া হলো
- বাকি টাকা নির্দিষ্ট তারিখের মধ্যে দেওয়া হবে, তখন সাফ-কবলা সম্পাদিত হবে

এটি হস্তান্তরের প্রতিশ্রুতি — হস্তান্তর **নয়**। মালিকানা বদলায় কেবল সাফ-কবলা রেজিস্ট্রি হলে।

---

## রেজিস্ট্রিকৃত না অরেজিস্ট্রিকৃত: এখানেই আসল পার্থক্য

বাংলাদেশে বেশিরভাগ বায়না স্ট্যাম্প কাগজে লেখা হয়, সাক্ষীরা সই করেন, কিন্তু রেজিস্ট্রি হয় না। এতে খরচ ও সময় বাঁচে — এবং ঠিক এখানেই ক্রেতারা ক্ষতিগ্রস্ত হন।

বিক্রেতা মত বদলালে বা অন্যের কাছে বিক্রি করে দিলে অরেজিস্ট্রিকৃত চুক্তি কার্যকর করা অনেক কঠিন। বিপরীতে **রেজিস্ট্রিকৃত** বায়না একটি সরকারি রেকর্ড তৈরি করে যে সম্পত্তিটি ইতিমধ্যে চুক্তির অধীন — দ্বিতীয়বার বিক্রি সেটিই ঠেকায়।

সহজ নিয়ম: বায়নার অঙ্ক যত বড়, অরেজিস্ট্রিকৃত রাখার যুক্তি তত দুর্বল।

---

## বায়না দলিলে যা থাকতেই হবে

- **সম্পত্তির পূর্ণ পরিচয়** — প্লট বা ফ্ল্যাট নম্বর, খতিয়ান, মৌজা, পরিমাণ, চৌহদ্দি। দলিল দেখে লিখতে হবে, স্মৃতি থেকে নয়।
- **দুই পক্ষের বিবরণ** — পূর্ণ নাম, পিতৃপরিচয়, ঠিকানা, এনআইডি নম্বর।
- **মোট মূল্য**, কথায় ও অঙ্কে।
- **প্রদত্ত বায়নার অঙ্ক**, তারিখ ও মাধ্যম। নগদে নয় — ব্যাংক ট্রান্সফার বা চেকে দিন, যাতে লেনদেন স্বাধীনভাবে প্রমাণ করা যায়।
- **সম্পন্ন করার সময়সীমা।**
- **খেলাপ হলে কী হবে** — দুই পক্ষের জন্যই। ক্রেতা ব্যর্থ হলে বায়না পুরো বাজেয়াপ্ত হবে নাকি আংশিক? বিক্রেতা ব্যর্থ হলে প্রতিকার কী?
- **রেজিস্ট্রেশন খরচ কে বহন করবে।**
- **দখল** — কবে এবং কী অবস্থায় হস্তান্তর হবে।
- প্রতিটি পাতায় দুই পক্ষ ও সাক্ষীদের সই।

---

## সই করার আগে যাচাই করুন বিক্রেতা আদৌ বিক্রি করতে পারেন কি না

যিনি মালিক নন, তাঁর সঙ্গে বায়নার কোনো মূল্য নেই। টাকা দেওয়ার আগে:
- বর্তমান দলিল পড়ুন এবং পেছনের ধারাবাহিকতা মিলিয়ে দেখুন
- **খতিয়ান** ও **নামজারি** বিক্রেতার নামে আছে কি না দেখুন
- ভূমি উন্নয়ন কর (**খাজনা**) হালনাগাদ কি না নিশ্চিত করুন
- বন্ধক বা দায় আছে কি না খোঁজ নিন
- ডেভেলপার বিক্রি করলে জমির মালিকের দেওয়া আমমোক্তারনামা দেখুন

দেখুন আমাদের [খতিয়ান যাচাই](/guides/how-to-verify-khatian-cs-sa-rs-bs) ও [নামজারি](/guides/namzari-mutation-bangladesh-guide) গাইড।

---

## যে প্রশ্নগুলো ক্রেতারা করেন

**বায়না দলিল কি বাধ্যতামূলক?**
না, তবে উল্লেখযোগ্য অঙ্কের অগ্রিম এটি ছাড়া দিলে টাকাটা কী বাবদ দেওয়া হলো তার কোনো লিখিত প্রমাণ থাকে না।

**বায়না সাধারণত কত দিতে হয়?**
নির্দিষ্ট নিয়ম নেই, আলোচনায় ঠিক হয়। আসল প্রশ্ন শতাংশ নয় — চুক্তিটি রেজিস্ট্রিকৃত কি না এবং খেলাপের শর্ত কী।

**বায়না নেওয়ার পর বিক্রেতা কি অন্যের কাছে বিক্রি করতে পারেন?**
করা উচিত নয়, আর রেজিস্ট্রিকৃত চুক্তি থাকলে তা অনেক কঠিন। অরেজিস্ট্রিকৃত হলে টাকা উদ্ধার আদালতের বিষয় হয়ে দাঁড়ায়।

**বিক্রেতা চূড়ান্ত দলিল করতে অস্বীকার করলে?**
সুনির্দিষ্ট কার্যসম্পাদন — অর্থাৎ আদালতের মাধ্যমে বিক্রি সম্পন্ন করতে বাধ্য করা — সাধারণ পথ, আর সেখানে চুক্তির শর্ত ও রেজিস্ট্রি থাকা না থাকা বড় ভূমিকা রাখে। দ্রুত আইনি পরামর্শ নিন, সময়সীমা প্রযোজ্য।

---

ঘুরে দেখুন [ভেরিফায়েড লিস্টিং](/buy), যেখানে বিজ্ঞাপন প্রকাশের আগেই মালিকানার কাগজপত্র যাচাই করা হয়।
`,
  },
  {
    id: "guide-heba-vs-safkabala",
    slug: "heba-gift-deed-vs-sale-deed-bangladesh",
    category: "Legal",
    title: "Heba, Danpatra or Saf-Kabala: Which Deed Transfers Property?",
    titleBn: "হেবা, দানপত্র নাকি সাফ-কবলা: কোন দলিলে সম্পত্তি হস্তান্তর হয়?",
    excerpt:
      "Families often transfer property by heba to save on fees. It is valid — but only if the three conditions are met, and only between the relatives the law recognises.",
    excerptBn:
      "খরচ বাঁচাতে পরিবারের মধ্যে অনেকেই হেবার মাধ্যমে সম্পত্তি হস্তান্তর করেন। এটি বৈধ — তবে তিনটি শর্ত পূরণ হলে, এবং আইনস্বীকৃত আত্মীয়দের মধ্যেই।",
    readTime: "5 min read",
    imageUrl: null,
    publishedAt: "2026-10-30T11:00:00.000Z",
    updatedAt: "2026-10-30T00:00:00.000Z",
    href: "/guides/heba-gift-deed-vs-sale-deed-bangladesh",
    sourceType: "internal",
    sourceName: "HomeNet Team",
    sourceUrl: null,
    tags: ["Heba", "Gift Deed", "Danpatra", "Saf-Kabala", "Legal"],
    tagsBn: ["হেবা", "দানপত্র", "সাফ-কবলা", "দলিল", "আইন"],
    author: {
      name: "HomeNet Team",
    },
    contentMarkdown: `
# Heba, Danpatra or Saf-Kabala?

> **Disclaimer:** General information, not legal advice. Personal law differs by
> religion, and registration duties change with each Finance Act. Consult a lawyer
> and the Sub-registry before choosing a deed type.

Three different deeds transfer property in Bangladesh, and choosing the wrong one is an expensive mistake to unwind.

---

## Saf-Kabala — the sale deed

The ordinary instrument of sale. Money moves, the deed is registered at the Sub-registry office, and ownership passes to the buyer. This is what any arm's-length purchase uses, and the full schedule of registration duties applies.

If you are buying from someone who is not family, this is the deed.

## Heba — gift under Muslim personal law

A gift without consideration. Commonly used between close relatives, and often attracting lower duties than a sale when made between the relations the law recognises.

For a heba to be valid, **three conditions** must all be satisfied:

1. **Declaration** — the donor clearly offers the gift
2. **Acceptance** — the donee accepts it
3. **Delivery of possession** — possession actually passes to the donee

The third is where families come unstuck. A heba declared on paper while the donor continues to occupy and control the property as before can be challenged. Possession has to genuinely change hands.

A variant, *heba-bil-ewaz*, involves some consideration and is treated differently — closer to an exchange than a pure gift.

## Danpatra — gift deed

The gift instrument used outside Muslim personal law. Also without consideration, also registered, with its own requirements as to acceptance and registration.

---

## Choosing between them

| Situation | Usual instrument |
|---|---|
| Buying from an unrelated seller | Saf-Kabala |
| Parent to child, spouse to spouse (Muslim law) | Heba |
| Gift outside Muslim personal law | Danpatra |
| Transfer with partial payment | Take advice — may be heba-bil-ewaz or a sale |

---

## What still has to happen afterwards

Whichever deed is used, the transfer is not finished at the Sub-registry. You must still:

- Complete **namjari** (mutation) so the record of rights shows the new owner
- Start paying **khajna** in the new owner's name
- Collect the DCR and updated khatian

A property transferred by heba but never mutated creates exactly the same problems as an unmutated purchase. See our [namjari guide](/guides/namzari-mutation-bangladesh-guide).

---

## Questions families ask

**Can a heba be revoked?**
Once the three conditions are complete, revocation is difficult and in several situations not permitted at all. Take advice before relying on the possibility.

**Is heba cheaper than a sale deed?**
Between recognised close relatives it usually attracts lower duties. The exact rates change with each Finance Act — confirm current figures at the Sub-registry.

**Can a flat be given by heba while the donor keeps living in it?**
This is precisely where delivery of possession becomes contested. Discuss the arrangement with a lawyer before executing anything.

**Does a heba need to be registered?**
Registration of immovable property transfers is the safe course, and is what makes the transfer provable later. Do not rely on an unregistered family arrangement.

---

Our [khatian verification guide](/guides/how-to-verify-khatian-cs-sa-rs-bs) explains how to check what the records currently say before any transfer.
`,
    contentMarkdownBn: `
# হেবা, দানপত্র নাকি সাফ-কবলা?

> **দ্রষ্টব্য:** এটি সাধারণ তথ্য, আইনি পরামর্শ নয়। ব্যক্তিগত আইন ধর্মভেদে আলাদা এবং
> রেজিস্ট্রেশন ফি প্রতিটি অর্থ আইনে বদলায়। দলিলের ধরন বেছে নেওয়ার আগে আইনজীবী ও
> সাব-রেজিস্ট্রি অফিসে যাচাই করুন।

বাংলাদেশে সম্পত্তি হস্তান্তরে তিন ধরনের দলিল ব্যবহৃত হয়, আর ভুল দলিল বেছে নিলে তা শোধরানো ব্যয়বহুল।

---

## সাফ-কবলা — বিক্রয় দলিল

সাধারণ বিক্রয়ের দলিল। টাকা লেনদেন হয়, সাব-রেজিস্ট্রি অফিসে দলিল রেজিস্ট্রি হয়, মালিকানা ক্রেতার কাছে যায়। পরিচিত-অপরিচিত যে কারও কাছ থেকে কেনার ক্ষেত্রে এটিই ব্যবহৃত হয় এবং পূর্ণ রেজিস্ট্রেশন ফি প্রযোজ্য।

পরিবারের বাইরের কারও কাছ থেকে কিনলে এই দলিলই।

## হেবা — মুসলিম ব্যক্তিগত আইনে দান

বিনিময়হীন দান। সাধারণত নিকটাত্মীয়দের মধ্যে ব্যবহৃত হয় এবং আইনস্বীকৃত সম্পর্কের ক্ষেত্রে বিক্রয়ের তুলনায় কম ফি প্রযোজ্য হতে পারে।

হেবা বৈধ হতে **তিনটি শর্ত** একসঙ্গে পূরণ হতে হবে:

১. **ঘোষণা** — দাতা স্পষ্টভাবে দান করার ঘোষণা দেবেন
২. **গ্রহণ** — গ্রহীতা তা গ্রহণ করবেন
৩. **দখল হস্তান্তর** — দখল বাস্তবে গ্রহীতার কাছে যাবে

তৃতীয় শর্তেই পরিবারগুলো আটকে যায়। কাগজে হেবা ঘোষণা করে দাতা যদি আগের মতোই দখল ও নিয়ন্ত্রণ রাখেন, তবে তা চ্যালেঞ্জযোগ্য। দখল সত্যিকার অর্থেই হাতবদল হতে হবে।

এর একটি রূপ *হেবা-বিল-এওয়াজ*-এ কিছু বিনিময় থাকে এবং তা ভিন্নভাবে বিবেচিত হয় — বিশুদ্ধ দানের চেয়ে বিনিময়ের কাছাকাছি।

## দানপত্র — দান দলিল

মুসলিম ব্যক্তিগত আইনের বাইরে ব্যবহৃত দানের দলিল। এটিও বিনিময়হীন, এটিও রেজিস্ট্রিযোগ্য, এবং গ্রহণ ও রেজিস্ট্রেশনের নিজস্ব শর্ত আছে।

---

## কোনটি কখন

| পরিস্থিতি | সাধারণত যে দলিল |
|---|---|
| সম্পর্কহীন বিক্রেতার কাছ থেকে ক্রয় | সাফ-কবলা |
| পিতামাতা-সন্তান, স্বামী-স্ত্রী (মুসলিম আইন) | হেবা |
| মুসলিম ব্যক্তিগত আইনের বাইরে দান | দানপত্র |
| আংশিক টাকা লেনদেনসহ হস্তান্তর | পরামর্শ নিন — হেবা-বিল-এওয়াজ বা বিক্রয় হতে পারে |

---

## এরপরও যা করতে হবে

যে দলিলই হোক, সাব-রেজিস্ট্রিতেই কাজ শেষ হয় না। এরপরও লাগবে:

- **নামজারি** সম্পন্ন করা, যাতে রেকর্ডে নতুন মালিকের নাম ওঠে
- নতুন মালিকের নামে **খাজনা** দেওয়া শুরু করা
- ডিসিআর ও হালনাগাদ খতিয়ান সংগ্রহ করা

হেবার মাধ্যমে হস্তান্তরিত অথচ নামজারিবিহীন সম্পত্তিতে ঠিক সেই সমস্যাগুলোই তৈরি হয়, যা নামজারিবিহীন ক্রয়ে হয়। দেখুন আমাদের [নামজারি গাইড](/guides/namzari-mutation-bangladesh-guide)।

---

## যে প্রশ্নগুলো পরিবারগুলো করে

**হেবা কি বাতিল করা যায়?**
তিনটি শর্ত পূর্ণ হয়ে গেলে বাতিল করা কঠিন, আর কয়েকটি ক্ষেত্রে তা একেবারেই অনুমোদিত নয়। এই সম্ভাবনার ওপর ভরসা করার আগে পরামর্শ নিন।

**হেবা কি সাফ-কবলার চেয়ে সাশ্রয়ী?**
স্বীকৃত নিকটাত্মীয়দের মধ্যে সাধারণত কম ফি প্রযোজ্য হয়। সঠিক হার প্রতিটি অর্থ আইনে বদলায় — সাব-রেজিস্ট্রি অফিসে বর্তমান হার যাচাই করুন।

**দাতা নিজে বসবাস করতে থাকলে কি হেবা করা যায়?**
এখানেই দখল হস্তান্তরের শর্ত নিয়ে বিরোধ তৈরি হয়। দলিল করার আগে আইনজীবীর সঙ্গে বিষয়টি আলোচনা করে নিন।

**হেবা কি রেজিস্ট্রি করতে হয়?**
স্থাবর সম্পত্তির হস্তান্তর রেজিস্ট্রি করাই নিরাপদ পথ, আর এটিই পরে হস্তান্তর প্রমাণযোগ্য করে। অরেজিস্ট্রিকৃত পারিবারিক বোঝাপড়ার ওপর ভরসা করবেন না।

---

হস্তান্তরের আগে রেকর্ডে কী আছে দেখতে পড়ুন আমাদের [খতিয়ান যাচাই গাইড](/guides/how-to-verify-khatian-cs-sa-rs-bs)।
`,
  },
];
