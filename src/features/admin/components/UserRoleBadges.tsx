import { StyleSheet, View } from "react-native";
import { RoleBadge } from "./StatusBadge";

interface UserRoleBadgesProps {
  roles: { role: { id: string; name: string } }[];
}

export function UserRoleBadges({ roles }: UserRoleBadgesProps) {
  if (!roles || roles.length === 0) return null;

  return (
    <View style={styles.container}>
      {roles.map((ur) => (
        <RoleBadge key={ur.role.id} role={ur.role.name} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
});
