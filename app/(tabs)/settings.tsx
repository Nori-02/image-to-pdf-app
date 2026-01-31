import { ScrollView, Text, View, Pressable, Switch } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";

export default function SettingsScreen() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const colors = useColors();
  const colorScheme = useColorScheme();
  const [language, setLanguage] = useState("ar");
  const [notifications, setNotifications] = useState(true);

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">جاري التحميل...</Text>
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">يرجى تسجيل الدخول أولاً</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">الإعدادات</Text>
            <Text className="text-base text-muted">إدارة تفضيلاتك</Text>
          </View>

          {/* User Section */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-3">
            <Text className="text-lg font-semibold text-foreground">حسابك</Text>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-foreground font-semibold">{user?.name || "المستخدم"}</Text>
                <Text className="text-sm text-muted mt-1">{user?.email}</Text>
              </View>
              <IconSymbol name="paperplane.fill" size={32} color={colors.primary} />
            </View>
          </View>

          {/* Preferences Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">التفضيلات</Text>

            {/* Language */}
            <View className="bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground font-semibold">اللغة</Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => setLanguage("ar")}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className={`px-3 py-1 rounded-lg ${
                      language === "ar" ? "bg-primary" : "bg-background border border-border"
                    }`}
                  >
                    <Text className={language === "ar" ? "text-background" : "text-foreground"}>
                      العربية
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setLanguage("en")}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className={`px-3 py-1 rounded-lg ${
                      language === "en" ? "bg-primary" : "bg-background border border-border"
                    }`}
                  >
                    <Text className={language === "en" ? "text-background" : "text-foreground"}>
                      English
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Notifications */}
            <View className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between">
              <Text className="text-foreground font-semibold">الإشعارات</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {/* Theme */}
            <View className="bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground font-semibold">المظهر</Text>
                <Text className="text-sm text-muted capitalize">
                  {colorScheme === "dark" ? "غامق" : colorScheme === "light" ? "فاتح" : "تلقائي"}
                </Text>
              </View>
            </View>
          </View>

          {/* About Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">معلومات</Text>

            <View className="bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground">الإصدار</Text>
                <Text className="text-muted">1.0.0</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-surface rounded-xl p-4 border border-border"
            >
              <Text className="text-foreground font-semibold">سياسة الخصوصية</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-surface rounded-xl p-4 border border-border"
            >
              <Text className="text-foreground font-semibold">شروط الخدمة</Text>
            </Pressable>
          </View>

          {/* Logout */}
          <Pressable
            onPress={logout}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="bg-error py-4 rounded-xl items-center"
          >
            <Text className="text-background font-semibold text-lg">تسجيل الخروج</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
