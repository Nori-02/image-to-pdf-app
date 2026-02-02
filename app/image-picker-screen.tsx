import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, Image, FlatList, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
  mimeType?: string;
}

export default function ImagePickerScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      } as any);

      if (!result.canceled) {
        const newFiles = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `image-${Date.now()}`,
          type: "image",
          mimeType: "image/jpeg",
          size: asset.fileSize || 0,
        }));
        setSelectedFiles([...selectedFiles, ...newFiles]);
      }
    } catch (error) {
      Alert.alert("خطأ", "فشل تحميل الصور");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0] as any;
        const newFile: SelectedFile = {
          uri: asset.uri,
          name: asset.fileName || `photo-${Date.now()}`,
          type: "image",
          mimeType: "image/jpeg",
          size: asset.fileSize || 0,
        };
        setSelectedFiles([...selectedFiles, newFile]);
      }
    } catch (error) {
      Alert.alert("خطأ", "فشل التقاط الصورة");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pickPDFFiles = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: true,
      });

      if (!result.canceled) {
        const newFiles = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          type: "pdf",
          mimeType: "application/pdf",
          size: asset.size || 0,
        }));
        setSelectedFiles([...selectedFiles, ...newFiles]);
      }
    } catch (error) {
      Alert.alert("خطأ", "فشل تحميل ملفات PDF");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const moveFileUp = (index: number) => {
    if (index > 0) {
      const newFiles = [...selectedFiles];
      [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
      setSelectedFiles(newFiles);
    }
  };

  const moveFileDown = (index: number) => {
    if (index < selectedFiles.length - 1) {
      const newFiles = [...selectedFiles];
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      setSelectedFiles(newFiles);
    }
  };

  const handleNext = () => {
    if (selectedFiles.length === 0) {
      Alert.alert("تنبيه", "الرجاء اختيار صور أو ملفات على الأقل");
      return;
    }

    // فصل الصور عن ملفات PDF
    const images = selectedFiles.filter((f) => f.type === "image");
    const pdfs = selectedFiles.filter((f) => f.type === "pdf");

    // إذا كانت هناك صور، انتقل إلى محرر الصور
    if (images.length > 0) {
      router.push({
        pathname: "/image-editor-screen",
        params: {
          images: JSON.stringify(images),
          pdfs: pdfs.length > 0 ? JSON.stringify(pdfs) : undefined,
        },
      });
    } else if (pdfs.length > 0) {
      // إذا كانت هناك فقط ملفات PDF، انتقل مباشرة إلى إعدادات PDF
      router.push({
        pathname: "/pdf-settings-screen",
        params: {
          pdfs: JSON.stringify(pdfs),
        },
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">اختر الملفات</Text>
            <Text className="text-base text-muted">اختر صور أو ملفات PDF لتحويلها</Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={pickImages}
              disabled={loading}
              style={({ pressed }) => [
                {
                  opacity: pressed || loading ? 0.8 : 1,
                  transform: [{ scale: pressed || loading ? 0.98 : 1 }],
                },
              ]}
              className="bg-primary py-4 px-6 rounded-xl flex-row items-center justify-between"
            >
              <Text className="text-background font-semibold text-lg">اختر الصور</Text>
              <IconSymbol name="paperplane.fill" size={24} color={colors.background} />
            </Pressable>

            <Pressable
              onPress={takePhoto}
              disabled={loading}
              style={({ pressed }) => [
                {
                  opacity: pressed || loading ? 0.8 : 1,
                  transform: [{ scale: pressed || loading ? 0.98 : 1 }],
                },
              ]}
              className="bg-surface py-4 px-6 rounded-xl flex-row items-center justify-between border border-border"
            >
              <Text className="text-foreground font-semibold text-lg">التقاط صورة</Text>
              <IconSymbol name="paperplane.fill" size={24} color={colors.primary} />
            </Pressable>

            <Pressable
              onPress={pickPDFFiles}
              disabled={loading}
              style={({ pressed }) => [
                {
                  opacity: pressed || loading ? 0.8 : 1,
                  transform: [{ scale: pressed || loading ? 0.98 : 1 }],
                },
              ]}
              className="bg-surface py-4 px-6 rounded-xl flex-row items-center justify-between border border-border"
            >
              <Text className="text-foreground font-semibold text-lg">اختر ملفات PDF</Text>
              <IconSymbol name="paperplane.fill" size={24} color={colors.primary} />
            </Pressable>
          </View>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-foreground">
                  الملفات المختارة ({selectedFiles.length})
                </Text>
              </View>

              <FlatList
                data={selectedFiles}
                keyExtractor={(_, index) => index.toString()}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <View className="bg-surface rounded-lg p-3 border border-border mb-3 flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Text className="text-foreground font-semibold" numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text className="text-xs text-muted">
                        {item.type === "image" ? "صورة" : "ملف PDF"} • {(item.size / 1024).toFixed(2)} KB
                      </Text>
                    </View>

                    {item.type === "image" && (
                      <Image
                        source={{ uri: item.uri }}
                        style={{ width: 50, height: 50 }}
                        className="rounded-lg ml-3"
                      />
                    )}

                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => moveFileUp(index)}
                        disabled={index === 0}
                        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                        className="bg-primary rounded-lg p-2"
                      >
                        <Text className="text-background text-lg">↑</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => moveFileDown(index)}
                        disabled={index === selectedFiles.length - 1}
                        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                        className="bg-primary rounded-lg p-2"
                      >
                        <Text className="text-background text-lg">↓</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => removeFile(index)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                        className="bg-error rounded-lg p-2"
                      >
                        <Text className="text-background text-lg">✕</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              />
            </View>
          )}

          {/* Action Buttons */}
          <View className="gap-3 flex-row">
            <Pressable
              onPress={handleBack}
              disabled={loading}
              style={({ pressed }) => [
                {
                  opacity: pressed || loading ? 0.8 : 1,
                  flex: 1,
                },
              ]}
              className="bg-surface py-4 rounded-xl items-center border border-border"
            >
              <Text className="text-foreground font-semibold text-lg">رجوع</Text>
            </Pressable>

            {selectedFiles.length > 0 ? (
              <Pressable
                onPress={handleNext}
                disabled={loading}
                style={({ pressed }) => [
                  {
                    opacity: pressed || loading ? 0.8 : 1,
                    flex: 1,
                  },
                ]}
                className="bg-primary py-4 rounded-xl items-center"
              >
                <Text className="text-background font-semibold text-lg">
                  {loading ? "جاري التحميل..." : "التالي"}
                </Text>
              </Pressable>
            ) : (
              <View style={{ flex: 1 }} />
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
