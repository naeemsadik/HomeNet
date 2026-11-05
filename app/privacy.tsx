import { PageMeta } from "@/components/PageMeta";
import { PRIVACY_POLICY } from "@/content/legal";
import { LegalScreen } from "@/screens/LegalScreen";

export default function PrivacyRoute() {
  return (
    <>
      <PageMeta
        title="Privacy Policy | HomeNet BD"
        description="What HomeNet BD collects when you search, list or contact an owner, what it never collects, who can see it, how long it is kept, and how to delete your account."
      />
      <LegalScreen document={PRIVACY_POLICY} />
    </>
  );
}
