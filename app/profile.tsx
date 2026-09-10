import { ProfileScreen } from "@/screens/ProfileScreen";
import { SellerProfileScreen } from "@/features/seller/screens/SellerProfileScreen";
import { useAuthStore } from "@/stores/authStore";
import { useLocalSearchParams } from "expo-router";

export default function ProfileRoute() {
  const { userRoles } = useAuthStore();
  const params = useLocalSearchParams<{ role?: string; from?: string }>();

  const isSeller =
    params.role === "seller" ||
    params.from === "seller" ||
    userRoles.some((ur) => ur.role?.name === "seller");

  if (isSeller) {
    return <SellerProfileScreen />;
  }

  return <ProfileScreen />;
}
