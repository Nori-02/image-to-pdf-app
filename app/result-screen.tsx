import { ScrollView, Text, View, Pressable, Share } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface PDFResult {
  fileName: string;
  fileSize: string;
  pageCount: number;
  createdAt: string;
  filePath: string;
}

export default function ResultScreen() {
  const colors = useColors();
  const [result] = useState<PDFResult>({
    fileName: "document.pdf",
    fileSize: "2.5 MB",
    pageCount: 5,
    createdAt: new Date().toLocaleDateString("ar-EG"),
    filePath: "/path/to/file.pdf",
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `تم إنشاء ملف PDF: ${result.fileName}`,
        url: result.filePath,
        title: result.fileName,
      });
    } catch (error) {
      console.error("خطأ في المشاركة:", error);
    }
  };

  const handleDownload = () => {
    console.log("تحميل الملف:", result.filePath);
  };

  const handleCreateNew = () => {
    console.log("إنشاء مشروع جديد");
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8 flex-1 justify-center">
          {/* Success Icon */}
          <View className="items-center gap-4">
            <View className="w-24 h-24 bg-success rounded-full items-center justify-center">
              <IconSymbol name="paperplane.fill" size={48} color={colors.background} />
            </View>
            <Text className="text-3xl font-bold text-foreground text-center">
              تم إنشاء الملف بنجاح!
            </Text>
            <Text className="text-base text-muted text-center">
              تم تحويل صورك إلى ملف PDF بنجاح
            </Text>
          </View>

          {/* File Details */}
          <View className="bg-surface rounded-xl p-6 border border-border gap-4">
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-muted">اسم الملف</Text>
                <Text className="text-foreground font-semibold">{result.fileName}</Text>
              </View>
              <View className="h-px bg-border" />
              <View className="flex-row items-center justify-between">
                <Text className="text-muted">حجم الملف</Text>
                <Text className="text-foreground font-semibold">{result.fileSize}</Text>
              </View>
              <View className="h-px bg-border" />
              <View className="flex-row items-center justify-between">
                <Text className="text-muted">عدد الصفحات</Text>
                <Text className="text-foreground font-semibold">{result.pageCount}</Text>
              </View>
              <View className="h-px bg-border" />
              <View className="flex-row items-center justify-between">
                <Text className="text-muted">تاريخ الإنشاء</Text>
                <Text className="text-foreground font-semibold">{result.createdAt}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-primary py-4 px-6 rounded-xl flex-row items-center justify-center gap-2"
            >
              <IconSymbol name="paperplane.fill" size={24} color={colors.background} />
              <Text className="text-background font-semibold text-lg">مشاركة الملف</Text>
            </Pressable>

            <Pressable
              onPress={handleDownload}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-surface py-4 px-6 rounded-xl border border-border flex-row items-center justify-center gap-2"
            >
              <IconSymbol name="chevron.right" size={24} color={colors.primary} />
              <Text className="text-foreground font-semibold text-lg">تحميل الملف</Text>
            </Pressable>

            <Pressable
              onPress={handleCreateNew}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-surface py-4 px-6 rounded-xl border border-border flex-row items-center justify-center gap-2"
            >
              <IconSymbol name="paperplane.fill" size={24} color={colors.primary} />
              <Text className="text-foreground font-semibold text-lg">إنشاء ملف جديد</Text>
            </Pressable>
          </View>

          {/* Tips */}
          <View className="bg-warning/10 rounded-xl p-4 border border-warning gap-2">
            <Text className="text-warning font-semibold">نصيحة</Text>
            <Text className="text-warning text-sm">
              يمكنك مشاركة الملف مباشرة عبر البريد الإلكتروني أو تطبيقات المراسلة
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
