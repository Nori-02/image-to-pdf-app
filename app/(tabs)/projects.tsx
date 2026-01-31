import { ScrollView, Text, View, Pressable, FlatList } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function ProjectsScreen() {
  const { isAuthenticated, loading } = useAuth();
  const colors = useColors();
  const { data: projects = [], isLoading } = trpc.projects.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading || isLoading) {
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
            <Text className="text-3xl font-bold text-foreground">المشاريع</Text>
            <Text className="text-base text-muted">جميع مشاريعك المحفوظة</Text>
          </View>

          {projects.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 border border-border items-center gap-4">
              <IconSymbol name="paperplane.fill" size={40} color={colors.muted} />
              <Text className="text-muted text-center">لا توجد مشاريع حديثة</Text>
              <Text className="text-sm text-muted text-center">
                ابدأ بإنشاء مشروع جديد لتحويل صورك إلى PDF
              </Text>
            </View>
          ) : (
            <FlatList
              data={projects}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className="bg-surface rounded-xl p-4 border border-border mb-3 flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">{item.name}</Text>
                    <Text className="text-sm text-muted mt-1">
                      {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={24} color={colors.primary} />
                </Pressable>
              )}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
