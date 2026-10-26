import { useLocalSearchParams } from "expo-router";
import { PropertyDetailScreen } from "@/features/property/screens/PropertyDetailScreen";
import { listingStaticParams } from "@/lib/listingStaticParams";

/** Each live listing is exported as its own static page; see listingStaticParams. */
export async function generateStaticParams() {
  return listingStaticParams();
}

export default function PropertyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PropertyDetailScreen key={id} />;
}
