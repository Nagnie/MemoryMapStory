import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "./supabase";

// How notifications behave while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function getProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
  );
}

/**
 * Request notification permission, lấy Expo push token và upsert vào Supabase.
 * Trả về token, hoặc null nếu user từ chối / chưa cấu hình EAS projectId.
 */
export async function registerForPushNotifications(
  userId: string
): Promise<string | null> {
  // Android 13+ chỉ hiện permission prompt sau khi có ít nhất 1 channel.
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: "#e07a5f",
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== "granted") {
    const res = await Notifications.requestPermissionsAsync();
    status = res.status;
  }
  if (status !== "granted") return null;

  const projectId = getProjectId();
  if (!projectId) {
    // Portfolio app chưa link EAS — bỏ qua remote push, local notification vẫn chạy.
    console.warn(
      "[notifications] Missing EAS projectId — skipping push token registration"
    );
    return null;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    await supabase.from("push_tokens").upsert(
      { user_id: userId, token, platform: Platform.OS },
      { onConflict: "user_id,token" }
    );
    return token;
  } catch (e) {
    console.warn("[notifications] Failed to register push token", e);
    return null;
  }
}

/** Bắn 1 local notification ngay lập tức. */
export async function presentLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    trigger: null,
  });
}
