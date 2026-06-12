import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { useDuoMapStore } from "@/store/duoMap";
import { duoMemoriesQueryKey } from "./useDuoMapQuery";
import { reactionsQueryKey } from "./useReactionsQuery";
import type { Memory } from "@/store/memories";

export function useDuoMapRealtime(duoMapId: string) {
  const { user } = useAuthStore();
  const { setPartnerOnline } = useDuoMapStore();
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!duoMapId || !user) return;

    const channel = supabase
      .channel(`duo:${duoMapId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "memories" },
        (payload) => {
          const memory = payload.new as Memory;
          queryClient.setQueryData<Memory[]>(
            duoMemoriesQueryKey(duoMapId),
            (old) => {
              if (!old) return [memory];
              if (old.some((m) => m.id === memory.id)) return old;
              return [memory, ...old];
            }
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reactions" },
        (payload) => {
          queryClient.invalidateQueries({
            queryKey: reactionsQueryKey(payload.new.memory_id as string),
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "reactions" },
        (payload) => {
          queryClient.invalidateQueries({
            queryKey: reactionsQueryKey(payload.new.memory_id as string),
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "reactions" },
        (payload) => {
          queryClient.invalidateQueries({
            queryKey: reactionsQueryKey(payload.old.memory_id as string),
          });
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ user_id: string }>();
        const online = Object.values(state)
          .flat()
          .some((p) => p.user_id !== user.id);
        setPartnerOnline(online);
      })
      .on("presence", { event: "leave" }, () => {
        const state = channel.presenceState<{ user_id: string }>();
        const online = Object.values(state)
          .flat()
          .some((p) => p.user_id !== user.id);
        setPartnerOnline(online);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.untrack();
      channel.unsubscribe();
      setPartnerOnline(false);
    };
  }, [duoMapId, user?.id]);
}
