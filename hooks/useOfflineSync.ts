import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { supabase } from "@/lib/supabase";
import { uploadMemoryImage } from "@/lib/storage";
import { reverseGeocode } from "@/lib/location";
import { OfflineQueue, DraftMemory } from "@/lib/offline-queue";
import { useAuthStore } from "@/store/auth";
import { memoriesQueryKey } from "./useMemoriesQuery";

export function useOfflineSync() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    OfflineQueue.getQueue().then((q) => setPendingCount(q.length));
  }, []);

  const flush = useCallback(async () => {
    if (!user) return;
    const queue = await OfflineQueue.getQueue();
    if (!queue.length) return;

    setIsSyncing(true);
    let synced = 0;

    for (const draft of queue) {
      try {
        const imageUrl = await uploadMemoryImage(draft.imageUri, user.id);
        // Draft tạo lúc offline chưa có place_name — geocode bây giờ khi đã có mạng
        const placeName =
          draft.place_name ?? (await reverseGeocode(draft.latitude, draft.longitude));
        const { error } = await supabase.from("memories").insert({
          user_id: user.id,
          image_url: imageUrl,
          latitude: draft.latitude,
          longitude: draft.longitude,
          caption: draft.caption,
          mood_tag: draft.mood_tag,
          place_name: placeName,
          created_at: draft.created_at,
        });

        if (!error) {
          await OfflineQueue.remove(draft.id);
          synced++;
          setPendingCount((c) => Math.max(0, c - 1));
        }
      } catch {
        // Keep in queue — retry next time network is available
      }
    }

    if (synced > 0) {
      queryClient.invalidateQueries({ queryKey: memoriesQueryKey(user.id) });
    }

    setIsSyncing(false);
  }, [user?.id]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && !isSyncing) {
        flush();
      }
    });
    return () => unsubscribe();
  }, [flush, isSyncing]);

  async function enqueue(draft: DraftMemory) {
    await OfflineQueue.enqueue(draft);
    setPendingCount((c) => c + 1);
  }

  return { pendingCount, isSyncing, enqueue, flush };
}
