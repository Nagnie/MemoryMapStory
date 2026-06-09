import { useState } from "react";
import {
  View, Text, KeyboardAvoidingView, Platform,
  ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const t = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        setError("Email chưa được xác nhận. Kiểm tra hộp thư hoặc tắt xác nhận email trong Supabase.");
      else if (error.message.includes("Invalid login credentials"))
        setError("Email hoặc mật khẩu không đúng.");
      else
        setError(error.message);
    }
    else router.replace("/(app)/home");
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconBox, { backgroundColor: t.primary }]}>
                <Text style={styles.icon}>🔥</Text>
              </View>
              <Text style={[styles.title, { color: t.text }]}>Chào mừng trở lại!</Text>
              <Text style={[styles.subtitle, { color: t.textMuted }]}>Đăng nhập để tiếp tục</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Controller
                control={control} name="email"
                render={({ field: { onChange, value } }) => (
                  <Input label="Email" placeholder="email@example.com"
                    keyboardType="email-address" autoCapitalize="none"
                    onChangeText={onChange} value={value} error={errors.email?.message} />
                )}
              />
              <Controller
                control={control} name="password"
                render={({ field: { onChange, value } }) => (
                  <Input label="Mật khẩu" placeholder="••••••••"
                    secureTextEntry onChangeText={onChange} value={value}
                    error={errors.password?.message} />
                )}
              />
              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity style={styles.forgotWrap}>
                  <Text style={[styles.forgotText, { color: t.primary }]}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </Link>

              {error ? (
                <View style={[styles.errorBox, { backgroundColor: t.errorBg, borderColor: t.errorBorder }]}>
                  <Text style={[styles.errorText, { color: t.error }]}>{error}</Text>
                </View>
              ) : null}

              <Button label="Đăng nhập" onPress={handleSubmit(onSubmit)} isLoading={isLoading} />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={{ color: t.textMuted }}>Chưa có tài khoản? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={[styles.footerLink, { color: t.primary }]}>Đăng ký ngay</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 },
  header: { marginBottom: 40 },
  iconBox: { width: 64, height: 64, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  icon: { fontSize: 28 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 15 },
  form: { gap: 16 },
  forgotWrap: { alignSelf: "flex-end" },
  forgotText: { fontSize: 14, fontWeight: "500" },
  errorBox: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  errorText: { fontSize: 14 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 32 },
  footerLink: { fontWeight: "600" },
});
