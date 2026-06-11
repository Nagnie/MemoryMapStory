import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { uploadMemoryImage } from "@/lib/storage";
import { getCurrentLocation } from "@/lib/location";
import { useAuthStore } from "@/store/auth";
import { useMemoriesStore, MoodTag, Memory } from "@/store/memories";
import { MoodTagPicker } from "@/components/memory/MoodTagPicker";
import { useTheme } from "@/hooks/useTheme";

export default function CreateMemoryScreen() {
  const t = useTheme();
  const { user } = useAuthStore();
  const { addMemory } = useMemoriesStore();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [mood, setMood] = useState<MoodTag | null>(null);
  const [uploading, setUploading] = useState(false);

  async function openCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow camera access in Settings.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function openGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function handleSave() {
    if (!imageUri || !user) return;
    setUploading(true);
    try {
      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert("Location error", "Could not get your location. Enable location services and try again.");
        setUploading(false);
        return;
      }

      const imageUrl = await uploadMemoryImage(imageUri, user.id);

      const { data, error } = await supabase
        .from("memories")
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          caption: caption.trim() || null,
          mood_tag: mood,
        })
        .select()
        .single();

      if (error) throw error;

      addMemory(data as Memory);
      router.back();
    } catch (e) {
      console.error("[create memory]", e);
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to save memory. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const s = createStyles(t);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: t.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.flex}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.headerBtn} hitSlop={8}>
            <Ionicons name="close" size={24} color={t.text} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: t.text }]}>New Memory</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image area */}
          {imageUri ? (
            <View style={s.previewWrap}>
              <Image source={{ uri: imageUri }} style={s.preview} resizeMode="cover" />
              <TouchableOpacity style={s.changePhotoBtn} onPress={openGallery}>
                <Ionicons name="images-outline" size={15} color="#fff" />
                <Text style={s.changePhotoText}>Change photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[s.picker, { backgroundColor: t.surface, borderColor: t.border }]}>
              <Ionicons name="image-outline" size={48} color={t.textFaint} />
              <Text style={[s.pickerHint, { color: t.textMuted }]}>Add a photo to this memory</Text>
              <View style={s.pickerBtns}>
                <TouchableOpacity
                  style={[s.pickerBtn, { backgroundColor: t.primary }]}
                  onPress={openCamera}
                >
                  <Ionicons name="camera-outline" size={20} color="#fff" />
                  <Text style={s.pickerBtnText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.pickerBtn, { backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }]}
                  onPress={openGallery}
                >
                  <Ionicons name="images-outline" size={20} color={t.text} />
                  <Text style={[s.pickerBtnText, { color: t.text }]}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Form */}
          <View style={s.form}>
            {/* Caption */}
            <View style={[s.inputWrap, { backgroundColor: t.surface, borderColor: t.border }]}>
              <TextInput
                style={[s.input, { color: t.text }]}
                placeholder="Add a caption..."
                placeholderTextColor={t.textMuted}
                value={caption}
                onChangeText={setCaption}
                multiline
                maxLength={200}
              />
            </View>

            {/* Mood */}
            <Text style={[s.sectionLabel, { color: t.textSecondary }]}>How are you feeling?</Text>
            <MoodTagPicker selected={mood} onSelect={setMood} />

            {/* Location note */}
            <View style={s.locationNote}>
              <Ionicons name="location-outline" size={13} color={t.textMuted} />
              <Text style={[s.locationText, { color: t.textMuted }]}>
                GPS location captured automatically
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Save button */}
        <View style={[s.footer, { borderTopColor: t.border, backgroundColor: t.background }]}>
          <TouchableOpacity
            style={[s.saveBtn, { backgroundColor: imageUri && !uploading ? t.primary : t.border }]}
            onPress={handleSave}
            disabled={!imageUri || uploading}
            activeOpacity={0.85}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="bookmark-outline" size={18} color="#fff" />
                <Text style={s.saveBtnText}>Save Memory</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(t: { [key: string]: string }) {
  return StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerBtn: {
      width: 40, height: 40, borderRadius: 20,
      alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontSize: 16, fontWeight: "700" },
    scroll: { paddingBottom: 24 },
    previewWrap: { position: "relative", marginHorizontal: 16, borderRadius: 20, overflow: "hidden" },
    preview: { width: "100%", height: 340, borderRadius: 20 },
    changePhotoBtn: {
      position: "absolute", bottom: 12, right: 12,
      flexDirection: "row", alignItems: "center", gap: 5,
      backgroundColor: "rgba(0,0,0,0.5)",
      paddingHorizontal: 12, paddingVertical: 7,
      borderRadius: 20,
    },
    changePhotoText: { color: "#fff", fontSize: 12.5, fontWeight: "600" },
    picker: {
      marginHorizontal: 16,
      height: 220,
      borderRadius: 20,
      borderWidth: 1.5,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    pickerHint: { fontSize: 14 },
    pickerBtns: { flexDirection: "row", gap: 12, marginTop: 4 },
    pickerBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      paddingHorizontal: 20,
      paddingVertical: 11,
      borderRadius: 14,
    },
    pickerBtnText: { color: "#fff", fontSize: 14.5, fontWeight: "700" },
    form: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },
    inputWrap: {
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 80,
    },
    input: { fontSize: 15, lineHeight: 22 },
    sectionLabel: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
    locationNote: {
      flexDirection: "row", alignItems: "center", gap: 6,
      paddingTop: 4,
    },
    locationText: { fontSize: 12.5 },
    footer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 0.5,
    },
    saveBtn: {
      height: 52,
      borderRadius: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  });
}
