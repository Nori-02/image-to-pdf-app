import { ScrollView, Text, View, Pressable, Image } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface EditableImage {
  uri: string;
  rotation: number;
  brightness: number;
  contrast: number;
}

export default function ImageEditorScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editableImages, setEditableImages] = useState<EditableImage[]>([]);

  // تحميل الصور من المعاملات
  useEffect(() => {
    if (params.images) {
      try {
        const images = JSON.parse(params.images as string);
        const editableImgs = images.map((img: any) => ({
          uri: img.uri,
          rotation: 0,
          brightness: 100,
          contrast: 100,
        }));
        setEditableImages(editableImgs);
      } catch (error) {
        console.error("خطأ في تحميل الصور:", error);
      }
    }
  }, [params.images]);

  // إذا لم تكن هناك صور، عرض صورة افتراضية
  if (editableImages.length === 0) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <Text className="text-foreground text-lg">جاري تحميل الصور...</Text>
      </ScreenContainer>
    );
  }

  const currentImage = editableImages[currentImageIndex];

  const updateImage = (updates: Partial<EditableImage>) => {
    const newImages = [...editableImages];
    newImages[currentImageIndex] = { ...currentImage, ...updates };
    setEditableImages(newImages);
  };

  const rotateImage = () => {
    const newRotation = (currentImage.rotation + 90) % 360;
    updateImage({ rotation: newRotation });
  };

  const resetImage = () => {
    updateImage({
      rotation: 0,
      brightness: 100,
      contrast: 100,
    });
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">تعديل الصور</Text>
            <Text className="text-base text-muted">
              الصورة {currentImageIndex + 1} من {editableImages.length}
            </Text>
          </View>

          {/* Image Preview */}
          <View className="bg-surface rounded-xl p-4 border border-border items-center justify-center h-64">
            <Image
              source={{ uri: currentImage.uri }}
              style={{
                width: "100%",
                height: "100%",
                transform: [{ rotate: `${currentImage.rotation}deg` }],
                opacity: currentImage.brightness / 100,
              }}
              className="rounded-lg"
            />
          </View>

          {/* Navigation */}
          {editableImages.length > 1 && (
            <View className="flex-row gap-3 justify-between">
              <Pressable
                onPress={() =>
                  setCurrentImageIndex(Math.max(0, currentImageIndex - 1))
                }
                disabled={currentImageIndex === 0}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="flex-1 bg-surface py-3 rounded-lg border border-border items-center"
              >
                <Text className="text-foreground font-semibold">السابق</Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  setCurrentImageIndex(
                    Math.min(editableImages.length - 1, currentImageIndex + 1)
                  )
                }
                disabled={currentImageIndex === editableImages.length - 1}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="flex-1 bg-surface py-3 rounded-lg border border-border items-center"
              >
                <Text className="text-foreground font-semibold">التالي</Text>
              </Pressable>
            </View>
          )}

          {/* Edit Controls */}
          <View className="gap-4">
            <Text className="text-lg font-semibold text-foreground">أدوات التعديل</Text>

            {/* Rotation */}
            <View className="bg-surface rounded-xl p-4 border border-border gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground font-semibold">التدوير</Text>
                <Text className="text-muted">{currentImage.rotation}°</Text>
              </View>
              <Pressable
                onPress={rotateImage}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-primary py-2 rounded-lg items-center"
              >
                <Text className="text-background font-semibold">تدوير 90°</Text>
              </Pressable>
            </View>

            {/* Brightness */}
            <View className="bg-surface rounded-xl p-4 border border-border gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground font-semibold">السطوع</Text>
                <Text className="text-muted">{currentImage.brightness}%</Text>
              </View>
              <View className="flex-row gap-2 items-center">
              <Pressable
                onPress={() =>
                  updateImage({
                    brightness: Math.max(0, currentImage.brightness - 10),
                  })
                }
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-surface border border-border p-2 rounded-lg w-10 h-10 items-center justify-center"
              >
                <Text className="text-foreground font-bold text-lg">−</Text>
              </Pressable>
                <View className="flex-1 h-1 bg-border rounded-full" />
                <Pressable
                  onPress={() =>
                    updateImage({
                      brightness: Math.min(200, currentImage.brightness + 10),
                    })
                  }
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className="bg-surface border border-border p-2 rounded-lg w-10 h-10 items-center justify-center"
                >
                  <Text className="text-foreground font-bold text-lg">+</Text>
                </Pressable>
              </View>
            </View>

            {/* Contrast */}
            <View className="bg-surface rounded-xl p-4 border border-border gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground font-semibold">التباين</Text>
                <Text className="text-muted">{currentImage.contrast}%</Text>
              </View>
              <View className="flex-row gap-2 items-center">
                <Pressable
                  onPress={() =>
                    updateImage({
                      contrast: Math.max(0, currentImage.contrast - 10),
                    })
                  }
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className="bg-surface border border-border p-2 rounded-lg w-10 h-10 items-center justify-center"
                >
                  <Text className="text-foreground font-bold text-lg">−</Text>
                </Pressable>
                <View className="flex-1 h-1 bg-border rounded-full" />
                <Pressable
                  onPress={() =>
                    updateImage({
                      contrast: Math.min(200, currentImage.contrast + 10),
                    })
                  }
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className="bg-surface border border-border p-2 rounded-lg w-10 h-10 items-center justify-center"
                >
                  <Text className="text-foreground font-bold text-lg">+</Text>
                </Pressable>
              </View>
            </View>

            {/* Reset Button */}
            <Pressable
              onPress={resetImage}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-surface py-3 rounded-lg border border-border items-center"
            >
              <Text className="text-foreground font-semibold">إعادة تعيين</Text>
            </Pressable>
          </View>

          {/* Action Buttons */}
          <View className="gap-3 mt-4 flex-row">
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, flex: 1 }]}
              className="bg-surface py-4 rounded-xl border border-border items-center"
            >
              <Text className="text-foreground font-semibold text-lg">رجوع</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                // الانتقال إلى شاشة إعدادات PDF
                router.push({
                  pathname: "/pdf-settings-screen",
                  params: {
                    images: JSON.stringify(editableImages),
                  },
                });
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, flex: 1 }]}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-background font-semibold text-lg">التالي</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
