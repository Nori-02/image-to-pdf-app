import { ScrollView, Text, View, Pressable, Alert, FlatList, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { ProjectManager, ProjectData } from "@/lib/project-manager";
import { useFocusEffect } from "@react-navigation/native";

export default function ProjectsHistoryScreen() {
  const router = useRouter();
  const colors = useColors();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<any>(null);

  useFocusEffect(() => {
    loadProjects();
  });

  const loadProjects = async () => {
    try {
      setLoading(true);
      const allProjects = await ProjectManager.getProjectsSortedByDate(true);
      setProjects(allProjects);

      const projectStats = await ProjectManager.getProjectStats();
      setStats(projectStats);
    } catch (error) {
      console.error("خطأ في تحميل المشاريع:", error);
      Alert.alert("خطأ", "فشل تحميل المشاريع");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      loadProjects();
    } else {
      const results = await ProjectManager.searchProjects(query);
      setProjects(results);
    }
  };

  const handleRestoreProject = async (project: ProjectData) => {
    try {
      const restored = await ProjectManager.restoreProject(project.id);
      if (restored) {
        Alert.alert("نجح", "تم استعادة المشروع بنجاح");
        loadProjects();
      }
    } catch (error) {
      Alert.alert("خطأ", "فشل استعادة المشروع");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    Alert.alert("تأكيد", "هل تريد حذف هذا المشروع؟", [
      {
        text: "إلغاء",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "حذف",
        onPress: async () => {
          try {
            const success = await ProjectManager.deleteProject(projectId);
            if (success) {
              Alert.alert("نجح", "تم حذف المشروع بنجاح");
              loadProjects();
            }
          } catch (error) {
            Alert.alert("خطأ", "فشل حذف المشروع");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleDeleteAllProjects = async () => {
    Alert.alert("تأكيد", "هل تريد حذف جميع المشاريع؟", [
      {
        text: "إلغاء",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "حذف الكل",
        onPress: async () => {
          try {
            const success = await ProjectManager.deleteAllProjects();
            if (success) {
              Alert.alert("نجح", "تم حذف جميع المشاريع بنجاح");
              loadProjects();
            }
          } catch (error) {
            Alert.alert("خطأ", "فشل حذف المشاريع");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">سجل المشاريع</Text>
            <Text className="text-base text-muted">عرض واستعادة المشاريع السابقة</Text>
          </View>

          {/* Statistics */}
          {stats && (
            <View className="bg-surface rounded-xl p-4 border border-border gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground font-semibold">عدد المشاريع</Text>
                <Text className="text-primary font-bold text-lg">{stats.totalProjects}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground font-semibold">إجمالي الصور</Text>
                <Text className="text-primary font-bold text-lg">{stats.totalImages}</Text>
              </View>
            </View>
          )}

          {/* Search Bar */}
          <View className="bg-surface rounded-xl p-3 border border-border">
            <Text className="text-foreground text-sm mb-2">البحث</Text>
            <View className="flex-row items-center gap-2 bg-background rounded-lg px-3 py-2">
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              <TextInput
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="ابحث عن مشروع..."
                placeholderTextColor={colors.muted}
                className="flex-1 text-foreground"
              />
            </View>
          </View>

          {/* Projects List */}
          {projects.length > 0 ? (
            <View className="gap-3">
              {projects.map((project) => (
                <View
                  key={project.id}
                  className="bg-surface rounded-xl p-4 border border-border gap-3"
                >
                  {/* Project Info */}
                  <View className="gap-2">
                    <Text className="text-foreground font-bold text-lg">{project.name}</Text>
                    <Text className="text-muted text-sm">{formatDate(project.updatedAt)}</Text>
                    <Text className="text-muted text-sm">
                      {project.images.length} صور • {project.settings.pageSize}
                    </Text>
                    {project.notes && (
                      <Text className="text-muted text-sm italic">{project.notes}</Text>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => handleRestoreProject(project)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                      className="flex-1 bg-primary py-2 px-3 rounded-lg flex-row items-center justify-center gap-2"
                    >
                      <IconSymbol name="paperplane.fill" size={16} color={colors.background} />
                      <Text className="text-background font-semibold text-sm">استعادة</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleDeleteProject(project.id)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                      className="flex-1 bg-error py-2 px-3 rounded-lg flex-row items-center justify-center gap-2"
                    >
                      <IconSymbol name="paperplane.fill" size={16} color={colors.background} />
                      <Text className="text-background font-semibold text-sm">حذف</Text>
                    </Pressable>
                  </View>
                </View>
              ))}

              {/* Delete All Button */}
              {projects.length > 1 && (
                <Pressable
                  onPress={handleDeleteAllProjects}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className="bg-error py-3 px-4 rounded-lg flex-row items-center justify-center gap-2"
                >
                  <Text className="text-background font-semibold">حذف جميع المشاريع</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View className="items-center justify-center py-12 gap-4">
              <Text className="text-2xl">📭</Text>
              <Text className="text-foreground font-semibold text-lg">لا توجد مشاريع</Text>
              <Text className="text-muted text-center">
                لم تقم بإنشاء أي مشاريع حتى الآن. ابدأ بإنشاء مشروع جديد!
              </Text>
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

// TextInput component import
import { TextInput } from "react-native";
