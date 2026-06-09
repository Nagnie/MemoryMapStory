import { useState } from "react";
import {
  View, Text, TouchableOpacity, Image, Alert,
  ScrollView, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  fullName: z.string().min(2, "Tên ít nhất 2 ký tự"),
});
type FormData = z.infer<typeof schema>;

export default function EditProfileScreen() {
  const { user, setSession } = useAuthStore();
  const t = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.user_metadata?.avatar_url ?? null
  );

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: user?.user_metadata?.full_name ?? "" },
  });

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  }

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      let avatarUrl = user?.user_metadata?.avatar_url;
      if (avatarUri && avatarUri !== avatarUrl) {
        const fileName = `${user!.id}-${Date.now()}.jpg`;
        const response = await fetch(avatarUri);
        const blob = await response.blob();
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, blob, { contentType: "image/jpeg", upsert: true });
        if (!uploadError) {
          avatarUrl = supabase.storage.from("avatars").getPublicUrl(fileName).data.publicUrl;
        }
      }

      const { error } = await supabase.auth.updateUser({
        data: { full_name: data.fullName, avatar_url: avatarUrl },
      });
      if (error) throw error;

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) setSession(sessionData.session);

      Alert.alert("Thành công", "Hồ sơ đã được cập nhật!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Lỗi", "Không thể cập nhật hồ sơ. Vui lòng thử lại.");
    }
    setIsLoading(false);
  }

  const initial = (user?.user_metadata?.full_name?.[0] ?? "?").toUpperCase();

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={[styles.backIcon, { color: t.textMuted }]}>←</Text>
              </TouchableOpacity>
              <Text style={[styles.pageTitle, { color: t.text }]}>Chỉnh sửa hồ sơ</Text>
            </View>

            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={pickAvatar} style={styles.avatarWrap}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatarCircle, { backgroundColor: t.primary }]}>
                    <Text style={styles.avatarInitial}>{initial}</Text>
                  </View>
                )}
                <View style={[styles.editBadge, { backgroundColor: t.primary, borderColor: t.background }]}>
                  <Text style={styles.editBadgeIcon}>✎</Text>
                </View>
              </TouchableOpacity>
              <Text style={[styles.avatarHint, { color: t.textFaint }]}>Nhấn để thay đổi ảnh</Text>
            </View>

            <View style={styles.form}>
              <Controller control={control} name="fullName"
                render={({ field: { onChange, value } }) => (
                  <Input label="Họ và tên" placeholder="Nguyễn Văn A" autoCapitalize="words"
                    onChangeText={onChange} value={value} error={errors.fullName?.message} />
                )} />

              <View style={[styles.emailBox, { backgroundColor: t.surface }]}>
                <Text style={[styles.emailLabel, { color: t.textFaint }]}>Email (không thể thay đổi)</Text>
                <Text style={[styles.emailValue, { color: t.textMuted }]}>{user?.email}</Text>
              </View>

              <Button label="Lưu thay đổi" onPress={handleSubmit(onSubmit)} isLoading={isLoading} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { paddingHorizontal: 24, paddingVertical: 24 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 32 },
  backIcon: { fontSize: 18 },
  pageTitle: { fontSize: 20, fontWeight: "700" },
  avatarSection: { alignItems: "center", marginBottom: 32 },
  avatarWrap: { position: "relative" },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  avatarCircle: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 36, fontWeight: "700", color: "#fff" },
  editBadge: { position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  editBadgeIcon: { color: "#fff", fontSize: 13 },
  avatarHint: { fontSize: 12, marginTop: 8 },
  form: { gap: 16 },
  emailBox: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  emailLabel: { fontSize: 12, marginBottom: 4 },
  emailValue: { fontSize: 15 },
});
