import { ScrollView, Text, View, TouchableOpacity, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const colors = useColors();

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">جاري التحميل...</Text>
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="p-6 justify-center">
        <View className="gap-8">
          <View className="items-center gap-4">
            <View className="w-20 h-20 bg-primary rounded-full items-center justify-center">
              <IconSymbol name="paperplane.fill" size={40} color={colors.background} />
            </View>
            <Text className="text-3xl font-bold text-foreground text-center">تحويل الصور إلى PDF</Text>
            <Text className="text-base text-muted text-center leading-relaxed">
              حول صورك إلى ملفات PDF احترافية بسهولة
            </Text>
          </View>

          <View className="gap-3">
            <Pressable
              onPress={() => router.push("/oauth/callback")}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-background font-semibold text-lg">تسجيل الدخول عبر الحساب</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/local-login-screen")}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-surface py-4 rounded-xl items-center border border-primary"
            >
              <Text className="text-primary font-semibold text-lg">استخدام بدون حساب</Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">مرحباً، {user?.name || "المستخدم"}</Text>
            <Text className="text-base text-muted">ابدأ بتحويل صورك إلى PDF الآن</Text>
          </View>

          <View className="gap-3">
            <Pressable
              onPress={() => router.push("/image-picker-screen")}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
              className="bg-primary py-4 px-6 rounded-xl flex-row items-center justify-between"
            >
              <Text className="text-background font-semibold text-lg">إضافة صور جديدة</Text>
              <IconSymbol name="paperplane.fill" size={24} color={colors.background} />
            </Pressable>

            <Pressable
              onPress={() => router.push("/image-picker-screen?mode=camera")}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
              className="bg-surface py-4 px-6 rounded-xl flex-row items-center justify-between border border-border"
            >
              <Text className="text-foreground font-semibold text-lg">التقاط صورة</Text>
              <IconSymbol name="paperplane.fill" size={24} color={colors.primary} />
            </Pressable>
          </View>

          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">المشاريع الحديثة</Text>
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-muted text-center py-8">لا توجد مشاريع حديثة</Text>
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">الإحصائيات</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                <Text className="text-2xl font-bold text-primary">0</Text>
                <Text className="text-sm text-muted mt-1">ملفات PDF</Text>
              </View>
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                <Text className="text-2xl font-bold text-primary">0</Text>
                <Text className="text-sm text-muted mt-1">مشاريع</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
