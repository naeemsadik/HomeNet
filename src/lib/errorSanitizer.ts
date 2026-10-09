/**
 * Error Sanitization Layer
 *
 * Ensures users never see internal stack traces, system file paths,
 * or raw database errors in the UI, returning safe generic messages instead.
 */

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

export const SAFE_GENERIC_MESSAGES = {
  serverError: "An unexpected error occurred. Please try again later.",
  networkError: "Unable to connect to the server. Please check your internet connection and try again.",
  sessionExpired: "Your session has expired. Please log in again.",
  forbidden: "You do not have permission to perform this action.",
  notFound: "The requested resource could not be found.",
  rateLimited: "Too many requests. Please wait a moment and try again.",
  invalidInput: "Invalid request data. Please check your inputs and try again.",
  emailInUse: "This email address is already in use. Please sign in or use a different email.",
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

/**
 * Sanitizes any raw error message into a safe user-facing message.
 */
export function sanitizeErrorMessage(
  rawMessage: unknown,
  status: number | null = null,
  fallbackMessage?: string,
): string {
  const text = typeof rawMessage === "string" ? rawMessage.trim() : "";

  // 1. Specific HTTP status fallbacks
  if (status !== null) {
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
    if (status === 429) {
      return SAFE_GENERIC_MESSAGES.rateLimited;
    }
  }

  // 2. Check for unique email constraint leak
  if (/users_email_key|duplicate.*email/i.test(text)) {
    return SAFE_GENERIC_MESSAGES.emailInUse;
  }

  // 3. Network connection issues
  if (
    !status &&
    (text.includes("Network Error") ||
      text.includes("Failed to fetch") ||
      INTERNAL_NETWORK_PATTERNS.some((p) => p.test(text)))
  ) {
    return SAFE_GENERIC_MESSAGES.networkError;
  }

  // 4. If text contains sensitive internal leaks, mask with generic message
  if (isUnsafeErrorMessage(text)) {
    reportError(text, { status, reason: "intercepted_unsafe_error_message" });
    return fallbackMessage || SAFE_GENERIC_MESSAGES.serverError;
  }

  // 5. If safe and non-empty, return user message
  if (text.length > 0) {
    return text;
  }

  return fallbackMessage || SAFE_GENERIC_MESSAGES.serverError;
}
