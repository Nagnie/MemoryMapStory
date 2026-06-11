import { create } from "zustand";
import type { Memory } from "./memories";

export interface DuoMap {
  id: string;
  invite_code: string;
  created_at: string;
}

export interface DuoMember {
  id: string;
  duo_map_id: string;
  user_id: string;
  joined_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface Reaction {
  id: string;
  memory_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

interface DuoMapState {
  duoMap: DuoMap | null;
  members: DuoMember[];
  memories: Memory[];
  reactions: Record<string, Reaction[]>;
  partnerOnline: boolean;
  isLoading: boolean;
  setDuoMap: (duoMap: DuoMap | null) => void;
  setMembers: (members: DuoMember[]) => void;
  setMemories: (memories: Memory[]) => void;
  addMemory: (memory: Memory) => void;
  setReactions: (memoryId: string, reactions: Reaction[]) => void;
  addReaction: (reaction: Reaction) => void;
  removeReaction: (memoryId: string, userId: string) => void;
  setPartnerOnline: (online: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useDuoMapStore = create<DuoMapState>((set) => ({
  duoMap: null,
  members: [],
  memories: [],
  reactions: {},
  partnerOnline: false,
  isLoading: false,
  setDuoMap: (duoMap) => set({ duoMap }),
  setMembers: (members) => set({ members }),
  setMemories: (memories) => set({ memories }),
  addMemory: (memory) =>
    set((s) => {
      if (s.memories.some((m) => m.id === memory.id)) return s;
      return { memories: [memory, ...s.memories] };
    }),
  setReactions: (memoryId, reactions) =>
    set((s) => ({ reactions: { ...s.reactions, [memoryId]: reactions } })),
  addReaction: (reaction) =>
    set((s) => {
      const existing = s.reactions[reaction.memory_id] ?? [];
      const filtered = existing.filter((r) => r.user_id !== reaction.user_id);
      return {
        reactions: {
          ...s.reactions,
          [reaction.memory_id]: [...filtered, reaction],
        },
      };
    }),
  removeReaction: (memoryId, userId) =>
    set((s) => ({
      reactions: {
        ...s.reactions,
        [memoryId]: (s.reactions[memoryId] ?? []).filter(
          (r) => r.user_id !== userId
        ),
      },
    })),
  setPartnerOnline: (partnerOnline) => set({ partnerOnline }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({ duoMap: null, members: [], memories: [], reactions: {}, partnerOnline: false }),
}));
