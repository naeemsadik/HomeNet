import { useLocalSearchParams } from "expo-router";
import { PropertyDetailsScreen } from "@/screens/PropertyDetailsScreen";
import { allProperties } from "@/data/properties";

export function generateStaticParams() {
  return allProperties.map((property) => ({ id: String(property.id) }));
}

export default function PropertyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PropertyDetailsScreen propertyId={Number(id)} />;
}
