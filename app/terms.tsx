import { PageMeta } from "@/components/PageMeta";
import { TERMS_OF_USE } from "@/content/legal";
import { LegalScreen } from "@/screens/LegalScreen";

export default function TermsRoute() {
  return (
    <>
      <PageMeta
        title="Terms of Use | HomeNet BD"
        description="The rules for using HomeNet BD: your account, what you may list or post, what is not allowed, how reports and removals work, and deals between users."
      />
      <LegalScreen document={TERMS_OF_USE} />
    </>
  );
}
