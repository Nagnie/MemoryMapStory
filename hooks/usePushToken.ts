import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { registerForPushNotifications } from "@/lib/notifications";

/**
 * Đăng ký push token 1 lần khi đã đăng nhập. Idempotent nhờ upsert + onConflict.
 */
export function usePushToken() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    registerForPushNotifications(user.id).catch(() => {});
  }, [user?.id]);
}
