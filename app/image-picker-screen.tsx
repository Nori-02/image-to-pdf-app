import { ScrollView, Text, View, Pressable, FlatList, Image } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface SelectedImage {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export default function ImagePickerScreen() {
  const router = useRouter();
  const colors = useColors();
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    } as any);

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || `image-${Date.now()}`,
        type: asset.type || "image/jpeg",
        size: asset.fileSize || 0,
      }));
      setSelectedImages([...selectedImages, ...newImages]);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0] as any;
      const newImage: SelectedImage = {
        uri: asset.uri,
        name: asset.fileName || `photo-${Date.now()}`,
        type: asset.type || "image/jpeg",
        size: asset.fileSize || 0,
      };
      setSelectedImages([...selectedImages, newImage]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (selectedImages.length > 0) {
      // Navigate to next screen for image editing
      console.log("Proceeding with", selectedImages.length, "images");
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">اختر الصور</Text>
            <Text className="text-base text-muted">اختر صور متعددة لتحويلها إلى PDF</Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={pickImages}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-primary py-4 px-6 rounded-xl flex-row items-center justify-between"
            >
              <Text className="text-background font-semibold text-lg">اختر من المعرض</Text>
              <IconSymbol name="paperplane.fill" size={24} color={colors.background} />
            </Pressable>

            <Pressable
              onPress={takePhoto}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-surface py-4 px-6 rounded-xl flex-row items-center justify-between border border-border"
            >
              <Text className="text-foreground font-semibold text-lg">التقاط صورة</Text>
              <IconSymbol name="paperplane.fill" size={24} color={colors.primary} />
            </Pressable>
          </View>

          {/* Selected Images */}
          {selectedImages.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-foreground">
                  الصور المختارة ({selectedImages.length})
                </Text>
              </View>

              <FlatList
                data={selectedImages}
                keyExtractor={(_, index) => index.toString()}
                scrollEnabled={false}
                numColumns={2}
                columnWrapperStyle={{ gap: 12 }}
                renderItem={({ item, index }) => (
                  <View className="flex-1 relative">
                    <Image
                      source={{ uri: item.uri }}
                      style={{ width: "100%", height: 150 }}
                      className="rounded-lg"
                    />
                    <Pressable
                      onPress={() => removeImage(index)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                      className="absolute top-2 right-2 bg-error rounded-full p-2"
                    >
                      <IconSymbol name="chevron.left.forwardslash.chevron.right" size={16} color={colors.background} />
                    </Pressable>
                    <Text className="text-xs text-muted mt-2">{item.name}</Text>
                  </View>
                )}
              />
            </View>
          )}

          {/* Next Button */}
          {selectedImages.length > 0 && (
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-primary py-4 rounded-xl items-center mt-4"
            >
              <Text className="text-background font-semibold text-lg">التالي</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
