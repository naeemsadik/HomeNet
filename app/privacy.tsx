import { PageMeta } from "@/components/PageMeta";
import { PRIVACY_POLICY } from "@/content/legal";
import { LegalScreen } from "@/screens/LegalScreen";

export default function PrivacyRoute() {
  return (
    <>
      <PageMeta
        title="Privacy Policy — HomeNet"
        description="What HomeNet collects, why, who can see it, and how to have it deleted."
      />
      <LegalScreen document={PRIVACY_POLICY} />
    </>
  );
}
