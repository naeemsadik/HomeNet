import { useLocalSearchParams } from "expo-router";
import { UserDetailScreen } from "@/screens/UserDetailScreen";

export default function UserDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <UserDetailScreen userId={id} />;
}
