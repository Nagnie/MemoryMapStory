import { useState } from "react";
import {
  View, Text, TouchableOpacity, Image, Alert,
  ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TextInput,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/hooks/useTheme";

const schema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(2, "Username must be at least 2 characters"),
  bio: z.string().max(120, "Bio must be under 120 characters"),
  location: z.string(),
});
type FormData = z.infer<typeof schema>;

export default function EditProfileScreen() {
  const { user, setSession } = useAuthStore();
  const t = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.user_metadata?.avatar_url ?? null
  );
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const initial = (user?.user_metadata?.full_name?.[0] ?? "?").toUpperCase();
  const defaultUsername = (user?.email ?? "").split("@")[0];

  const { control, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name ?? "",
      username: defaultUsername,
      bio: "",
      location: "",
    },
  });

  const bioValue = watch("bio") ?? "";

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

      Alert.alert("Saved!", "Your profile has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Could not update profile. Please try again.");
    }
    setIsLoading(false);
  }

  const s = createStyles(t);

  return (
    <SafeAreaView style={[s.flex, { backgroundColor: t.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.flex}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Nav */}
          <View style={s.nav}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={t.text} />
            </TouchableOpacity>
            <Text style={[s.navTitle, { color: t.text }]}>Edit Profile</Text>
            <TouchableOpacity
              style={s.saveBtn}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text style={[s.saveText, { color: t.primaryDark }]}>
                {isLoading ? "Saving…" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={s.avBlock}>
            <TouchableOpacity onPress={pickAvatar} style={s.avRing}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={s.avImage} />
              ) : (
                <View style={[s.avCircle, { backgroundColor: t.primary }]}>
                  <Text style={s.avInitial}>{initial}</Text>
                </View>
              )}
              <View style={[s.camBadge, { backgroundColor: t.primary, borderColor: t.background }]}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={[s.avHint, { color: t.primaryDark }]}>Change photo</Text>
          </View>

          {/* Fields */}
          <View style={s.form}>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <View style={[s.field, focusedField === "name" && { ...s.fieldFocus, borderColor: t.primary, backgroundColor: t.surface }]}>
                  <Text style={[s.fieldLabel, { color: t.textFaint }]}>Display name</Text>
                  <TextInput
                    style={[s.fieldInput, { color: t.text }]}
                    placeholder="Alex"
                    placeholderTextColor={t.textFaint}
                    autoCapitalize="words"
                    onChangeText={onChange}
                    value={value}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.fullName && <Text style={[s.fieldError, { color: t.error }]}>{errors.fullName.message}</Text>}
                </View>
              )}
            />

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <View style={[s.field, focusedField === "username" && { ...s.fieldFocus, borderColor: t.primary, backgroundColor: t.surface }]}>
                  <Text style={[s.fieldLabel, { color: t.textFaint }]}>Username</Text>
                  <View style={s.fieldRow}>
                    <Text style={[s.fieldPrefix, { color: t.textFaint }]}>@</Text>
                    <TextInput
                      style={[s.fieldInput, { color: t.text }]}
                      placeholder="yourhandle"
                      placeholderTextColor={t.textFaint}
                      autoCapitalize="none"
                      onChangeText={onChange}
                      value={value}
                      onFocus={() => setFocusedField("username")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                  {errors.username && <Text style={[s.fieldError, { color: t.error }]}>{errors.username.message}</Text>}
                </View>
              )}
            />

            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, value } }) => (
                <View style={[s.field, focusedField === "bio" && { ...s.fieldFocus, borderColor: t.primary, backgroundColor: t.surface }]}>
                  <Text style={[s.fieldLabel, { color: t.textFaint }]}>Short bio</Text>
                  <TextInput
                    style={[s.fieldInput, s.fieldMultiline, { color: t.text }]}
                    placeholder='"Everywhere is home…"'
                    placeholderTextColor={t.textFaint}
                    multiline
                    numberOfLines={3}
                    onChangeText={onChange}
                    value={value}
                    onFocus={() => setFocusedField("bio")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <Text style={[s.charCount, { color: t.textFaint }]}>{bioValue.length} / 120</Text>
                  {errors.bio && <Text style={[s.fieldError, { color: t.error }]}>{errors.bio.message}</Text>}
                </View>
              )}
            />

            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, value } }) => (
                <View style={[s.field, focusedField === "location" && { ...s.fieldFocus, borderColor: t.primary, backgroundColor: t.surface }]}>
                  <Text style={[s.fieldLabel, { color: t.textFaint }]}>Location</Text>
                  <View style={s.fieldRow}>
                    <Ionicons name="location-outline" size={16} color={t.textFaint} style={{ marginRight: 6 }} />
                    <TextInput
                      style={[s.fieldInput, { color: t.text }]}
                      placeholder="City, Country"
                      placeholderTextColor={t.textFaint}
                      onChangeText={onChange}
                      value={value}
                      onFocus={() => setFocusedField("location")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
              )}
            />

            {/* Email (read-only) */}
            <View style={[s.field, { opacity: 0.6 }]}>
              <Text style={[s.fieldLabel, { color: t.textFaint }]}>Email (cannot be changed)</Text>
              <Text style={[s.fieldInput, { color: t.textMuted }]}>{user?.email}</Text>
            </View>
          </View>

          {/* Danger zone */}
          <View style={[s.dangerList, { backgroundColor: t.surface, borderColor: t.border }]}>
            <TouchableOpacity
              style={s.dangerRow}
              activeOpacity={0.7}
              onPress={() =>
                Alert.alert(
                  "Delete account",
                  "This action is irreversible. Your shared map will remain for your partner.",
                  [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive" }]
                )
              }
            >
              <View style={[s.dangerIcon, { backgroundColor: `${t.primary}18` }]}>
                <Ionicons name="trash-outline" size={17} color={t.primaryDark} />
              </View>
              <View style={s.dangerText}>
                <Text style={[s.dangerLabel, { color: t.primaryDark }]}>Delete account</Text>
                <Text style={[s.dangerSub, { color: t.textFaint }]}>The shared map stays for your partner</Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={t.textFaint} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    flex: { flex: 1 },
    nav: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 18, paddingTop: 16, height: 64,
    },
    backBtn: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: t.surface,
      alignItems: "center", justifyContent: "center",
      borderWidth: 0.5, borderColor: t.border,
      shadowColor: "#2a1e14",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    },
    navTitle: { flex: 1, textAlign: "center", fontSize: 15, fontWeight: "700" },
    saveBtn: { width: 60, alignItems: "flex-end" },
    saveText: { fontSize: 14, fontWeight: "700" },
    avBlock: {
      alignItems: "center", paddingVertical: 24, paddingHorizontal: 22,
    },
    avRing: {
      position: "relative",
      width: 96, height: 96, borderRadius: 48,
      backgroundColor: "#fff", padding: 4,
      shadowColor: "#2a1e14",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.16, shadowRadius: 16, elevation: 8,
    },
    avImage: { width: "100%", height: "100%", borderRadius: 44 },
    avCircle: {
      width: "100%", height: "100%", borderRadius: 44,
      alignItems: "center", justifyContent: "center",
    },
    avInitial: { fontSize: 38, fontWeight: "800", color: "#fff" },
    camBadge: {
      position: "absolute", bottom: -2, right: -2,
      width: 32, height: 32, borderRadius: 16,
      alignItems: "center", justifyContent: "center",
      borderWidth: 3,
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    avHint: { fontSize: 12, fontWeight: "600", marginTop: 10 },
    form: { paddingHorizontal: 22, gap: 12 },
    field: {
      backgroundColor: t.surface, borderRadius: 18,
      paddingHorizontal: 18, paddingVertical: 12,
      borderWidth: 0.5, borderColor: t.border,
    },
    fieldFocus: { borderWidth: 1.5 },
    fieldLabel: {
      fontSize: 10.5, fontWeight: "700", letterSpacing: 0.8,
      textTransform: "uppercase", marginBottom: 4,
    },
    fieldRow: { flexDirection: "row", alignItems: "center" },
    fieldPrefix: { fontSize: 16, fontWeight: "500", marginRight: 2 },
    fieldInput: { flex: 1, fontSize: 16, fontWeight: "500", paddingVertical: 2 },
    fieldMultiline: { minHeight: 70, textAlignVertical: "top" },
    fieldError: { fontSize: 12, marginTop: 4 },
    charCount: { fontSize: 10.5, textAlign: "right", marginTop: 4 },
    dangerList: {
      marginHorizontal: 22, marginTop: 24,
      borderRadius: 22, overflow: "hidden", borderWidth: 0.5,
    },
    dangerRow: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 18, paddingVertical: 14, gap: 14,
    },
    dangerIcon: {
      width: 34, height: 34, borderRadius: 10,
      alignItems: "center", justifyContent: "center",
    },
    dangerText: { flex: 1 },
    dangerLabel: { fontSize: 14.5, fontWeight: "600" },
    dangerSub: { fontSize: 11.5, marginTop: 1 },
  });
}
