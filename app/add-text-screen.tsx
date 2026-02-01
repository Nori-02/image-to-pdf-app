import { ScrollView, Text, View, Pressable, TextInput, FlatList } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface TextAnnotation {
  id: string;
  content: string;
  fontSize: number;
  fontColor: string;
  pageNumber: number;
}

export default function AddTextScreen() {
  const colors = useColors();
  const [textContent, setTextContent] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState("#000000");
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);

  const colors_list = ["#000000", "#FF0000", "#0000FF", "#00AA00", "#FFAA00"];

  const addText = () => {
    if (textContent.trim()) {
      const newAnnotation: TextAnnotation = {
        id: Date.now().toString(),
        content: textContent,
        fontSize,
        fontColor,
        pageNumber: 1,
      };
      setAnnotations([...annotations, newAnnotation]);
      setTextContent("");
    }
  };

  const removeText = (id: string) => {
    setAnnotations(annotations.filter((ann) => ann.id !== id));
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">إضافة نصوص</Text>
            <Text className="text-base text-muted">أضف نصوص وتعليقات إلى الملف</Text>
          </View>

          {/* Text Input */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">النص</Text>
            <View className="border border-border rounded-xl p-3 bg-background">
              <TextInput
                placeholder="أدخل النص هنا"
                placeholderTextColor={colors.muted}
                value={textContent}
                onChangeText={setTextContent}
                multiline
                numberOfLines={4}
                className="text-foreground"
                style={{ textAlignVertical: "top" }}
              />
            </View>
          </View>

          {/* Font Size */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">حجم الخط</Text>
              <Text className="text-muted">{fontSize}px</Text>
            </View>
            <View className="flex-row gap-2 items-center">
              <Pressable
                onPress={() => setFontSize(Math.max(8, fontSize - 2))}
                className="bg-surface border border-border p-2 rounded-lg"
              >
                <Text className="text-foreground">−</Text>
              </Pressable>
              <View className="flex-1 h-1 bg-border rounded-full" />
              <Pressable
                onPress={() => setFontSize(Math.min(48, fontSize + 2))}
                className="bg-surface border border-border p-2 rounded-lg"
              >
                <Text className="text-foreground">+</Text>
              </Pressable>
            </View>
          </View>

          {/* Font Color */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">لون الخط</Text>
            <View className="flex-row gap-2">
              {colors_list.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setFontColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-12 h-12 rounded-lg border-2 ${
                    fontColor === color ? "border-primary" : "border-border"
                  }`}
                />
              ))}
            </View>
          </View>

          {/* Preview */}
          <View className="bg-surface rounded-xl p-4 border border-border">
            <Text className="text-muted text-sm mb-2">معاينة</Text>
            <Text
              style={{
                fontSize,
                color: fontColor,
              }}
              className="font-semibold"
            >
              {textContent || "معاينة النص"}
            </Text>
          </View>

          {/* Add Button */}
          <Pressable
            onPress={addText}
            disabled={!textContent.trim()}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="bg-primary py-4 rounded-xl items-center"
          >
            <Text className="text-background font-semibold text-lg">إضافة النص</Text>
          </Pressable>

          {/* Added Texts */}
          {annotations.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">
                النصوص المضافة ({annotations.length})
              </Text>
              <FlatList
                data={annotations}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View className="bg-surface rounded-xl p-4 border border-border mb-3 flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text
                        style={{ color: item.fontColor, fontSize: item.fontSize }}
                        className="font-semibold mb-1"
                        numberOfLines={1}
                      >
                        {item.content}
                      </Text>
                      <Text className="text-xs text-muted">
                        الصفحة {item.pageNumber} • {item.fontSize}px
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => removeText(item.id)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                      className="bg-error rounded-lg p-2"
                    >
                      <IconSymbol name="chevron.right" size={16} color={colors.background} />
                    </Pressable>
                  </View>
                )}
              />
            </View>
          )}

          {/* Action Buttons */}
          <View className="gap-3 mt-4">
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-background font-semibold text-lg">التالي</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-surface py-4 rounded-xl border border-border items-center"
            >
              <Text className="text-foreground font-semibold text-lg">إلغاء</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
