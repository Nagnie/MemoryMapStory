import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  count: number;
  syncing?: boolean;
}

export function OfflineBadge({ count, syncing }: Props) {
  const t = useTheme();

  if (count === 0 && !syncing) return null;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: t.surface, borderColor: t.border },
      ]}
    >
      <Ionicons
        name={syncing ? "cloud-upload-outline" : "cloud-offline-outline"}
        size={13}
        color={syncing ? t.primary : t.textSecondary}
      />
      <Text style={[styles.text, { color: syncing ? t.primary : t.textSecondary }]}>
        {syncing ? "Syncing…" : `${count} pending`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
