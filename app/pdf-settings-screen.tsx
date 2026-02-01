import { ScrollView, Text, View, Pressable, Switch } from "react-native";
import { useState } from "react";
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
  const colors = useColors();
  const [settings, setSettings] = useState<PDFSettings>({
    pageSize: "A4",
    orientation: "portrait",
    quality: 100,
    compression: true,
    watermark: false,
    watermarkText: "",
  });

  const updateSetting = (key: keyof PDFSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">إعدادات PDF</Text>
            <Text className="text-base text-muted">خصص إعدادات ملف PDF</Text>
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
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className={`flex-1 p-4 rounded-xl border ${
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
                onPress={() =>
                  updateSetting("quality", Math.max(50, settings.quality - 10))
                }
                className="bg-surface border border-border p-2 rounded-lg"
              >
                <Text className="text-foreground">−</Text>
              </Pressable>
              <View className="flex-1 h-1 bg-border rounded-full" />
              <Pressable
                onPress={() =>
                  updateSetting("quality", Math.min(100, settings.quality + 10))
                }
                className="bg-surface border border-border p-2 rounded-lg"
              >
                <Text className="text-foreground">+</Text>
              </Pressable>
            </View>
          </View>

          {/* Compression */}
          <View className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between">
            <Text className="text-foreground font-semibold">ضغط الملف</Text>
            <Switch
              value={settings.compression}
              onValueChange={(value) => updateSetting("compression", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {/* Watermark */}
          <View className="gap-3">
            <View className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between">
              <Text className="text-foreground font-semibold">إضافة علامة مائية</Text>
              <Switch
                value={settings.watermark}
                onValueChange={(value) => updateSetting("watermark", value)}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {settings.watermark && (
              <View className="bg-surface rounded-xl p-4 border border-border">
                <Text className="text-foreground font-semibold mb-2">نص العلامة المائية</Text>
                <View className="border border-border rounded-lg p-3 bg-background">
                  <Text className="text-muted">أدخل نص العلامة المائية</Text>
                </View>
              </View>
            )}
          </View>

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
