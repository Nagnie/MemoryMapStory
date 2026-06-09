import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({ email: z.string().email("Email không hợp lệ") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const t = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    await supabase.auth.resetPasswordForEmail(data.email);
    setIsLoading(false);
    setSent(true);
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: t.surface }]}
          >
            <Text style={[styles.backIcon, { color: t.textSecondary }]}>←</Text>
          </TouchableOpacity>

          <Text style={[styles.title, { color: t.text }]}>Quên mật khẩu?</Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>
            Nhập email và chúng tôi sẽ gửi link đặt lại mật khẩu
          </Text>

          {sent ? (
            <View style={[styles.successBox, { backgroundColor: t.successBg, borderColor: t.successBorder }]}>
              <Text style={[styles.successTitle, { color: t.success }]}>Email đã được gửi!</Text>
              <Text style={[styles.successText, { color: t.success }]}>
                Kiểm tra hộp thư của bạn và làm theo hướng dẫn.
              </Text>
            </View>
          ) : (
            <View style={styles.form}>
              <Controller control={control} name="email"
                render={({ field: { onChange, value } }) => (
                  <Input label="Email" placeholder="email@example.com"
                    keyboardType="email-address" autoCapitalize="none"
                    onChangeText={onChange} value={value} error={errors.email?.message} />
                )} />
              <Button label="Gửi link đặt lại mật khẩu" onPress={handleSubmit(onSubmit)} isLoading={isLoading} />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingVertical: 40 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 32, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  backIcon: { fontSize: 18 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 15, marginBottom: 32 },
  form: { gap: 16 },
  successBox: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 16 },
  successTitle: { fontWeight: "600", marginBottom: 4 },
  successText: { fontSize: 14 },
});
