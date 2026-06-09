import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/hooks/useTheme";
import { Theme } from "@/lib/theme";
import { Button } from "@/components/ui/Button";

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const t = useTheme();
  const avatarUrl = user?.user_metadata?.avatar_url;
  const fullName = user?.user_metadata?.full_name ?? "Chưa có tên";
  const initial = fullName[0]?.toUpperCase() ?? "?";

  async function handleLogout() {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đăng xuất", style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.background }]}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backIcon, { color: t.textMuted }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: t.text }]}>Hồ sơ</Text>
        </View>

        <View style={styles.avatarSection}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarCircle, { backgroundColor: t.primary }]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          <Text style={[styles.displayName, { color: t.text }]}>{fullName}</Text>
          <Text style={[styles.email, { color: t.textMuted }]}>{user?.email}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: t.surface }]}>
          <InfoRow label="Họ và tên" value={fullName} t={t} />
          <View style={[styles.divider, { backgroundColor: t.border }]} />
          <InfoRow label="Email" value={user?.email ?? ""} t={t} />
          <View style={[styles.divider, { backgroundColor: t.border }]} />
          <InfoRow
            label="Ngày tham gia"
            value={user?.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : ""}
            t={t}
          />
        </View>

        <Link href="/(app)/profile/edit" asChild>
          <TouchableOpacity style={[styles.editBtn, { backgroundColor: t.surface }]}>
            <Text style={[styles.editBtnText, { color: t.textSecondary }]}>Chỉnh sửa hồ sơ</Text>
            <Text style={{ color: t.textFaint }}>→</Text>
          </TouchableOpacity>
        </Link>

        <View style={styles.spacer} />
        <Button label="Đăng xuất" onPress={handleLogout} variant="outline" />
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, t }: { label: string; value: string; t: Theme }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: t.textMuted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: t.textSecondary }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingVertical: 24 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 32 },
  backIcon: { fontSize: 18 },
  pageTitle: { fontSize: 20, fontWeight: "700" },
  avatarSection: { alignItems: "center", marginBottom: 32 },
  avatarImage: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  avatarCircle: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarInitial: { fontSize: 36, fontWeight: "700", color: "#fff" },
  displayName: { fontSize: 20, fontWeight: "700" },
  email: { fontSize: 14, marginTop: 4 },
  card: { borderRadius: 16, overflow: "hidden", marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  divider: { height: 1, marginHorizontal: 16 },
  row: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { fontSize: 14 },
  rowValue: { fontSize: 14, fontWeight: "500", flex: 1, textAlign: "right", marginLeft: 16 },
  editBtn: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  editBtnText: { fontWeight: "500" },
  spacer: { flex: 1 },
});
