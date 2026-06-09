import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/hooks/useTheme";

export default function HomeScreen() {
  const { user } = useAuthStore();
  const t = useTheme();
  const name = user?.user_metadata?.full_name ?? "Bạn";
  const initial = name[0]?.toUpperCase() ?? "?";

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: t.textMuted }]}>Xin chào,</Text>
            <Text style={[styles.name, { color: t.text }]}>{name} 👋</Text>
          </View>
          <Link href="/(app)/profile/" asChild>
            <TouchableOpacity style={StyleSheet.flatten([styles.avatar, { backgroundColor: t.primary }])}>
              <Text style={styles.avatarText}>{initial}</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.center}>
          <Text style={styles.emoji}>🚀</Text>
          <Text style={[styles.placeholder, { color: t.textSecondary }]}>App đang được phát triển</Text>
          <Text style={[styles.placeholderSub, { color: t.textMuted }]}>
            Đăng nhập thành công! Các tính năng sẽ sớm ra mắt.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingVertical: 24 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 32 },
  greeting: { fontSize: 13 },
  name: { fontSize: 20, fontWeight: "700" },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emoji: { fontSize: 48 },
  placeholder: { fontSize: 17, fontWeight: "600" },
  placeholderSub: { fontSize: 14, textAlign: "center" },
});
