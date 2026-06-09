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
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

function getPasswordStrength(pw: string): number {
  if (pw.length === 0) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function StrengthLabel({ score }: { score: number }) {
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  if (score === 0) return null;
  return (
    <Text style={{ fontSize: 11, fontWeight: "700", color: colors[score] }}>
      {labels[score]}
    </Text>
  );
}

export default function RegisterScreen() {
  const t = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState("");

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.displayName } },
    });
    setIsLoading(false);
    if (error) setError(error.message);
    else router.replace("/(app)/home");
  }

  const strength = getPasswordStrength(passwordValue);
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
              <Text style={[s.stepLabel, { color: t.textFaint }]}>Step 1 / 3</Text>
            </View>
          </View>

          {/* Header */}
          <View style={s.head}>
            <Text style={[s.eyebrow, { color: t.primaryDark }]}>Create Account</Text>
            <Text style={[s.title, { color: t.text }]}>
              Start a new <Text style={{ color: t.primaryDark }}>chapter</Text>.
            </Text>
            <Text style={[s.sub, { color: t.textMuted }]}>
              Thirty seconds. Then invite the other person to your shared map.
            </Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, value } }) => (
                <View style={[s.field, focusedField === "name" && { ...s.fieldFocus, borderColor: t.primary, backgroundColor: t.surface }]}>
                  <Text style={[s.fieldLabel, { color: t.textFaint }]}>Your display name</Text>
                  <View style={s.fieldRow}>
                    <Ionicons name="person-outline" size={17} color={t.textFaint} />
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
                  </View>
                  {errors.displayName && <Text style={[s.fieldError, { color: t.error }]}>{errors.displayName.message}</Text>}
                </View>
              )}
            />

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
                  <Text style={[s.fieldLabel, { color: t.textFaint }]}>Create password</Text>
                  <View style={s.fieldRow}>
                    <Ionicons name="lock-closed-outline" size={17} color={t.textFaint} />
                    <TextInput
                      style={[s.fieldInput, { color: t.text }]}
                      placeholder="••••••••"
                      placeholderTextColor={t.textFaint}
                      secureTextEntry={!showPassword}
                      onChangeText={(v) => { onChange(v); setPasswordValue(v); }}
                      value={value}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                    />
                    <StrengthLabel score={strength} />
                    <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={t.textFaint} />
                    </TouchableOpacity>
                  </View>
                  {/* Strength bar */}
                  {passwordValue.length > 0 && (
                    <View style={s.strengthRow}>
                      {[1, 2, 3, 4].map((i) => (
                        <View
                          key={i}
                          style={[
                            s.strengthBar,
                            {
                              backgroundColor: i <= strength
                                ? (strength <= 1 ? "#ef4444" : strength === 2 ? "#f97316" : strength === 3 ? "#eab308" : "#22c55e")
                                : t.border,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  )}
                  {errors.password && <Text style={[s.fieldError, { color: t.error }]}>{errors.password.message}</Text>}
                </View>
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <View style={[s.field, focusedField === "confirm" && { ...s.fieldFocus, borderColor: t.primary, backgroundColor: t.surface }]}>
                  <Text style={[s.fieldLabel, { color: t.textFaint }]}>Confirm password</Text>
                  <View style={s.fieldRow}>
                    <Ionicons name="lock-closed-outline" size={17} color={t.textFaint} />
                    <TextInput
                      style={[s.fieldInput, { color: t.text }]}
                      placeholder="••••••••"
                      placeholderTextColor={t.textFaint}
                      secureTextEntry
                      onChangeText={onChange}
                      value={value}
                      onFocus={() => setFocusedField("confirm")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                  {errors.confirmPassword && <Text style={[s.fieldError, { color: t.error }]}>{errors.confirmPassword.message}</Text>}
                </View>
              )}
            />

            <View style={s.termsRow}>
              <View style={[s.checkBox, { backgroundColor: t.primary }]}>
                <Ionicons name="checkmark" size={13} color="#fff" />
              </View>
              <Text style={[s.termsText, { color: t.textMuted }]}>
                I've read and agree to{" "}
                <Text style={{ color: t.primaryDark, fontWeight: "600" }}>Terms</Text>
                {" "}and{" "}
                <Text style={{ color: t.primaryDark, fontWeight: "600" }}>Privacy Policy</Text>.
              </Text>
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
              <Text style={s.ctaText}>{isLoading ? "Creating account…" : "Continue →"}</Text>
            </TouchableOpacity>

            <View style={s.divider}>
              <View style={[s.dividerLine, { backgroundColor: t.border }]} />
              <Text style={[s.dividerText, { color: t.textFaint }]}>or sign up with</Text>
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
            <Text style={{ color: t.textMuted }}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={[s.footLink, { color: t.primaryDark }]}>Sign in</Text>
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
    navRight: { marginLeft: "auto" },
    stepLabel: { fontSize: 12, fontWeight: "700" },
    head: { paddingHorizontal: 28, paddingTop: 12, paddingBottom: 24 },
    eyebrow: {
      fontSize: 11, fontWeight: "700", letterSpacing: 1.5,
      textTransform: "uppercase", marginBottom: 10,
    },
    title: { fontSize: 38, fontWeight: "800", letterSpacing: -0.5, lineHeight: 40 },
    sub: { fontSize: 14.5, lineHeight: 22, marginTop: 12 },
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
    fieldRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    fieldInput: { flex: 1, fontSize: 16, fontWeight: "500", paddingVertical: 2 },
    fieldError: { fontSize: 12, marginTop: 4 },
    strengthRow: { flexDirection: "row", gap: 4, marginTop: 8 },
    strengthBar: { flex: 1, height: 3, borderRadius: 2 },
    termsRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingHorizontal: 4, marginTop: 4 },
    checkBox: {
      width: 20, height: 20, borderRadius: 6,
      alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
    },
    termsText: { flex: 1, fontSize: 12.5, lineHeight: 20 },
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
      shadowOpacity: 0.32, shadowRadius: 16, elevation: 8,
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
