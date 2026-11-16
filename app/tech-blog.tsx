import { PageMeta } from "@/components/PageMeta";
import { TechBlogScreen } from "@/screens/TechBlogScreen";
import { useTranslation } from "@/i18n";

export default function TechBlogRoute() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t("techBlog.metaTitle")}
        description={t("techBlog.metaDescription")}
      />
      <TechBlogScreen />
    </>
  );
}
