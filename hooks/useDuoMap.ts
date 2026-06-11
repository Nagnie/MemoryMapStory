import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { useDuoMapStore, Reaction } from "@/store/duoMap";
import { Memory } from "@/store/memories";

export function useDuoMapRealtime(duoMapId: string) {
  const { user } = useAuthStore();
  const store = useDuoMapStore();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!duoMapId || !user) return;

    // Fetch all members → then fetch their memories
    supabase
      .from("duo_map_members")
      .select("user_id")
      .eq("duo_map_id", duoMapId)
      .then(({ data: members }) => {
        if (!members?.length) return;
        const ids = members.map((m) => m.user_id);
        supabase
          .from("memories")
          .select("*")
          .in("user_id", ids)
          .order("created_at", { ascending: false })
          .then(({ data }) => {
            if (data) store.setMemories(data as Memory[]);
          });
      });

    const channel = supabase
      .channel(`duo:${duoMapId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "memories" },
        (payload) => store.addMemory(payload.new as Memory)
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reactions" },
        (payload) => store.addReaction(payload.new as Reaction)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "reactions" },
        (payload) => store.addReaction(payload.new as Reaction)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "reactions" },
        (payload) =>
          store.removeReaction(
            payload.old.memory_id as string,
            payload.old.user_id as string
          )
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ user_id: string }>();
        const partnerOnline = Object.values(state)
          .flat()
          .some((p) => (p as { user_id: string }).user_id !== user.id);
        store.setPartnerOnline(partnerOnline);
      })
      .on("presence", { event: "leave" }, () => {
        const state = channel.presenceState<{ user_id: string }>();
        const partnerOnline = Object.values(state)
          .flat()
          .some((p) => (p as { user_id: string }).user_id !== user.id);
        store.setPartnerOnline(partnerOnline);
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
      store.setPartnerOnline(false);
    };
  }, [duoMapId, user?.id]);
}
