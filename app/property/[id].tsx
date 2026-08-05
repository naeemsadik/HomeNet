import { useLocalSearchParams } from "expo-router";
import { PropertyDetailScreen } from "@/features/property/screens/PropertyDetailScreen";

export default function PropertyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PropertyDetailScreen key={id} />;
}
