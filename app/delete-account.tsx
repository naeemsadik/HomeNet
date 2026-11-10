import { PageMeta } from "@/components/PageMeta";
import { DELETE_ACCOUNT } from "@/content/legal";
import { LegalScreen } from "@/screens/LegalScreen";

export default function DeleteAccountRoute() {
  return (
    <>
      <PageMeta
        title="Delete your account | HomeNet BD"
        description="How to delete your HomeNet BD account in the app or on the website, what is deleted, what may remain, and what to do if you cannot sign in."
      />
      <LegalScreen document={DELETE_ACCOUNT} />
    </>
  );
}
