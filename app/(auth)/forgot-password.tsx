import { useState } from "react";
import {
  View, Text, KeyboardAvoidingView, Platform,
  TouchableOpacity, StyleSheet, TextInput,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";

const schema = z.object({ email: z.string().email("Invalid email address") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const t = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focusedField, setFocusedField] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    await supabase.auth.resetPasswordForEmail(data.email);
    setIsLoading(false);
    setSent(true);
  }

  const s = createStyles(t);

  return (
    <SafeAreaView style={[s.flex, { backgroundColor: t.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.flex}>
        <View style={s.container}>
          {/* Nav */}
          <View style={s.nav}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={t.text} />
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View style={s.head}>
            <Text style={[s.eyebrow, { color: t.primaryDark }]}>Account Recovery</Text>
            <Text style={[s.title, { color: t.text }]}>
              Forgot your <Text style={{ color: t.primaryDark }}>password?</Text>
            </Text>
            <Text style={[s.sub, { color: t.textMuted }]}>
              Enter your email and we'll send a reset link right away.
            </Text>
          </View>

          {sent ? (
            <View style={[s.successBox, { backgroundColor: t.successBg, borderColor: t.successBorder }]}>
              <Text style={[s.successTitle, { color: t.success }]}>Email sent!</Text>
              <Text style={[s.successText, { color: t.success }]}>
                Check your inbox and follow the instructions to reset your password.
              </Text>
            </View>
          ) : (
            <View style={s.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <View style={[s.field, focusedField && { ...s.fieldFocus, borderColor: t.primary, backgroundColor: t.surface }]}>
                    <Text style={[s.fieldLabel, { color: t.textFaint }]}>Email address</Text>
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
                        onFocus={() => setFocusedField(true)}
                        onBlur={() => setFocusedField(false)}
                      />
                    </View>
                    {errors.email && <Text style={[s.fieldError, { color: t.error }]}>{errors.email.message}</Text>}
                  </View>
                )}
              />

              <TouchableOpacity
                style={[s.cta, { backgroundColor: t.primary, opacity: isLoading ? 0.75 : 1 }]}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <Text style={s.ctaText}>{isLoading ? "Sending…" : "Send reset link"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 22 },
    nav: {
      paddingTop: 16, height: 64,
      flexDirection: "row", alignItems: "center",
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
    head: { paddingHorizontal: 6, paddingTop: 12, paddingBottom: 32 },
    eyebrow: {
      fontSize: 11, fontWeight: "700", letterSpacing: 1.5,
      textTransform: "uppercase", marginBottom: 10,
    },
    title: { fontSize: 38, fontWeight: "800", letterSpacing: -0.5, lineHeight: 40 },
    sub: { fontSize: 14.5, lineHeight: 22, marginTop: 12 },
    form: { gap: 16 },
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
    cta: {
      height: 56, borderRadius: 18,
      alignItems: "center", justifyContent: "center",
      shadowColor: "#e07a5f",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.32, shadowRadius: 16, elevation: 8,
    },
    ctaText: { color: "#fff", fontSize: 15.5, fontWeight: "700" },
    successBox: {
      borderWidth: 1, borderRadius: 18,
      paddingHorizontal: 20, paddingVertical: 20,
      marginHorizontal: 6,
    },
    successTitle: { fontWeight: "700", fontSize: 16, marginBottom: 6 },
    successText: { fontSize: 14, lineHeight: 20 },
  });
}
