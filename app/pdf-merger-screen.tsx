import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator, FlatList } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { PDFMerger } from "@/lib/pdf-merger";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";

interface PDFFile {
  id: string;
  name: string;
  uri: string;
  size: number;
  pages?: number;
}

export default function PDFMergerScreen() {
  const router = useRouter();
  const colors = useColors();
  const [selectedPDFs, setSelectedPDFs] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [mergedPDFPath, setMergedPDFPath] = useState<string | null>(null);

  const handleSelectPDFs = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: true,
      });

      if (result.assets) {
        const newPDFs = result.assets.map((asset: any, index: number) => ({
          id: `pdf_${Date.now()}_${index}`,
          name: asset.name,
          uri: asset.uri,
          size: asset.size || 0,
        }));

        setSelectedPDFs([...selectedPDFs, ...newPDFs]);
      }
    } catch (error) {
      Alert.alert("خطأ", "فشل اختيار ملفات PDF");
      console.error(error);
    }
  };

  const handleRemovePDF = (id: string) => {
    setSelectedPDFs(selectedPDFs.filter((pdf) => pdf.id !== id));
  };

  const handleMovePDF = (fromIndex: number, toIndex: number) => {
    const newPDFs = [...selectedPDFs];
    const [removed] = newPDFs.splice(fromIndex, 1);
    newPDFs.splice(toIndex, 0, removed);
    setSelectedPDFs(newPDFs);
  };

  const handleMergePDFs = async () => {
    if (selectedPDFs.length < 2) {
      Alert.alert("خطأ", "يجب اختيار ملفي PDF على الأقل");
      return;
    }

    try {
      setLoading(true);
      const pdfPaths = selectedPDFs.map((pdf) => pdf.uri);
      const mergedPath = await PDFMerger.mergePDFs(pdfPaths, {
        outputFileName: `merged_${Date.now()}.pdf`,
      });

      setMergedPDFPath(mergedPath);
      Alert.alert("نجح", "تم دمج ملفات PDF بنجاح");
    } catch (error) {
      Alert.alert("خطأ", "فشل دمج ملفات PDF");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareMergedPDF = async () => {
    if (!mergedPDFPath) {
      Alert.alert("خطأ", "لا يوجد ملف مدمج");
      return;
    }

    try {
      await Sharing.shareAsync(mergedPDFPath);
    } catch (error) {
      Alert.alert("خطأ", "فشل مشاركة الملف");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">دمج ملفات PDF</Text>
            <Text className="text-base text-muted">دمج عدة ملفات PDF في ملف واحد</Text>
          </View>

          {!mergedPDFPath ? (
            <>
              {/* Select PDFs Button */}
              <Pressable
                onPress={handleSelectPDFs}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-primary py-4 px-6 rounded-xl flex-row items-center justify-center gap-2"
              >
                <IconSymbol name="paperplane.fill" size={20} color={colors.background} />
                <Text className="text-background font-semibold text-lg">اختيار ملفات PDF</Text>
              </Pressable>

              {/* Selected PDFs List */}
              {selectedPDFs.length > 0 && (
                <View className="gap-3">
                  <Text className="text-foreground font-semibold">
                    الملفات المختارة ({selectedPDFs.length})
                  </Text>

                  {selectedPDFs.map((pdf, index) => (
                    <View
                      key={pdf.id}
                      className="bg-surface rounded-xl p-3 border border-border flex-row items-center justify-between gap-2"
                    >
                      <View className="flex-1 gap-1">
                        <Text className="text-foreground font-semibold text-sm">{pdf.name}</Text>
                        <Text className="text-muted text-xs">{formatFileSize(pdf.size)}</Text>
                      </View>

                      <View className="flex-row gap-2">
                        {index > 0 && (
                          <Pressable
                            onPress={() => handleMovePDF(index, index - 1)}
                            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                            className="p-2 bg-background rounded-lg"
                          >
                            <Text className="text-lg">⬆️</Text>
                          </Pressable>
                        )}

                        {index < selectedPDFs.length - 1 && (
                          <Pressable
                            onPress={() => handleMovePDF(index, index + 1)}
                            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                            className="p-2 bg-background rounded-lg"
                          >
                            <Text className="text-lg">⬇️</Text>
                          </Pressable>
                        )}

                        <Pressable
                          onPress={() => handleRemovePDF(pdf.id)}
                          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                          className="p-2 bg-error rounded-lg"
                        >
                          <Text className="text-lg">✕</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}

                  {/* Merge Button */}
                  <Pressable
                    onPress={handleMergePDFs}
                    disabled={loading || selectedPDFs.length < 2}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className={`py-4 px-6 rounded-xl flex-row items-center justify-center gap-2 ${
                      selectedPDFs.length < 2 ? "bg-muted opacity-50" : "bg-success"
                    }`}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.background} />
                    ) : (
                      <>
                        <IconSymbol name="paperplane.fill" size={20} color={colors.background} />
                        <Text className="text-background font-semibold text-lg">دمج الملفات</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              )}
            </>
          ) : (
            <View className="gap-4 items-center">
              <View className="w-20 h-20 bg-success rounded-full items-center justify-center">
                <Text className="text-4xl">✓</Text>
              </View>
              <Text className="text-foreground font-semibold text-lg text-center">
                تم دمج الملفات بنجاح!
              </Text>

              <Pressable
                onPress={handleShareMergedPDF}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-primary py-3 px-6 rounded-lg flex-row items-center justify-center gap-2 w-full"
              >
                <IconSymbol name="paperplane.fill" size={18} color={colors.background} />
                <Text className="text-background font-semibold">مشاركة الملف</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setMergedPDFPath(null);
                  setSelectedPDFs([]);
                }}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-surface py-3 px-6 rounded-lg flex-row items-center justify-center gap-2 w-full border border-border"
              >
                <Text className="text-foreground font-semibold">دمج ملفات جديدة</Text>
              </Pressable>
            </View>
          )}

          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="bg-surface py-3 px-4 rounded-lg flex-row items-center justify-center gap-2 border border-border"
          >
            <Text className="text-foreground font-semibold">رجوع</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
