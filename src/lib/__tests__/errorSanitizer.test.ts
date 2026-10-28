import { translate, useLanguageStore } from "@/i18n";
import {
  ERROR_CODE_MESSAGES,
  isUnsafeErrorMessage,
  sanitizeErrorMessage,
  SAFE_GENERIC_MESSAGES,
} from "@/lib/errorSanitizer";

describe("errorSanitizer", () => {
  describe("isUnsafeErrorMessage", () => {
    it("detects stack traces", () => {
      const trace = "TypeError: Cannot read properties of undefined\n    at Component.render (bundle.js:12:34)";
      expect(isUnsafeErrorMessage(trace)).toBe(true);
    });

    it("detects Windows file paths", () => {
      expect(isUnsafeErrorMessage("Failed to load C:\\inetpub\\wwwroot\\api\\controller.cs")).toBe(true);
      expect(isUnsafeErrorMessage("File not found: D:/projects/HomeNet/server/index.ts")).toBe(true);
    });

    it("detects Unix system paths", () => {
      expect(isUnsafeErrorMessage("Crash at /var/www/backend/node_modules/pg/index.js")).toBe(true);
      expect(isUnsafeErrorMessage("Error in /app/src/db.ts:24")).toBe(true);
      expect(isUnsafeErrorMessage("file:///tmp/debug.log")).toBe(true);
    });

    it("detects database SQL queries and constraint errors", () => {
      expect(isUnsafeErrorMessage("SELECT * FROM users WHERE email = 'test@example.com'")).toBe(true);
      expect(isUnsafeErrorMessage("syntax error at or near 'SELECT'")).toBe(true);
      expect(isUnsafeErrorMessage("relation \"properties\" does not exist")).toBe(true);
      expect(isUnsafeErrorMessage("duplicate key value violates unique constraint \"users_email_key\"")).toBe(true);
      expect(isUnsafeErrorMessage("column \"secret_token\" does not exist")).toBe(true);
      expect(isUnsafeErrorMessage("deadlock detected")).toBe(true);
      expect(isUnsafeErrorMessage("PostgreSQL query failed with error code 42P01")).toBe(true);
    });

    it("detects internal network / system codes", () => {
      expect(isUnsafeErrorMessage("connect ECONNREFUSED 127.0.0.1:5432")).toBe(true);
      expect(isUnsafeErrorMessage("getaddrinfo ENOTFOUND localhost:3000")).toBe(true);
      expect(isUnsafeErrorMessage("Request failed with status code 500")).toBe(true);
    });

    it("allows clean, safe user messages", () => {
      expect(isUnsafeErrorMessage("Password must be at least 8 characters.")).toBe(false);
      expect(isUnsafeErrorMessage("Please enter a valid full name.")).toBe(false);
      expect(isUnsafeErrorMessage("Photo selected. Save changes to keep it.")).toBe(false);
      expect(isUnsafeErrorMessage("Failed to update profile")).toBe(false);
      expect(isUnsafeErrorMessage("Failed to upload avatar")).toBe(false);
      expect(isUnsafeErrorMessage("Property not found.")).toBe(false);
    });
  });

  describe("sanitizeErrorMessage", () => {
    it("returns serverError generic message for 500+ status codes", () => {
      const result = sanitizeErrorMessage("Internal server error: DB disconnected", 500);
      expect(result).toBe(SAFE_GENERIC_MESSAGES.serverError);
    });

    it("returns sessionExpired message for 401 status", () => {
      const result = sanitizeErrorMessage("jwt expired", 401);
      expect(result).toBe(SAFE_GENERIC_MESSAGES.sessionExpired);
    });

    it("returns forbidden message for 403 status", () => {
      const result = sanitizeErrorMessage("Forbidden", 403);
      expect(result).toBe(SAFE_GENERIC_MESSAGES.forbidden);
    });

    it("returns notFound message for 404 status", () => {
      const result = sanitizeErrorMessage("Resource missing", 404);
      expect(result).toBe(SAFE_GENERIC_MESSAGES.notFound);
    });

    it("gives every known backend code its own plain sentence, whatever the status", () => {
      expect(sanitizeErrorMessage("You do not have permission to modify this user", 403, undefined, 1203)).toBe(
        "You can't make changes to this account.",
      );
      expect(sanitizeErrorMessage("User not found", 404, undefined, 1200)).toBe("We couldn't find that account.");
      expect(sanitizeErrorMessage("Invalid email or password", 401, undefined, 1100)).toBe(
        "The email or password is incorrect.",
      );
    });

    it("never shows field names from a coded message", () => {
      expect(sanitizeErrorMessage("area_id is required for property creation", 400, undefined, 1502)).toBe(
        "Please choose the area your property is in.",
      );
    });

    it("keeps the generic text for the guard's plain 403", () => {
      expect(sanitizeErrorMessage("Forbidden resource", 403, undefined, 1003)).toBe(SAFE_GENERIC_MESSAGES.forbidden);
      expect(sanitizeErrorMessage("Forbidden resource", 403)).toBe(SAFE_GENERIC_MESSAGES.forbidden);
    });

    it("hides a coded message that leaks internals", () => {
      const leak = "relation \"users\" does not exist";
      expect(sanitizeErrorMessage(leak, 404, undefined, 1200)).toBe("We couldn't find that account.");
    });

    it("turns validator output into a plain sentence", () => {
      for (const raw of [
        "property media should not exist",
        "area_id must be a UUID",
        "listing_type must be one of the following values: sale, rent",
        "media.0.url must be a string",
        "Bad Request",
      ]) {
        expect(sanitizeErrorMessage(raw, 400)).toBe(SAFE_GENERIC_MESSAGES.invalidInput);
      }
    });

    it("turns developer wording with no status into a plain sentence", () => {
      expect(sanitizeErrorMessage("Cannot read properties of undefined (reading 'id')")).toBe(SAFE_GENERIC_MESSAGES.generic);
      expect(sanitizeErrorMessage("popup_closed_by_user")).toBe(SAFE_GENERIC_MESSAGES.generic);
      expect(sanitizeErrorMessage("timeout of 15000ms exceeded")).toBe(SAFE_GENERIC_MESSAGES.timeout);
    });

    it("says the service is busy for a gateway error", () => {
      expect(sanitizeErrorMessage("Bad Gateway", 502)).toBe(SAFE_GENERIC_MESSAGES.unavailable);
    });

    it("answers in Bangla when the reader picked Bangla", () => {
      useLanguageStore.setState({ language: "bn" });
      try {
        expect(sanitizeErrorMessage("Invalid email or password", 401, undefined, 1100)).toBe("ইমেইল বা পাসওয়ার্ড সঠিক নয়।");
        expect(sanitizeErrorMessage("Forbidden resource", 403)).toBe("এটি করার অনুমতি আপনার নেই।");
      } finally {
        useLanguageStore.setState({ language: "en" });
      }
    });

    it("has a sentence in both languages for every backend code", () => {
      for (const key of Object.values(ERROR_CODE_MESSAGES)) {
        expect(translate("en", key)).not.toBe(key);
        expect(translate("bn", key)).not.toBe(translate("en", key));
      }
    });

    it("returns rateLimited message for 429 status", () => {
      const result = sanitizeErrorMessage("Too many requests", 429);
      expect(result).toBe(SAFE_GENERIC_MESSAGES.rateLimited);
    });

    it("translates unique email constraint to friendly message", () => {
      const raw = "duplicate key value violates unique constraint \"users_email_key\"";
      expect(sanitizeErrorMessage(raw, 400)).toBe(SAFE_GENERIC_MESSAGES.emailInUse);
    });

    it("translates raw database syntax errors to generic error", () => {
      const raw = "syntax error at or near 'WHERE': SELECT * FROM users";
      expect(sanitizeErrorMessage(raw)).toBe(SAFE_GENERIC_MESSAGES.generic);
    });

    it("translates internal connection errors to friendly network error", () => {
      expect(sanitizeErrorMessage("connect ECONNREFUSED 127.0.0.1:8000")).toBe(
        SAFE_GENERIC_MESSAGES.networkError,
      );
    });

    it("preserves safe validation errors", () => {
      const safe = "Title must be between 5 and 150 characters";
      expect(sanitizeErrorMessage(safe, 400)).toBe(safe);
    });
  });
});
