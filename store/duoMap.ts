import { create } from "zustand";

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

interface DuoRealtimeState {
  partnerOnline: boolean;
  setPartnerOnline: (online: boolean) => void;
  reset: () => void;
}

// Zustand chỉ giữ real-time presence state; server data được quản lý bởi React Query
export const useDuoMapStore = create<DuoRealtimeState>((set) => ({
  partnerOnline: false,
  setPartnerOnline: (partnerOnline) => set({ partnerOnline }),
  reset: () => set({ partnerOnline: false }),
}));
