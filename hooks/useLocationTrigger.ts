import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useMemories } from "./useMemories";
import {
  LOCATION_TASK_NAME,
  NEARBY_MEMORIES_KEY,
  type CachedMemory,
} from "@/lib/locationTask";

/**
 * Background location task: khi user lại gần (<200m) một memory cũ → local notification.
 *
 * - Sync coords của memories xuống AsyncStorage để background task đọc được.
 * - Start `startLocationUpdatesAsync` 1 lần (chỉ khi user cấp "Always" permission).
 */
export function useLocationTrigger() {
  const { memories } = useMemories();

  // Keep cache đồng bộ cho background task.
  useEffect(() => {
    const slim: CachedMemory[] = memories.map((m) => ({
      id: m.id,
      latitude: m.latitude,
      longitude: m.longitude,
      place_name: m.place_name,
    }));
    AsyncStorage.setItem(NEARBY_MEMORIES_KEY, JSON.stringify(slim)).catch(() => {});
  }, [memories]);

  // Khởi động background location updates (idempotent).
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const fg = await Location.requestForegroundPermissionsAsync();
      if (fg.status !== "granted") return;

      const bg = await Location.requestBackgroundPermissionsAsync();
      if (bg.status !== "granted") return;
      if (cancelled) return;

      const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      if (alreadyStarted || cancelled) return;

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 100, // mét — chỉ update khi di chuyển đáng kể, tiết kiệm pin
        deferredUpdatesInterval: 60_000,
        showsBackgroundLocationIndicator: false,
        pausesUpdatesAutomatically: true,
        foregroundService: {
          notificationTitle: "MemoryMap",
          notificationBody: "Đang để ý xem bạn có ở gần kỷ niệm cũ nào không",
        },
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}
