import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { convertImagesToPDF, sharePDFFile, savePDFFile } from "@/lib/pdf-converter";

export default function ResultScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileSize, setFileSize] = useState(0);
  const [images, setImages] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // تحميل البيانات وتحويل الصور إلى PDF
  useEffect(() => {
    loadAndConvert();
  }, []);

  const loadAndConvert = async () => {
    try {
      setLoading(true);

      // تحميل البيانات
      if (params.images) {
        const imgList = JSON.parse(params.images as string);
        setImages(imgList);
      }

      if (params.settings) {
        const settingsData = JSON.parse(params.settings as string);
        setSettings(settingsData);
      }

      // تحويل الصور إلى PDF
      if (params.images) {
        const imgList = JSON.parse(params.images as string);
        const settingsData = params.settings ? JSON.parse(params.settings as string) : {};

        const fileName = `PDF-${Date.now()}.pdf`;
        const path = await convertImagesToPDF(imgList, settingsData, fileName);

        setPdfPath(path);

        // الحصول على حجم الملف
        const fileInfo = await import("expo-file-system/legacy").then((fs) =>
          fs.getInfoAsync(path)
        );
        if (fileInfo.exists && fileInfo.size) {
          setFileSize(fileInfo.size);
        }
      }
    } catch (error) {
      console.error("خطأ في تحويل الصور:", error);
      Alert.alert("خطأ", "فشل تحويل الصور إلى PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!pdfPath) {
      Alert.alert("خطأ", "لم يتم إنشاء الملف بعد");
      return;
    }

    try {
      await sharePDFFile(pdfPath);
    } catch (error) {
      Alert.alert("خطأ", "فشل مشاركة الملف");
    }
  };

  const handleSave = async () => {
    if (!pdfPath) {
      Alert.alert("خطأ", "لم يتم إنشاء الملف بعد");
      return;
    }

    try {
      await savePDFFile(pdfPath);
    } catch (error) {
      Alert.alert("خطأ", "فشل حفظ الملف");
    }
  };

  const handleNewProject = () => {
    router.replace("/(tabs)");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <View className="gap-4 items-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-foreground text-lg">جاري تحويل الصور إلى PDF...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!pdfPath) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <View className="gap-4 items-center">
          <Text className="text-foreground text-lg">فشل تحويل الصور</Text>
          <Pressable
            onPress={loadAndConvert}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="bg-primary py-3 px-6 rounded-lg"
          >
            <Text className="text-background font-semibold">إعادة محاولة</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          {/* Success Icon */}
          <View className="items-center gap-4">
            <View className="w-20 h-20 bg-success rounded-full items-center justify-center">
              <Text className="text-4xl">✓</Text>
            </View>
            <Text className="text-3xl font-bold text-foreground text-center">تم بنجاح!</Text>
            <Text className="text-base text-muted text-center">
              تم تحويل الصور إلى ملف PDF بنجاح
            </Text>
          </View>

          {/* File Info */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground font-semibold">اسم الملف</Text>
              <Text className="text-muted text-sm">{pdfPath?.split("/").pop()}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground font-semibold">حجم الملف</Text>
              <Text className="text-muted text-sm">{formatFileSize(fileSize)}</Text>
            </View>
            {images.length > 0 && (
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground font-semibold">عدد الصور</Text>
                <Text className="text-muted text-sm">{images.length}</Text>
              </View>
            )}
            {settings && (
              <>
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground font-semibold">حجم الصفحة</Text>
                  <Text className="text-muted text-sm">{settings.pageSize}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground font-semibold">الاتجاه</Text>
                  <Text className="text-muted text-sm">
                    {settings.orientation === "portrait" ? "عمودي" : "أفقي"}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-primary py-4 px-6 rounded-xl flex-row items-center justify-center gap-2"
            >
              <IconSymbol name="paperplane.fill" size={20} color={colors.background} />
              <Text className="text-background font-semibold text-lg">مشاركة الملف</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-surface py-4 px-6 rounded-xl flex-row items-center justify-center gap-2 border border-border"
            >
              <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
              <Text className="text-foreground font-semibold text-lg">حفظ الملف</Text>
            </Pressable>

            <Pressable
              onPress={handleNewProject}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-surface py-4 px-6 rounded-xl flex-row items-center justify-center gap-2 border border-border"
            >
              <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
              <Text className="text-foreground font-semibold text-lg">مشروع جديد</Text>
            </Pressable>
          </View>

          {/* Tips */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-2">
            <Text className="text-foreground font-semibold">نصائح مفيدة:</Text>
            <Text className="text-sm text-muted">• يمكنك مشاركة الملف عبر البريد الإلكتروني أو تطبيقات أخرى</Text>
            <Text className="text-sm text-muted">• الملف محفوظ على جهازك ويمكنك الوصول إليه لاحقاً</Text>
            <Text className="text-sm text-muted">• يمكنك إنشاء مشاريع جديدة في أي وقت</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
