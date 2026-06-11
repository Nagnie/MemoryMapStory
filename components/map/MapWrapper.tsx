import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  children: React.ReactNode;
  permissionGranted: boolean | null;
}

export function MapWrapper({ children, permissionGranted }: Props) {
  const t = useTheme();

  if (permissionGranted === false) {
    return (
      <View style={[styles.denied, { backgroundColor: t.background }]}>
        <Ionicons name="location-outline" size={52} color={t.textMuted} />
        <Text style={[styles.title, { color: t.text }]}>Location access needed</Text>
        <Text style={[styles.sub, { color: t.textMuted }]}>
          MemoryMap needs your location to show memories in the right place.
        </Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: t.primary }]}
          onPress={() => Linking.openSettings()}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  denied: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: "700", textAlign: "center", marginTop: 8 },
  sub: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  btn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 16,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
