import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  online: boolean;
  name?: string | null;
}

export function PartnerStatus({ online, name }: Props) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.dot,
          { backgroundColor: online ? "#22c55e" : t.textFaint },
        ]}
      />
      <Text style={[styles.label, { color: online ? "#22c55e" : t.textMuted }]}>
        {name ? `${name} · ` : ""}
        {online ? "online" : "offline"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
