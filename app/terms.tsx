import { PageMeta } from "@/components/PageMeta";
import { TERMS_OF_USE } from "@/content/legal";
import { LegalScreen } from "@/screens/LegalScreen";

export default function TermsRoute() {
  return (
    <>
      <PageMeta
        title="Terms of Use | HomeNet BD"
        description="The rules for using HomeNet, listing a property and contacting owners."
      />
      <LegalScreen document={TERMS_OF_USE} />
    </>
  );
}
