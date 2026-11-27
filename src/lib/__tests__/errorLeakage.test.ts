import { isUnsafeErrorMessage, sanitizeErrorMessage } from "@/lib/errorSanitizer";

/**
 * Adversarial cover for the one promise the error path makes: whatever the
 * backend, a proxy or a driver says, the screen never shows a stack trace, a
 * path from the server's disk, or raw database text.
 *
 * `errorSanitizer.test.ts` checks the rules. This checks the outcome, with
 * the shapes these actually arrive in, because a rule can be right and still
 * miss the string a real Postgres or nginx error turns up as.
 */

const LEAKS: { label: string; message: string }[] = [
  {
    label: "node stack trace",
    message:
      "TypeError: Cannot read properties of undefined (reading 'id')\n    at PropertyService.findOne (/srv/app/dist/property/property.service.js:142:31)",
  },
  {
    label: "bare at-frame",
    message: "Error: boom\n    at Object.<anonymous> (/app/index.js:1:1)",
  },
  { label: "posix path", message: "ENOENT: no such file or directory, open '/var/www/app/.env'" },
  { label: "windows path", message: "Cannot find module 'C:\\\\app\\\\dist\\\\server.js'" },
  {
    label: "postgres constraint",
    message:
      'duplicate key value violates unique constraint "users_email_key"\nDETAIL: Key (email)=(a@b.com) already exists.',
  },
  {
    label: "postgres relation",
    message: 'error: relation "public.properties" does not exist at character 15',
  },
  { label: "prisma", message: "PrismaClientKnownRequestError: Invalid `prisma.user.findUnique()` invocation" },
  { label: "sql text", message: "SELECT * FROM users WHERE email = $1 -- syntax error at or near" },
  { label: "mongo", message: "MongoServerError: E11000 duplicate key error collection: app.users" },
  { label: "internal host", message: "connect ECONNREFUSED 10.0.0.12:5432" },
  { label: "sequelize", message: "SequelizeDatabaseError: column \"foo\" does not exist" },
];

describe("no internal detail reaches the screen", () => {
  it.each(LEAKS)("masks a $label", ({ message }) => {
    const shown = sanitizeErrorMessage(message, 500);
    expect(shown).not.toBe(message);
    // None of the tells survive into what is rendered.
    expect(shown).not.toMatch(/\s+at\s+\S+\(/); // stack frame
    expect(shown).not.toMatch(/[A-Za-z]:\\|\/(srv|var|app|home|usr)\//); // disk path
    expect(shown).not.toMatch(/\b(SELECT|INSERT|UPDATE|DELETE)\b\s/i); // sql
    expect(shown).not.toMatch(/_key\b|relation "|E11000|Prisma|Sequelize/i); // driver text
    expect(shown).not.toMatch(/\b\d{1,3}(\.\d{1,3}){3}:\d+/); // host:port
    expect(shown.length).toBeLessThan(200);
  });

  it("recognises each leak as unsafe in the first place", () => {
    for (const { label, message } of LEAKS) {
      expect<[string, boolean]>([label, isUnsafeErrorMessage(message)]).toEqual([label, true]);
    }
  });

  it("still lets a genuine, readable message through", () => {
    // Over-masking is its own failure: the person is left with nothing to act on.
    expect(sanitizeErrorMessage("This phone number is already registered.", 400)).toBe(
      "This phone number is already registered.",
    );
  });

  it("treats a non-string as unsafe rather than rendering it", () => {
    expect(isUnsafeErrorMessage({ stack: "secret" })).toBe(true);
    expect(isUnsafeErrorMessage(undefined)).toBe(true);
  });
});
