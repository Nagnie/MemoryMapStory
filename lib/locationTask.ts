import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LocationObject } from "expo-location";
import { distanceMeters } from "./haversine";

export const LOCATION_TASK_NAME = "BACKGROUND_LOCATION_MEMORY_CHECK";

// Cache nhẹ của memory coords để background task đọc được (không truy cập được React state).
export const NEARBY_MEMORIES_KEY = "@nearby_memories";
const NOTIFIED_KEY = "@notified_memories";

const PROXIMITY_METERS = 200;
const THROTTLE_MS = 24 * 60 * 60 * 1000; // không nhắc lại cùng 1 memory trong 24h

export interface CachedMemory {
  id: string;
  latitude: number;
  longitude: number;
  place_name: string | null;
}

async function checkNearbyMemories(lat: number, lng: number): Promise<void> {
  const rawMemories = await AsyncStorage.getItem(NEARBY_MEMORIES_KEY);
  if (!rawMemories) return;

  let memories: CachedMemory[];
  try {
    memories = JSON.parse(rawMemories) as CachedMemory[];
  } catch {
    return;
  }
  if (!memories.length) return;

  const rawNotified = await AsyncStorage.getItem(NOTIFIED_KEY);
  const notified: Record<string, number> = rawNotified
    ? JSON.parse(rawNotified)
    : {};
  const now = Date.now();
  let changed = false;

  for (const memory of memories) {
    const last = notified[memory.id];
    if (last && now - last < THROTTLE_MS) continue;

    const dist = distanceMeters(lat, lng, memory.latitude, memory.longitude);
    if (dist > PROXIMITY_METERS) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📍 Một kỷ niệm gần đây",
        body: memory.place_name
          ? `Bạn đang ở gần kỷ niệm tại ${memory.place_name}`
          : "Bạn đang đứng ngay nơi một kỷ niệm cũ diễn ra",
        data: { memoryId: memory.id },
      },
      trigger: null,
    });
    notified[memory.id] = now;
    changed = true;
  }

  if (changed) {
    await AsyncStorage.setItem(NOTIFIED_KEY, JSON.stringify(notified));
  }
}

// Phải define ở global scope của bundle (import ở root) để task được đăng ký
// trước khi bất kỳ screen nào mount.
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) return;
  const locations = (data as { locations?: LocationObject[] } | undefined)
    ?.locations;
  if (!locations?.length) return;
  const { latitude, longitude } = locations[locations.length - 1].coords;
  await checkNearbyMemories(latitude, longitude);
});
