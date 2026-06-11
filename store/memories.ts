import { create } from "zustand";

export type MoodTag = "happy" | "nostalgic" | "excited" | "peaceful" | "sad";

export interface Memory {
  id: string;
  user_id: string;
  image_url: string;
  latitude: number;
  longitude: number;
  caption: string | null;
  mood_tag: MoodTag | null;
  is_public: boolean;
  created_at: string;
}

interface MemoriesState {
  memories: Memory[];
  isLoading: boolean;
  setMemories: (memories: Memory[]) => void;
  addMemory: (memory: Memory) => void;
  removeMemory: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useMemoriesStore = create<MemoriesState>((set) => ({
  memories: [],
  isLoading: false,
  setMemories: (memories) => set({ memories }),
  addMemory: (memory) => set((s) => ({ memories: [memory, ...s.memories] })),
  removeMemory: (id) => set((s) => ({ memories: s.memories.filter((m) => m.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
}));
