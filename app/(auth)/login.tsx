import { useState } from "react";
import {
  View, Text, KeyboardAvoidingView, Platform,
  ScrollView, TouchableOpacity, StyleSheet, TextInput,
} from "react-native";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const t = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setIsLoading(false);
    if (error) {
      if (error.message.includes("Email not confirmed"))
        setError("Email not confirmed. Check your inbox or disable email confirmation in Supabase.");
      else if (error.message.includes("Invalid login credentials"))
        setError("Incorrect email or password.");
      else
        setError(error.message);
    } else {
      router.replace("/(app)/home");
    }
  }

  const s = createStyles(t);

  return (
    <SafeAreaView style={[s.flex, { backgroundColor: t.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.flex}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Nav */}
          <View style={s.nav}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={t.text} />
            </TouchableOpacity>
            <View style={s.navRight}>
              <Text style={[s.navLink, { color: t.textFaint }]}>Help</Text>
            </View>
          </View>

          {/* Header */}
          <View style={s.head}>
            <Text style={[s.eyebrow, { color: t.primaryDark }]}>Sign In</Text>
            <Text style={[s.title, { color: t.text }]}>
              Welcome <Text style={{ color: t.primaryDark }}>back</Text>.
            </Text>
            <Text style={[s.sub, { color: t.textMuted }]}>
              Reopen your shared map — all your pins, photos, and notes are still there.
            </Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View style={[s.field, focusedField === "email" && { ...s.fieldFocus, borderColor: t.primary, backgroundColor: t.surface }]}>
                  <Text style={[s.fieldLabel, { color: t.textFaint }]}>Email</Text>
                  <View style={s.fieldRow}>
                    <Ionicons name="mail-outline" size={17} color={t.textFaint} />
                    <TextInput
                      style={[s.fieldInput, { color: t.text }]}
                      placeholder="you@example.com"
                      placeholderTextColor={t.textFaint}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onChangeText={onChange}
                      value={value}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                  {errors.email && <Text style={[s.fieldError, { color: t.error }]}>{errors.email.message}</Text>}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View style={[s.field, focusedField === "password" && { ...s.fieldFocus, borderColor: t.primary, backgroundColor: t.surface }]}>
                  <Text style={[s.fieldLabel, { color: t.textFaint }]}>Password</Text>
                  <View style={s.fieldRow}>
                    <Ionicons name="lock-closed-outline" size={17} color={t.textFaint} />
                    <TextInput
                      style={[s.fieldInput, { color: t.text }]}
                      placeholder="••••••••"
                      placeholderTextColor={t.textFaint}
                      secureTextEntry={!showPassword}
                      onChangeText={onChange}
                      value={value}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={t.textFaint} />
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text style={[s.fieldError, { color: t.error }]}>{errors.password.message}</Text>}
                </View>
              )}
            />

            <View style={s.row}>
              <View style={s.checkRow}>
                <View style={[s.checkBox, { backgroundColor: t.primary }]}>
                  <Ionicons name="checkmark" size={13} color="#fff" />
                </View>
                <Text style={[s.checkLabel, { color: t.textMuted }]}>Remember me</Text>
              </View>
              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity>
                  <Text style={[s.rowLink, { color: t.primaryDark }]}>Forgot password?</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {error ? (
              <View style={[s.errorBox, { backgroundColor: t.errorBg, borderColor: t.errorBorder }]}>
                <Text style={[s.errorText, { color: t.error }]}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[s.cta, { backgroundColor: t.primary, opacity: isLoading ? 0.75 : 1 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={s.ctaText}>{isLoading ? "Signing in…" : "Open the map"}</Text>
            </TouchableOpacity>

            <View style={s.divider}>
              <View style={[s.dividerLine, { backgroundColor: t.border }]} />
              <Text style={[s.dividerText, { color: t.textFaint }]}>or continue with</Text>
              <View style={[s.dividerLine, { backgroundColor: t.border }]} />
            </View>

            <View style={s.social}>
              <TouchableOpacity style={[s.socialBtn, { backgroundColor: t.surface, borderColor: t.border }]}>
                <AntDesign name="apple" size={17} color={t.text} />
                <Text style={[s.socialText, { color: t.text }]}>Apple</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.socialBtn, { backgroundColor: t.surface, borderColor: t.border }]}>
                <AntDesign name="google" size={17} color={t.text} />
                <Text style={[s.socialText, { color: t.text }]}>Google</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.foot}>
            <Text style={{ color: t.textMuted }}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={[s.footLink, { color: t.primaryDark }]}>Sign up free</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    flex: { flex: 1 },
    scroll: { flexGrow: 1 },
    nav: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 0,
      height: 64,
    },
    backBtn: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: t.surface,
      alignItems: "center", justifyContent: "center",
      borderWidth: 0.5, borderColor: t.border,
      shadowColor: "#2a1e14",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    navRight: { marginLeft: "auto" },
    navLink: { fontSize: 14, fontWeight: "600", paddingVertical: 8 },
    head: { paddingHorizontal: 28, paddingTop: 12, paddingBottom: 24 },
    eyebrow: {
      fontSize: 11, fontWeight: "700", letterSpacing: 1.5,
      textTransform: "uppercase", marginBottom: 10,
    },
    title: { fontSize: 38, fontWeight: "800", letterSpacing: -0.5, lineHeight: 40 },
    sub: { fontSize: 14.5, lineHeight: 22, marginTop: 12 },
    form: { paddingHorizontal: 22, gap: 12 },
    field: {
      backgroundColor: t.surface,
      borderRadius: 18,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderWidth: 0.5,
      borderColor: t.border,
    },
    fieldFocus: {
      borderWidth: 1.5,
    },
    fieldLabel: {
      fontSize: 10.5, fontWeight: "700", letterSpacing: 0.8,
      textTransform: "uppercase", marginBottom: 4,
    },
    fieldRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    fieldInput: { flex: 1, fontSize: 16, fontWeight: "500", paddingVertical: 2 },
    fieldError: { fontSize: 12, marginTop: 4 },
    row: {
      flexDirection: "row", alignItems: "center",
      justifyContent: "space-between", paddingHorizontal: 4, marginTop: 4,
    },
    checkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    checkBox: {
      width: 20, height: 20, borderRadius: 6,
      alignItems: "center", justifyContent: "center",
    },
    checkLabel: { fontSize: 13 },
    rowLink: { fontSize: 13, fontWeight: "600" },
    errorBox: {
      borderWidth: 1, borderRadius: 12,
      paddingHorizontal: 16, paddingVertical: 12,
    },
    errorText: { fontSize: 14 },
    cta: {
      height: 56, borderRadius: 18,
      alignItems: "center", justifyContent: "center",
      marginTop: 18,
      shadowColor: "#e07a5f",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.32,
      shadowRadius: 16,
      elevation: 8,
    },
    ctaText: { color: "#fff", fontSize: 15.5, fontWeight: "700" },
    divider: {
      flexDirection: "row", alignItems: "center",
      gap: 12, marginTop: 22, marginBottom: 14, paddingHorizontal: 4,
    },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { fontSize: 11, fontWeight: "600", letterSpacing: 1.2, textTransform: "uppercase" },
    social: { flexDirection: "row", gap: 10 },
    socialBtn: {
      flex: 1, height: 52, borderRadius: 16,
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
      borderWidth: 0.5,
    },
    socialText: { fontSize: 14, fontWeight: "600" },
    foot: {
      flexDirection: "row", justifyContent: "center",
      paddingVertical: 24, paddingBottom: 36,
    },
    footLink: { fontWeight: "700" },
  });
}
