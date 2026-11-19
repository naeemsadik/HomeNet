import { PageMeta } from "@/components/PageMeta";
import { ContactScreen } from "@/screens/ContactScreen";
import { useTranslation } from "@/i18n";

export default function ContactRoute() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t("contact.metaTitle")}
        description={t("contact.metaDescription")}
      />
      <ContactScreen />
    </>
  );
}
