import { ScreenContainer } from "@/components/screen-container";
import * as Auth from "@/lib/_core/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LocalLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocalLogin = async () => {
    setError(null);

    // التحقق من صحة البيانات
    if (!email.trim()) {
      setError("يرجى إدخال البريد الإلكتروني");
      return;
    }

    if (!name.trim()) {
      setError("يرجى إدخال الاسم");
      return;
    }

    // التحقق من صيغة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("البريد الإلكتروني غير صحيح");
      return;
    }

    setIsLoading(true);

    try {
      // إنشاء جلسة محلية
      const userInfo: Auth.User = {
        id: Math.floor(Math.random() * 1000000),
        openId: `local_${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        loginMethod: "local",
        lastSignedIn: new Date(),
      };

      // حفظ معلومات المستخدم
      await Auth.setUserInfo(userInfo);

      // حفظ رمز جلسة محلي
      const localToken = `local_${userInfo.openId}`;
      await Auth.setSessionToken(localToken);

      // الانتقال إلى الشاشة الرئيسية
      router.replace("/(tabs)");
    } catch (err) {
      setError("حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.");
      console.error("Local login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScreenContainer className="p-6">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center gap-6">
            {/* Header */}
            <View className="items-center gap-2 mb-6">
              <Text className="text-3xl font-bold text-foreground">تسجيل الدخول</Text>
              <Text className="text-base text-muted text-center">
                استخدم تطبيق تحويل الصور إلى PDF بدون الحاجة لحساب
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View className="bg-error/10 border border-error rounded-lg p-4">
                <Text className="text-error text-sm">{error}</Text>
              </View>
            )}

            {/* Name Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">الاسم</Text>
              <TextInput
                placeholder="أدخل اسمك"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                editable={!isLoading}
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                style={{
                  fontSize: 16,
                }}
              />
            </View>

            {/* Email Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">البريد الإلكتروني</Text>
              <TextInput
                placeholder="example@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                style={{
                  fontSize: 16,
                }}
              />
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleLocalLogin}
              disabled={isLoading}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              className="bg-primary rounded-lg py-3 items-center justify-center mt-4"
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-semibold text-base">دخول</Text>
              )}
            </Pressable>

            {/* Info Message */}
            <View className="bg-primary/10 border border-primary rounded-lg p-4 mt-4">
              <Text className="text-primary text-xs leading-5">
                💡 هذا تسجيل محلي. بيانات الجلسة ستُحفظ محلياً على جهازك فقط ولن تُرسل إلى أي خادم.
              </Text>
            </View>

            {/* Spacer */}
            <View className="flex-1" />
          </View>
        </ScrollView>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
