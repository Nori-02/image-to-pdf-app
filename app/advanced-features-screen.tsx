import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { AIFeatures } from "@/lib/ai-features";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export default function AdvancedFeaturesScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([
    {
      id: "ocr",
      title: "استخراج النصوص (OCR)",
      description: "استخرج النصوص من الصور تلقائياً",
      icon: "paperplane.fill",
      enabled: false,
    },
    {
      id: "document-recognition",
      title: "التعرف على الوثائق",
      description: "تحديد نوع الوثيقة تلقائياً",
      icon: "paperplane.fill",
      enabled: false,
    },
    {
      id: "ai-enhance",
      title: "تحسين ذكي للصور",
      description: "تحسين الصور بالذكاء الاصطناعي",
      icon: "paperplane.fill",
      enabled: false,
    },
    {
      id: "handwriting",
      title: "تحويل خط اليد",
      description: "تحويل النصوص المكتوبة بخط اليد",
      icon: "paperplane.fill",
      enabled: false,
    },
    {
      id: "qr-share",
      title: "مشاركة QR Code",
      description: "شارك الملفات عبر QR Code",
      icon: "paperplane.fill",
      enabled: false,
    },
    {
      id: "digital-signature",
      title: "التوقيع الرقمي",
      description: "أضف توقيع رقمي آمن",
      icon: "paperplane.fill",
      enabled: false,
    },
    {
      id: "ebook",
      title: "إنشاء كتاب إلكتروني",
      description: "حول الصور إلى كتاب إلكتروني",
      icon: "paperplane.fill",
      enabled: false,
    },
    {
      id: "searchable-pdf",
      title: "PDF قابل للبحث",
      description: "إنشاء ملفات PDF قابلة للبحث",
      icon: "paperplane.fill",
      enabled: false,
    },
  ]);

  const toggleFeature = (id: string) => {
    setFeatures(
      features.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const handleApplyFeatures = async () => {
    setLoading(true);
    try {
      const enabledFeatures = features.filter((f) => f.enabled);

      for (const feature of enabledFeatures) {
        switch (feature.id) {
          case "ocr":
            await AIFeatures.extractText("dummy-uri");
            break;
          case "document-recognition":
            await AIFeatures.recognizeDocument("dummy-uri");
            break;
          case "ai-enhance":
            await AIFeatures.enhanceImage("dummy-uri");
            break;
          case "handwriting":
            await AIFeatures.convertHandwriting("dummy-uri");
            break;
          case "qr-share":
            AIFeatures.generateQRCode("dummy-data");
            break;
          case "digital-signature":
            await AIFeatures.addDigitalSignature("dummy-path", "dummy-sig");
            break;
          case "ebook":
            await AIFeatures.createEBook(["uri1", "uri2"], "Title", "Author");
            break;
          case "searchable-pdf":
            await AIFeatures.searchInPDF("dummy-path", "search-term");
            break;
        }
      }

      console.log("تم تطبيق الميزات بنجاح");
    } catch (error) {
      console.error("خطأ في تطبيق الميزات:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">الميزات المتقدمة</Text>
            <Text className="text-base text-muted">
              استخدم الذكاء الاصطناعي لتحسين ملفاتك
            </Text>
          </View>

          {/* Features Grid */}
          <View className="gap-3">
            {features.map((feature) => (
              <Pressable
                key={feature.id}
                onPress={() => toggleFeature(feature.id)}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className={`p-4 rounded-xl border flex-row items-center gap-3 ${
                  feature.enabled
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                }`}
              >
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center ${
                    feature.enabled
                      ? "bg-background border-background"
                      : "border-border"
                  }`}
                >
                  {feature.enabled && (
                    <IconSymbol name="chevron.right" size={16} color={colors.primary} />
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-semibold ${
                      feature.enabled ? "text-background" : "text-foreground"
                    }`}
                  >
                    {feature.title}
                  </Text>
                  <Text
                    className={`text-sm mt-1 ${
                      feature.enabled ? "text-background/80" : "text-muted"
                    }`}
                  >
                    {feature.description}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Info Box */}
          <View className="bg-warning/10 rounded-xl p-4 border border-warning gap-2">
            <Text className="text-warning font-semibold">ملاحظة</Text>
            <Text className="text-warning text-sm">
              قد تستغرق بعض الميزات وقتاً أطول في المعالجة. تأكد من اتصالك بالإنترنت.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3 mt-4">
            <Pressable
              onPress={handleApplyFeatures}
              disabled={loading || !features.some((f) => f.enabled)}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-primary py-4 rounded-xl items-center flex-row justify-center gap-2"
            >
              {loading && <ActivityIndicator color={colors.background} />}
              <Text className="text-background font-semibold text-lg">
                {loading ? "جاري المعالجة..." : "تطبيق الميزات"}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-surface py-4 rounded-xl border border-border items-center"
            >
              <Text className="text-foreground font-semibold text-lg">التالي</Text>
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
