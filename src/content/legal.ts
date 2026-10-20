/**
 * The words of HomeNet's legal pages, in one file so they can be reviewed as a
 * set, like landingCopy.ts. They describe what the app does today; when the app
 * or the API changes what it collects or keeps, this file changes with it.
 *
 * Google Play needs a public privacy policy page and an account-deletion page,
 * and a way to report user-generated content. The pages are /privacy, /terms and
 * /delete-account, and they are linked from the app, the website footer and the
 * sign-up form.
 */

/** Where people write to us: reports, deletion requests, privacy questions. */
export const SUPPORT_EMAIL = "hello@homenet.com.bd";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  /** One line under the title. */
  summary: string;
  /** Shown as "Last updated". */
  updated: string;
  sections: LegalSection[];
}

const UPDATED = "20 October 2026";

export const PRIVACY_POLICY: LegalDocument = {
  title: "Privacy Policy",
  summary: "What HomeNet collects, why, who can see it, and how to have it deleted.",
  updated: UPDATED,
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        "HomeNet is a property marketplace for Bangladesh. Owners list properties directly, listings are reviewed before they are published, and people looking for a home contact owners directly. This policy covers the HomeNet Android app and the HomeNet website.",
        `Questions about this policy or your data: ${SUPPORT_EMAIL}.`,
      ],
    },
    {
      heading: "What we collect",
      bullets: [
        "Your account: your name, your email address and a password. The password is stored in a protected (hashed) form, never in plain text.",
        "Your profile photo, if you add one.",
        "Your listings: the title, description, price, address, area, the map location you pin, and photos and videos.",
        "The listings you save.",
        "Technical data our servers receive when the app talks to them: your IP address, the time and the request. We use it to keep the service secure and working.",
        "On your phone: your sign-in token, kept in the phone's secure storage, and your language choice.",
      ],
    },
    {
      heading: "What we do not collect",
      bullets: [
        "Your phone's location. The Android app never asks for it. A listing's location is the spot the owner chooses on a map or the Google Maps link they paste.",
        "Your contacts, camera or microphone. The app asks for none of them. Choosing a photo opens your phone's own photo picker, which gives HomeNet only the photos you pick.",
        "An advertising ID. HomeNet shows no ads and has no analytics or advertising tracking in the app.",
      ],
    },
    {
      heading: "How we use it",
      bullets: [
        "To run your account and sign you in.",
        "To publish your listings and show them to people looking for a home, after review.",
        "To let people who find your listing get in touch with you.",
        "To keep HomeNet secure and to look into reports of misuse.",
        "To answer you when you write to us.",
      ],
      paragraphs: ["We do not sell your personal data."],
    },
    {
      heading: "Who can see it",
      bullets: [
        "Everyone who uses HomeNet can see a published listing: its details, photos, location and the name of the person who listed it. Do not put anything in a listing that you do not want others to see.",
        "Our service providers handle data for us and only for the service: the hosting of our servers, and Cloudinary, which stores uploaded photos and videos.",
        "On the website only, map tiles and address lookups come from OpenStreetMap, which therefore sees the visitor's IP address and the map area being viewed.",
        "When you paste a Google Maps short link, our server opens it to read the location. Google therefore receives that link.",
        "We share information when the law requires it.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        "We keep your account and listings until you delete your account. Deleting it removes your account, profile, listings and saved items from HomeNet (see Delete your account).",
        "Photos and videos are stored with our media provider. Deleting your account removes them from HomeNet. To have the files themselves erased from the provider as well, email us and we will remove them.",
        "Server records of requests are kept only as long as needed for security and fixing problems.",
      ],
    },
    {
      heading: "Delete your account",
      paragraphs: [
        "You can delete your account yourself in the app: Profile, then Account security, then Permanently delete account. This cannot be undone.",
        "The steps, and what to do if you cannot sign in, are on the Delete account page: /delete-account.",
      ],
    },
    {
      heading: "Your choices",
      bullets: [
        "Change your name and photo in Profile at any time.",
        "Edit or remove any listing you created.",
        "Delete your account.",
        `Ask us what we hold about you, or to correct it, by writing to ${SUPPORT_EMAIL}.`,
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "The app talks to our servers over an encrypted (HTTPS) connection, and your sign-in token is kept in your phone's secure storage. No system is perfectly secure, so use a password that you use nowhere else.",
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        "HomeNet is for adults looking to rent, buy or list property. It is not directed at children, and we do not knowingly collect their data.",
      ],
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        "If we change what HomeNet collects or how it is used, we will update this page and the date at the top.",
      ],
    },
  ],
};

export const TERMS_OF_USE: LegalDocument = {
  title: "Terms of Use",
  summary: "The rules for using HomeNet, listing a property and contacting owners.",
  updated: UPDATED,
  sections: [
    {
      heading: "Using HomeNet",
      paragraphs: [
        "By creating an account or using HomeNet you agree to these terms and to the Privacy Policy. If you do not agree, do not use HomeNet. You must be old enough to make a binding agreement where you live.",
        "Listing a property on HomeNet is free. HomeNet is not a broker and takes no commission: it connects people looking for a home with owners, who then deal with each other directly.",
      ],
    },
    {
      heading: "Your account",
      bullets: [
        "Give accurate details and keep them up to date.",
        "Keep your password to yourself. You are responsible for what happens in your account.",
        "You may delete your account at any time (Profile, then Account security).",
      ],
    },
    {
      heading: "Listings and anything else you post",
      bullets: [
        "List only a property that you own or are allowed to list.",
        "Everything in a listing must be true and current: the price, size, address, location, photos and whether it is still available.",
        "Upload only photos and videos you have the right to use, and that show the property you are listing.",
        "Do not post personal details of other people.",
        "You keep the rights to what you post. You give HomeNet permission to store it and show it in the app and on the website so that the service can work.",
      ],
    },
    {
      heading: "What is not allowed",
      bullets: [
        "Fake, fraudulent or misleading listings, including a wrong price, location or owner.",
        "Content that is illegal, hateful, threatening, harassing or sexually explicit.",
        "Content that infringes someone else's rights.",
        "Spam, scraping, or trying to break or overload HomeNet.",
        "Using HomeNet to collect other people's details for another purpose.",
      ],
    },
    {
      heading: "Reviews, reports and removal",
      paragraphs: [
        "HomeNet reviews listings before they are published. A review is not a guarantee of anything: always see the property, check its papers and the owner yourself before you pay or sign.",
        `To report a listing, use Report this listing on the listing page, or write to ${SUPPORT_EMAIL}. We may remove a listing or content, or suspend or close an account, that breaks these terms or the law.`,
      ],
    },
    {
      heading: "Deals between users",
      paragraphs: [
        "HomeNet is not a party to any sale, rent or other deal between users, and does not check or guarantee a property, a price or a person. You are responsible for your own decisions. Take care with advance payments.",
      ],
    },
    {
      heading: "Our responsibility",
      paragraphs: [
        "HomeNet is provided as it is. We work to keep it running and accurate but cannot promise it will always be available or free of errors. To the extent the law allows, HomeNet is not liable for losses that come from a deal between users or from content that users post.",
      ],
    },
    {
      heading: "Changes and contact",
      paragraphs: [
        "We may update these terms; the date at the top shows when. Using HomeNet after a change means you accept it.",
        `Questions: ${SUPPORT_EMAIL}.`,
      ],
    },
  ],
};

export const DELETE_ACCOUNT: LegalDocument = {
  title: "Delete your HomeNet account",
  summary: "How to delete your account and what is removed.",
  updated: UPDATED,
  sections: [
    {
      heading: "In the app (or on the website)",
      bullets: [
        "Sign in to HomeNet.",
        "Open Profile.",
        "Under Account security, choose Permanently delete account.",
        "Confirm. Your account is deleted straight away and you are signed out.",
      ],
    },
    {
      heading: "What is deleted",
      bullets: [
        "Your account, your name and email address, and your profile details and photo.",
        "Every listing you created, and the saved listings in your account.",
        "Your sign-in sessions.",
      ],
      paragraphs: ["This cannot be undone."],
    },
    {
      heading: "What may remain",
      bullets: [
        "Photos and videos are stored with our media provider. They are removed from HomeNet when your account is deleted, but the files may stay with the provider until we erase them. Write to us, from the email address on your account, and we will remove them.",
        "Records our servers keep of requests (IP address, time, request) are kept only as long as needed for security and fixing problems.",
      ],
    },
    {
      heading: "If you cannot sign in",
      paragraphs: [
        `Email ${SUPPORT_EMAIL} from the email address on your account, with the subject "Delete my HomeNet account". We will check that the address matches your account, delete the account and reply to confirm.`,
      ],
    },
  ],
};
