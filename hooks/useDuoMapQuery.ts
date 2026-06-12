import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import type { DuoMap, DuoMember } from "@/store/duoMap";
import type { Memory } from "@/store/memories";

export const duoMapQueryKey = (userId: string | undefined) =>
  ["duoMap", userId] as const;

export const duoMemoriesQueryKey = (duoMapId: string | undefined) =>
  ["duoMemories", duoMapId] as const;

export function useDuoMapQuery() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: duoMapQueryKey(user?.id),
    queryFn: async () => {
      const { data } = await supabase
        .from("duo_map_members")
        .select("duo_map_id, duo_maps(id, invite_code, created_at)")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!data?.duo_maps) return { duoMap: null as DuoMap | null, members: [] as DuoMember[] };

      const dm = (Array.isArray(data.duo_maps) ? data.duo_maps[0] : data.duo_maps) as DuoMap;

      const { data: rawMembers } = await supabase
        .from("duo_map_members")
        .select("id, duo_map_id, user_id, joined_at")
        .eq("duo_map_id", data.duo_map_id);

      const memberIds = (rawMembers ?? []).map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", memberIds);

      const members: DuoMember[] = (rawMembers ?? []).map((m) => ({
        ...m,
        profile: profiles?.find((p) => p.id === m.user_id) ?? null,
      }));

      return { duoMap: dm, members };
    },
    enabled: !!user,
  });
}

export function useDuoMemoriesQuery(duoMapId: string | undefined) {
  return useQuery({
    queryKey: duoMemoriesQueryKey(duoMapId),
    queryFn: async () => {
      const { data: membersData } = await supabase
        .from("duo_map_members")
        .select("user_id")
        .eq("duo_map_id", duoMapId!);

      if (!membersData?.length) return [] as Memory[];

      const ids = membersData.map((m) => m.user_id);
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .in("user_id", ids)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Memory[];
    },
    enabled: !!duoMapId,
  });
}
