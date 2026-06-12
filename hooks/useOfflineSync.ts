import { useState, useEffect, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";
import { supabase } from "@/lib/supabase";
import { uploadMemoryImage } from "@/lib/storage";
import { OfflineQueue, DraftMemory } from "@/lib/offline-queue";
import { useAuthStore } from "@/store/auth";
import { useMemoriesStore, Memory } from "@/store/memories";

export function useOfflineSync() {
  const { user } = useAuthStore();
  const { addMemory } = useMemoriesStore();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load initial count
  useEffect(() => {
    OfflineQueue.getQueue().then((q) => setPendingCount(q.length));
  }, []);

  const flush = useCallback(async () => {
    if (!user) return;
    const queue = await OfflineQueue.getQueue();
    if (!queue.length) return;

    setIsSyncing(true);

    for (const draft of queue) {
      try {
        const imageUrl = await uploadMemoryImage(draft.imageUri, user.id);
        const { data, error } = await supabase
          .from("memories")
          .insert({
            user_id: user.id,
            image_url: imageUrl,
            latitude: draft.latitude,
            longitude: draft.longitude,
            caption: draft.caption,
            mood_tag: draft.mood_tag,
            created_at: draft.created_at,
          })
          .select()
          .single();

        if (!error && data) {
          addMemory(data as Memory);
          await OfflineQueue.remove(draft.id);
          setPendingCount((c) => Math.max(0, c - 1));
        }
      } catch {
        // Keep in queue — retry next time network is available
      }
    }

    setIsSyncing(false);
  }, [user?.id]);

  // Auto-flush when network comes back
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
