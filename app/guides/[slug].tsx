import { useLocalSearchParams } from "expo-router";
import { PageMeta } from "@/components/PageMeta";
import { GuideDetailScreen } from "@/features/news/screens/GuideDetailScreen";

export default function GuideDetailRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  return (
    <>
      <PageMeta
        title="Property Guide & Market Report | HomeNet Bangladesh"
        description="Detailed property advice, land verification procedures, and Dhaka market updates."
      />
      <GuideDetailScreen slug={String(slug || "")} />
    </>
  );
}
