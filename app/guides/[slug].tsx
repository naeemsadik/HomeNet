import { useLocalSearchParams } from "expo-router";
import { CURATED_PROPERTY_GUIDES } from "@/content/curatedGuides";
import { GuideDetailScreen } from "@/features/news/screens/GuideDetailScreen";

/**
 * Each curated guide is exported as its own static page, with its own title,
 * canonical and text in the HTML. The title and description are set by
 * GuideDetailScreen from the guide itself.
 */
export function generateStaticParams() {
  return CURATED_PROPERTY_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export default function GuideDetailRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <GuideDetailScreen slug={String(slug || "")} />;
}
