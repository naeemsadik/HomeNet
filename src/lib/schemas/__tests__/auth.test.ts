import {
  authModalSchema,
  changePasswordDtoSchema,
  changePasswordSchema,
  emailBase,
  loginSchema,
  nameBase,
  passwordBase,
  registerDtoSchema,
  registerSchema,
  signUpModalSchema,
} from "../auth";

describe("Strict auth schemas", () => {
  describe("passwordBase", () => {
    it("accepts valid passwords with letters and numbers", () => {
      expect(passwordBase.safeParse("Secret123").success).toBe(true);
      expect(passwordBase.safeParse("Passw0rd!#$").success).toBe(true);
    });

    it("rejects passwords shorter than 8 characters", () => {
      const res = passwordBase.safeParse("Ab1");
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toMatch(/at least 8 characters/i);
      }
    });

    it("rejects passwords longer than 128 characters", () => {
      const res = passwordBase.safeParse("A1" + "a".repeat(128));
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toMatch(/cannot exceed 128 characters/i);
      }
    });

    it("rejects passwords containing spaces", () => {
      const res = passwordBase.safeParse("Secret 123");
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toMatch(/cannot contain spaces/i);
      }
    });

    it("rejects passwords without numbers", () => {
      const res = passwordBase.safeParse("SecretPass");
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toMatch(/at least one letter and one number/i);
      }
    });

    it("rejects passwords without letters", () => {
      const res = passwordBase.safeParse("123456789");
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toMatch(/at least one letter and one number/i);
      }
    });
  });

  describe("emailBase", () => {
    it("accepts standard valid emails", () => {
      expect(emailBase.safeParse("user@example.com").success).toBe(true);
      expect(emailBase.safeParse("john.doe+test@sub.domain.org").success).toBe(true);
    });

    it("rejects empty emails", () => {
      expect(emailBase.safeParse("").success).toBe(false);
    });

    it("rejects invalid email formats", () => {
      expect(emailBase.safeParse("plainaddress").success).toBe(false);
      expect(emailBase.safeParse("@missingusername.com").success).toBe(false);
      expect(emailBase.safeParse("username@.com").success).toBe(false);
    });

    it("rejects emails longer than 254 characters", () => {
      const longEmail = "a".repeat(250) + "@test.com";
      expect(emailBase.safeParse(longEmail).success).toBe(false);
    });
  });

  describe("nameBase", () => {
    it("accepts Latin and Unicode names", () => {
      expect(nameBase.safeParse("Jane Doe").success).toBe(true);
      expect(nameBase.safeParse("মোহাম্মদ রহিম").success).toBe(true);
      expect(nameBase.safeParse("O'Connor-Smith").success).toBe(true);
      expect(nameBase.safeParse("Dr. J. Watson").success).toBe(true);
    });

    it("rejects names shorter than 2 characters", () => {
      expect(nameBase.safeParse("A").success).toBe(false);
      expect(nameBase.safeParse("").success).toBe(false);
    });

    it("rejects whitespace-only names", () => {
      expect(nameBase.safeParse("   ").success).toBe(false);
    });

    it("rejects names longer than 100 characters", () => {
      expect(nameBase.safeParse("a".repeat(101)).success).toBe(false);
    });

    it("rejects names containing script tags or invalid characters", () => {
      expect(nameBase.safeParse("<script>alert(1)</script>").success).toBe(false);
      expect(nameBase.safeParse("John {Doe}").success).toBe(false);
      expect(nameBase.safeParse("John; DROP TABLE users;").success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("accepts valid credentials", () => {
      const res = loginSchema.safeParse({
        email: "user@example.com",
        password: "Secret123Password",
      });
      expect(res.success).toBe(true);
    });

    it("rejects unexpected extra properties (.strict)", () => {
      const res = loginSchema.safeParse({
        email: "user@example.com",
        password: "Secret123Password",
        admin: true,
      });
      expect(res.success).toBe(false);
    });
  });

  describe("registerSchema and registerDtoSchema", () => {
    it("accepts valid registration payload", () => {
      const res = registerSchema.safeParse({
        full_name: "Jane Doe",
        email: "jane@example.com",
        password: "Secret123Password",
        confirmPassword: "Secret123Password",
      });
      expect(res.success).toBe(true);
    });

    it("rejects when confirmPassword does not match", () => {
      const res = registerSchema.safeParse({
        full_name: "Jane Doe",
        email: "jane@example.com",
        password: "Secret123Password",
        confirmPassword: "DifferentPassword456",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toMatch(/passwords do not match/i);
      }
    });

    it("rejects unknown properties in registerDtoSchema", () => {
      const res = registerDtoSchema.safeParse({
        full_name: "Jane Doe",
        email: "jane@example.com",
        password: "Secret123Password",
        role: "admin",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("changePasswordSchema and changePasswordDtoSchema", () => {
    it("accepts valid password change data", () => {
      const res = changePasswordSchema.safeParse({
        current_password: "OldPassword123",
        new_password: "NewPassword456",
        confirmPassword: "NewPassword456",
      });
      expect(res.success).toBe(true);
    });

    it("rejects when new passwords do not match", () => {
      const res = changePasswordSchema.safeParse({
        current_password: "OldPassword123",
        new_password: "NewPassword456",
        confirmPassword: "MismatchPassword789",
      });
      expect(res.success).toBe(false);
    });

    it("rejects extra properties in changePasswordDtoSchema", () => {
      const res = changePasswordDtoSchema.safeParse({
        current_password: "OldPassword123",
        new_password: "NewPassword456",
        extraField: "hack",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("signUpModalSchema and authModalSchema", () => {
    it("validates modal signup strictly", () => {
      expect(
        signUpModalSchema.safeParse({
          full_name: "John Doe",
          email: "john@example.com",
          password: "Password123",
        }).success,
      ).toBe(true);
    });

    it("rejects extra keys in authModalSchema in signin and signup modes", () => {
      expect(
        authModalSchema("signin").safeParse({
          email: "john@example.com",
          password: "Password123",
          injected: "evil",
        }).success,
      ).toBe(false);

      expect(
        authModalSchema("signup").safeParse({
          full_name: "John Doe",
          email: "john@example.com",
          password: "Password123",
          injected: "evil",
        }).success,
      ).toBe(false);
    });
  });
});
