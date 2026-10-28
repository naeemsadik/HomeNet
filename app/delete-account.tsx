import { PageMeta } from "@/components/PageMeta";
import { DELETE_ACCOUNT } from "@/content/legal";
import { LegalScreen } from "@/screens/LegalScreen";

export default function DeleteAccountRoute() {
  return (
    <>
      <PageMeta
        title="Delete your account | HomeNet BD"
        description="How to delete your HomeNet account and what is removed."
      />
      <LegalScreen document={DELETE_ACCOUNT} />
    </>
  );
}
