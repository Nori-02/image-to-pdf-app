import { ScrollView, Text, View, Pressable, TextInput, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface PDFSettings {
  pageSize: "A4" | "Letter" | "A3";
  orientation: "portrait" | "landscape";
  quality: number;
  compression: boolean;
  watermark: boolean;
  watermarkText: string;
}

export default function PDFSettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const [images, setImages] = useState<any[]>([]);
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PDFSettings>({
    pageSize: "A4",
    orientation: "portrait",
    quality: 100,
    compression: true,
    watermark: false,
    watermarkText: "",
  });

  // تحميل الصور وملفات PDF من المعاملات
  useEffect(() => {
    if (params.images) {
      try {
        const imgList = JSON.parse(params.images as string);
        setImages(imgList);
      } catch (error) {
        console.error("خطأ في تحميل الصور:", error);
      }
    }

    if (params.pdfs) {
      try {
        const pdfList = JSON.parse(params.pdfs as string);
        setPdfs(pdfList);
      } catch (error) {
        console.error("خطأ في تحميل ملفات PDF:", error);
      }
    }
  }, [params.images, params.pdfs]);

  const updateSetting = (key: keyof PDFSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleConvert = async () => {
    try {
      setLoading(true);

      if (images.length === 0 && pdfs.length === 0) {
        Alert.alert("تنبيه", "لا توجد صور أو ملفات PDF لتحويلها");
        return;
      }

      // هنا يتم استدعاء دالة تحويل الصور إلى PDF
      // سيتم تطبيقها في الخطوة التالية
      router.push({
        pathname: "/result-screen",
        params: {
          images: JSON.stringify(images),
          pdfs: pdfs.length > 0 ? JSON.stringify(pdfs) : undefined,
          settings: JSON.stringify(settings),
        },
      });
    } catch (error) {
      Alert.alert("خطأ", "فشل تحويل الصور إلى PDF");
      console.error(error);
    } finally {
      setLoading(false);
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
            <Text className="text-3xl font-bold text-foreground">إعدادات PDF</Text>
            <Text className="text-base text-muted">خصص إعدادات ملف PDF</Text>
          </View>

          {/* Summary */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-2">
            <Text className="text-foreground font-semibold">الملفات المختارة:</Text>
            <Text className="text-muted">• صور: {images.length}</Text>
            {pdfs.length > 0 && <Text className="text-muted">• ملفات PDF: {pdfs.length}</Text>}
          </View>

          {/* Page Size */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">حجم الصفحة</Text>
            <View className="gap-2">
              {(["A4", "Letter", "A3"] as const).map((size) => (
                <Pressable
                  key={size}
                  onPress={() => updateSetting("pageSize", size)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className={`p-4 rounded-xl border ${
                    settings.pageSize === size
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={
                      settings.pageSize === size
                        ? "text-background font-semibold"
                        : "text-foreground font-semibold"
                    }
                  >
                    {size}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Orientation */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">اتجاه الصفحة</Text>
            <View className="flex-row gap-3">
              {(["portrait", "landscape"] as const).map((orientation) => (
                <Pressable
                  key={orientation}
                  onPress={() => updateSetting("orientation", orientation)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, flex: 1 }]}
                  className={`p-4 rounded-xl border ${
                    settings.orientation === orientation
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={
                      settings.orientation === orientation
                        ? "text-background font-semibold text-center"
                        : "text-foreground font-semibold text-center"
                    }
                  >
                    {orientation === "portrait" ? "عمودي" : "أفقي"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Quality */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">جودة الصور</Text>
              <Text className="text-muted">{settings.quality}%</Text>
            </View>
            <View className="flex-row gap-2 items-center">
              <Pressable
                onPress={() => updateSetting("quality", Math.max(10, settings.quality - 10))}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-surface border border-border p-2 rounded-lg w-10 h-10 items-center justify-center"
              >
                <Text className="text-foreground font-bold">−</Text>
              </Pressable>
              <View className="flex-1 h-1 bg-border rounded-full" />
              <Pressable
                onPress={() => updateSetting("quality", Math.min(100, settings.quality + 10))}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-surface border border-border p-2 rounded-lg w-10 h-10 items-center justify-center"
              >
                <Text className="text-foreground font-bold">+</Text>
              </Pressable>
            </View>
          </View>

          {/* Compression */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">ضغط الملف</Text>
              <Pressable
                onPress={() => updateSetting("compression", !settings.compression)}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className={`w-12 h-7 rounded-full items-center justify-center ${
                  settings.compression ? "bg-primary" : "bg-surface border border-border"
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full ${
                    settings.compression ? "bg-background" : "bg-foreground"
                  } ${settings.compression ? "ml-1" : "mr-1"}`}
                />
              </Pressable>
            </View>
          </View>

          {/* Watermark */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">علامة مائية</Text>
              <Pressable
                onPress={() => updateSetting("watermark", !settings.watermark)}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className={`w-12 h-7 rounded-full items-center justify-center ${
                  settings.watermark ? "bg-primary" : "bg-surface border border-border"
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full ${
                    settings.watermark ? "bg-background" : "bg-foreground"
                  } ${settings.watermark ? "ml-1" : "mr-1"}`}
                />
              </Pressable>
            </View>

            {settings.watermark && (
              <TextInput
                placeholder="أدخل نص العلامة المائية"
                placeholderTextColor={colors.muted}
                value={settings.watermarkText}
                onChangeText={(text) => updateSetting("watermarkText", text)}
                style={{
                  borderColor: colors.border,
                  color: colors.foreground,
                  backgroundColor: colors.surface,
                }}
                className="border border-border rounded-lg p-3 text-foreground"
              />
            )}
          </View>

          {/* Action Buttons */}
          <View className="gap-3 flex-row">
            <Pressable
              onPress={handleBack}
              disabled={loading}
              style={({ pressed }) => [{ opacity: pressed || loading ? 0.8 : 1, flex: 1 }]}
              className="bg-surface py-4 rounded-xl border border-border items-center"
            >
              <Text className="text-foreground font-semibold text-lg">رجوع</Text>
            </Pressable>

            <Pressable
              onPress={handleConvert}
              disabled={loading}
              style={({ pressed }) => [{ opacity: pressed || loading ? 0.8 : 1, flex: 1 }]}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-background font-semibold text-lg">
                {loading ? "جاري التحويل..." : "تحويل إلى PDF"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
