/**
 * Error Sanitization Layer
 *
 * Ensures users never see internal stack traces, system file paths, raw
 * database errors or validator text in the UI. They see a short, friendly
 * sentence in their own language instead.
 */

import { translate, useLanguageStore, type TranslationKey } from "@/i18n";
import { reportError } from "./errorLogger";

const STACK_TRACE_PATTERNS = [
  /\n\s*at\s+.+/i,
  /(?:^|\s)(?:TypeError|ReferenceError|SyntaxError|RangeError|URIError|EvalError|InternalError):/i,
  /(?:\.js|\.ts|\.tsx|\.jsx|\.py):\d+:\d+/i,
  /\bTraceback \(most recent call last\):/i,
];

const FILE_PATH_PATTERNS = [
  /[a-zA-Z]:\\[\w\s.-]+\\/i, // Windows absolute path: C:\...
  /[a-zA-Z]:\/[\w\s.-]+\//i, // Windows forward slash: C:/...
  /(?:^|[\s"'(])\/(?:var|usr|etc|opt|tmp|home|app|node_modules|src|dist|build)\/[\w.-]+(?:\.[\w]+|\/[\w.-]+)/i, // Unix paths
  /file:\/\/\S+/i,
  /webpack:\/\/\S+/i,
  /metro:\/\/\S+/i,
];

const DATABASE_PATTERNS = [
  /\bselect\s+[\w*,\s()]+\s+from\s+[\w.]+/i,
  /\binsert\s+into\s+[\w.]+/i,
  /\bupdate\s+[\w.]+\s+set\b/i,
  /\bdelete\s+from\s+[\w.]+/i,
  /\b(?:drop|alter)\s+table\b/i,
  /\btruncate\s+(?:table\s+)?[\w.]+/i,
  /\b(?:syntax error at or near|relation\s+"[^"]+"\s+does not exist|column\s+"[^"]+"\s+does not exist)\b/i,
  /\b(?:table\s+"[^"]+"\s+doesn't exist|unknown column\s+'[^']+')\b/i,
  /\b(?:violates\s+(?:unique|foreign\s+key|not-null|check)\s+constraint)\b/i,
  /\bduplicate key value violates unique constraint\b/i,
  /\bdeadlock detected\b/i,
  /\b(?:postgresql|postgres|prisma|typeorm|knex|sequelize|mongoose|mongodb|sqlite|mysql)\s*(?:error|query|client|exception)?\b/i,
  /\b(?:pg_catalog|information_schema)\b/i,
  /\b(?:sqlstate|sql error|database error|db error)\b/i,
  /\b(?:ORA-\d{5}|PG::Error|ActiveRecord::)\b/i,
];

const INTERNAL_NETWORK_PATTERNS = [
  /\b(?:ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ECONNRESET|EHOSTUNREACH|EAI_AGAIN)\b/i,
  /\brequest failed with status code 5\d\d\b/i,
  /\b127\.0\.0\.1:\d+\b/,
  /\blocalhost:\d+\b/,
];

/** Shapes that only a developer would understand: field names, validator text, HTTP jargon. */
const TECHNICAL_PATTERNS = [
  /\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/, // snake_case names: area_id, popup_closed_by_user
  /\b\w+\.\d+\.\w+/, // array paths: media.0.url
  /\bshould not (?:exist|be empty)\b/i,
  /\bmust be (?:a |an )?(?:uuid|string|number|integer|boolean|object|array|date|valid \w+|iso ?8601)\b/i,
  /\bmust be one of the following values\b/i,
  /\beach value in\b/i,
  /\bnested property\b/i,
  /\bCannot (?:GET|POST|PUT|PATCH|DELETE)\b/,
  /\b(?:Bad Request|Internal Server Error|Forbidden resource|Unauthorized|Not Found|Request failed)\b/,
  /\bstatus code \d{3}\b/i,
  /\b(?:Unexpected token|not valid JSON|AxiosError|ERR_[A-Z_]+)\b/,
  /\b(?:undefined|null|NaN)\b/,
  /\[object \w+\]/,
  /^\w*(?:Error|Exception):/,
  /^[[{]/,
];

const TIMEOUT_PATTERN = /\btimeout of \d+ms exceeded\b|\btimed? ?out\b/i;

function say(key: TranslationKey): string {
  return translate(useLanguageStore.getState().language, key);
}

/** Read at the moment of use, so the text follows the language the reader picked. */
export const SAFE_GENERIC_MESSAGES = {
  get generic() {
    return say("errors.generic");
  },
  get serverError() {
    return say("errors.serverError");
  },
  get unavailable() {
    return say("errors.unavailable");
  },
  get networkError() {
    return say("errors.networkError");
  },
  get timeout() {
    return say("errors.timeout");
  },
  get sessionExpired() {
    return say("errors.sessionExpired");
  },
  get forbidden() {
    return say("errors.forbidden");
  },
  get notFound() {
    return say("errors.notFound");
  },
  get rateLimited() {
    return say("errors.rateLimited");
  },
  get invalidInput() {
    return say("errors.invalidInput");
  },
  get emailInUse() {
    return say("errors.emailInUse");
  },
};

/**
 * Every error code the backend sends, with the sentence people see for it. The
 * backend's own message is English and sometimes names fields (`area_id`), so it
 * is never shown for a known code. Codes come from apps/api/src/common/errors.
 */
export const ERROR_CODE_MESSAGES: Readonly<Record<number, TranslationKey>> = {
  // System
  1000: "errors.serverError",
  1001: "errors.invalidInput",
  1002: "errors.notFound",
  1003: "errors.forbidden",
  1004: "errors.unavailable",
  // Auth
  1100: "errors.invalidCredentials",
  1101: "errors.emailInUse",
  1102: "errors.weakPassword",
  1103: "errors.sessionExpired",
  1104: "errors.sessionExpired",
  1105: "errors.sessionExpired",
  1106: "errors.sessionExpired",
  1107: "errors.sessionExpired",
  1108: "errors.currentPasswordWrong",
  1109: "errors.samePassword",
  1110: "errors.googleFailed",
  1111: "errors.googleNoEmail",
  1112: "errors.googleEmailInUse",
  1113: "errors.googleUnavailable",
  1114: "errors.noPassword",
  // Users
  1200: "errors.accountNotFound",
  1201: "errors.profileSaveFailed",
  1202: "errors.accountDeleteFailed",
  1203: "errors.accountForbidden",
  1210: "errors.photoType",
  1211: "errors.fileTooLarge",
  1212: "errors.uploadFailed",
  // Roles
  1300: "errors.roleNotFound",
  1301: "errors.roleAssigned",
  1302: "errors.permissionNotFound",
  1303: "errors.permissionAssigned",
  1304: "errors.forbidden",
  // Areas
  1400: "errors.areaNotFound",
  1401: "errors.areaExists",
  1402: "errors.areaHasListings",
  1403: "errors.areaCentre",
  1404: "errors.areaHasChildren",
  1405: "errors.areaParent",
  1410: "errors.divisionNotFound",
  1420: "errors.districtNotFound",
  // Listings and media
  1500: "errors.listingNotFound",
  1501: "errors.listingForbidden",
  1502: "errors.areaRequired",
  1503: "errors.amenitiesInvalid",
  1510: "errors.mediaNotFound",
  1511: "errors.mediaType",
  1512: "errors.fileTooLarge",
  1513: "errors.mediaLimit",
  1514: "errors.uploadFailed",
  1520: "errors.statusChange",
  1521: "errors.cannotSubmit",
  1522: "errors.cannotArchive",
  // Maps
  1700: "errors.mapsLinkUnsupported",
  1701: "errors.mapsLinkNoSpot",
  1702: "errors.mapsSlow",
  1710: "errors.lookupUnavailable",
  1711: "errors.lookupBusy",
  // Database
  5000: "errors.notFound",
  5001: "errors.alreadyExists",
  5002: "errors.notFound",
};

/**
 * Checks if a string contains internal technical leaks (stack traces, paths, or DB errors).
 */
export function isUnsafeErrorMessage(message: unknown): boolean {
  if (typeof message !== "string") return true;
  const trimmed = message.trim();
  if (!trimmed) return false;

  for (const pattern of STACK_TRACE_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  for (const pattern of FILE_PATH_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  for (const pattern of DATABASE_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  for (const pattern of INTERNAL_NETWORK_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }

  return false;
}

/** True for text written for developers rather than for the people using the app. */
export function isTechnicalMessage(message: string): boolean {
  return TECHNICAL_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Turns any error into a short sentence a person can act on, in the language
 * they picked. Raw server, validator and network text never reaches the screen.
 */
export function sanitizeErrorMessage(
  rawMessage: unknown,
  status: number | null = null,
  fallbackMessage?: string,
  errorCode: number | null = null,
): string {
  const text = typeof rawMessage === "string" ? rawMessage.trim() : "";

  // 1. A known backend code has its own wording.
  const codeKey = errorCode !== null ? ERROR_CODE_MESSAGES[errorCode] : undefined;
  if (codeKey) return say(codeKey);

  // 2. Specific HTTP status fallbacks
  if (status !== null) {
    if (status === 502 || status === 503 || status === 504) {
      return SAFE_GENERIC_MESSAGES.unavailable;
    }
    if (status >= 500) {
      return SAFE_GENERIC_MESSAGES.serverError;
    }
    if (status === 401) {
      return SAFE_GENERIC_MESSAGES.sessionExpired;
    }
    if (status === 403) {
      return SAFE_GENERIC_MESSAGES.forbidden;
    }
    if (status === 404) {
      return SAFE_GENERIC_MESSAGES.notFound;
    }
    if (status === 408) {
      return SAFE_GENERIC_MESSAGES.timeout;
    }
    if (status === 429) {
      return SAFE_GENERIC_MESSAGES.rateLimited;
    }
  }

  // 3. Check for unique email constraint leak
  if (/users_email_key|duplicate.*email/i.test(text)) {
    return SAFE_GENERIC_MESSAGES.emailInUse;
  }

  // 4. Network connection issues
  if (!status) {
    if (TIMEOUT_PATTERN.test(text)) {
      return SAFE_GENERIC_MESSAGES.timeout;
    }
    if (
      text.includes("Network Error") ||
      text.includes("Failed to fetch") ||
      INTERNAL_NETWORK_PATTERNS.some((p) => p.test(text))
    ) {
      return SAFE_GENERIC_MESSAGES.networkError;
    }
  }

  // 5. If text contains sensitive internal leaks, mask with generic message
  if (isUnsafeErrorMessage(text)) {
    reportError(text, { status, reason: "intercepted_unsafe_error_message" });
    return fallbackMessage || SAFE_GENERIC_MESSAGES.generic;
  }

  // 6. Developer wording (validator output, field names) gets a plain sentence.
  if (isTechnicalMessage(text)) {
    if (fallbackMessage) return fallbackMessage;
    return status !== null && status >= 400 ? SAFE_GENERIC_MESSAGES.invalidInput : SAFE_GENERIC_MESSAGES.generic;
  }

  // 7. If safe and non-empty, return user message
  if (text.length > 0) {
    return text;
  }

  return fallbackMessage || SAFE_GENERIC_MESSAGES.generic;
}
