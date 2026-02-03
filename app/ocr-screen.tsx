import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator, TextInput } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { OCRService } from "@/lib/ocr-service";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";

export default function OCRScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("ar");
  const [editedText, setEditedText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const imagePath = params.imagePath as string;

  const handleExtractText = async () => {
    if (!imagePath) {
      Alert.alert("خطأ", "لم يتم تحديد صورة");
      return;
    }

    try {
      setLoading(true);
      const result = await OCRService.extractTextFromImage(imagePath, language);
      setExtractedText(result.text);
      setEditedText(result.text);
    } catch (error) {
      Alert.alert("خطأ", "فشل استخراج النصوص من الصورة");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = async () => {
    try {
      const textToCopy = isEditing ? editedText : extractedText;
      await Clipboard.setStringAsync(textToCopy);
      Alert.alert("نجح", "تم نسخ النص إلى الحافظة");
    } catch (error) {
      Alert.alert("خطأ", "فشل نسخ النص");
    }
  };

  const handleShareText = async () => {
    try {
      const textToShare = isEditing ? editedText : extractedText;
      if (!textToShare) {
        Alert.alert("خطأ", "لا يوجد نص للمشاركة");
        return;
      }

      await Sharing.shareAsync("data:text/plain;base64," + Buffer.from(textToShare).toString("base64"), {
        mimeType: "text/plain",
        dialogTitle: "مشاركة النص",
      });
    } catch (error) {
      Alert.alert("خطأ", "فشل مشاركة النص");
    }
  };

  const handleSaveText = async () => {
    try {
      const textToSave = isEditing ? editedText : extractedText;
      if (!textToSave) {
        Alert.alert("خطأ", "لا يوجد نص للحفظ");
        return;
      }

      const fileName = `extracted_text_${Date.now()}.txt`;
      const filePath = await OCRService.saveExtractedText(textToSave, fileName);
      Alert.alert("نجح", `تم حفظ النص في: ${filePath}`);
    } catch (error) {
      Alert.alert("خطأ", "فشل حفظ النص");
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">استخراج النصوص</Text>
            <Text className="text-base text-muted">استخرج النصوص من الصور باستخدام تقنية OCR</Text>
          </View>

          {/* Language Selection */}
          <View className="gap-2">
            <Text className="text-foreground font-semibold">اللغة</Text>
            <View className="flex-row gap-2">
              {[
                { code: "ar", label: "العربية" },
                { code: "en", label: "English" },
              ].map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => setLanguage(lang.code)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    language === lang.code
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-center font-semibold ${
                      language === lang.code ? "text-background" : "text-foreground"
                    }`}
                  >
                    {lang.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Extract Button */}
          {!extractedText && (
            <Pressable
              onPress={handleExtractText}
              disabled={loading}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-primary py-4 px-6 rounded-xl flex-row items-center justify-center gap-2"
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <>
                  <IconSymbol name="paperplane.fill" size={20} color={colors.background} />
                  <Text className="text-background font-semibold text-lg">استخراج النصوص</Text>
                </>
              )}
            </Pressable>
          )}

          {/* Extracted Text Display */}
          {extractedText && (
            <View className="gap-3">
              {/* Text Preview */}
              <View className="bg-surface rounded-xl p-4 border border-border gap-2">
                <Text className="text-foreground font-semibold">النص المستخرج</Text>
                {!isEditing ? (
                  <Text className="text-foreground text-base leading-relaxed">{extractedText}</Text>
                ) : (
                  <TextInput
                    value={editedText}
                    onChangeText={setEditedText}
                    multiline
                    numberOfLines={10}
                    className="bg-background text-foreground p-3 rounded-lg border border-border"
                    placeholderTextColor={colors.muted}
                    placeholder="تحرير النص..."
                  />
                )}
              </View>

              {/* Action Buttons */}
              <View className="gap-2">
                <Pressable
                  onPress={() => setIsEditing(!isEditing)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className={`py-3 px-4 rounded-lg flex-row items-center justify-center gap-2 ${
                    isEditing ? "bg-primary" : "bg-surface border border-border"
                  }`}
                >
                  <IconSymbol
                    name="paperplane.fill"
                    size={18}
                    color={isEditing ? colors.background : colors.primary}
                  />
                  <Text
                    className={`font-semibold ${
                      isEditing ? "text-background" : "text-foreground"
                    }`}
                  >
                    {isEditing ? "حفظ التعديلات" : "تحرير النص"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleCopyText}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className="py-3 px-4 rounded-lg flex-row items-center justify-center gap-2 bg-surface border border-border"
                >
                  <IconSymbol name="paperplane.fill" size={18} color={colors.primary} />
                  <Text className="text-foreground font-semibold">نسخ النص</Text>
                </Pressable>

                <Pressable
                  onPress={handleShareText}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className="py-3 px-4 rounded-lg flex-row items-center justify-center gap-2 bg-surface border border-border"
                >
                  <IconSymbol name="paperplane.fill" size={18} color={colors.primary} />
                  <Text className="text-foreground font-semibold">مشاركة النص</Text>
                </Pressable>

                <Pressable
                  onPress={handleSaveText}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className="py-3 px-4 rounded-lg flex-row items-center justify-center gap-2 bg-surface border border-border"
                >
                  <IconSymbol name="paperplane.fill" size={18} color={colors.primary} />
                  <Text className="text-foreground font-semibold">حفظ النص</Text>
                </Pressable>
              </View>

              {/* Back Button */}
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="py-3 px-4 rounded-lg flex-row items-center justify-center gap-2 bg-surface border border-border"
              >
                <Text className="text-foreground font-semibold">رجوع</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
