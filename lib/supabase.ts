import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

// SecureStore has a 2048-char limit per key on iOS, so we chunk large values
const CHUNK_SIZE = 1800;
const CHUNK_MARKER = "__chunks__";

const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    const value = await SecureStore.getItemAsync(key);
    if (!value) return null;
    if (!value.startsWith(CHUNK_MARKER)) return value;

    const count = parseInt(value.slice(CHUNK_MARKER.length));
    const chunks = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        SecureStore.getItemAsync(`${key}_${i}`)
      )
    );
    return chunks.every(Boolean) ? chunks.join("") : null;
  },

  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(key, `${CHUNK_MARKER}${chunks.length}`);
    await Promise.all(
      chunks.map((chunk, i) => SecureStore.setItemAsync(`${key}_${i}`, chunk))
    );
  },

  async removeItem(key: string): Promise<void> {
    const value = await SecureStore.getItemAsync(key);
    if (value?.startsWith(CHUNK_MARKER)) {
      const count = parseInt(value.slice(CHUNK_MARKER.length));
      await Promise.all(
        Array.from({ length: count }, (_, i) =>
          SecureStore.deleteItemAsync(`${key}_${i}`)
        )
      );
    }
    await SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
