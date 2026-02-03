import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ProjectData {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  images: string[];
  settings: {
    pageSize: string;
    orientation: "portrait" | "landscape";
    quality: number;
    compression: boolean;
    watermark?: string;
  };
  pdfPath?: string;
  notes?: string;
}

const PROJECTS_KEY = "image_to_pdf_projects";
const MAX_PROJECTS = 50;

/**
 * خدمة إدارة سجل المشاريع المحلي
 */
export class ProjectManager {
  /**
   * حفظ مشروع جديد
   */
  static async saveProject(project: Omit<ProjectData, "id" | "createdAt" | "updatedAt">): Promise<ProjectData> {
    try {
      const projects = await this.getAllProjects();
      const newProject: ProjectData = {
        ...project,
        id: `project_${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // الحفاظ على عدد المشاريع المحدود
      if (projects.length >= MAX_PROJECTS) {
        projects.shift(); // حذف أقدم مشروع
      }

      projects.push(newProject);
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      return newProject;
    } catch (error) {
      console.error("خطأ في حفظ المشروع:", error);
      throw error;
    }
  }

  /**
   * تحديث مشروع موجود
   */
  static async updateProject(id: string, updates: Partial<ProjectData>): Promise<ProjectData> {
    try {
      const projects = await this.getAllProjects();
      const index = projects.findIndex((p) => p.id === id);

      if (index === -1) {
        throw new Error("المشروع غير موجود");
      }

      const updated: ProjectData = {
        ...projects[index],
        ...updates,
        id, // لا تغيير الـ ID
        createdAt: projects[index].createdAt, // لا تغيير تاريخ الإنشاء
        updatedAt: Date.now(),
      };

      projects[index] = updated;
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      return updated;
    } catch (error) {
      console.error("خطأ في تحديث المشروع:", error);
      throw error;
    }
  }

  /**
   * الحصول على مشروع واحد
   */
  static async getProject(id: string): Promise<ProjectData | null> {
    try {
      const projects = await this.getAllProjects();
      return projects.find((p) => p.id === id) || null;
    } catch (error) {
      console.error("خطأ في الحصول على المشروع:", error);
      return null;
    }
  }

  /**
   * الحصول على جميع المشاريع
   */
  static async getAllProjects(): Promise<ProjectData[]> {
    try {
      const data = await AsyncStorage.getItem(PROJECTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("خطأ في الحصول على المشاريع:", error);
      return [];
    }
  }

  /**
   * حذف مشروع
   */
  static async deleteProject(id: string): Promise<boolean> {
    try {
      const projects = await this.getAllProjects();
      const filtered = projects.filter((p) => p.id !== id);
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("خطأ في حذف المشروع:", error);
      return false;
    }
  }

  /**
   * حذف جميع المشاريع
   */
  static async deleteAllProjects(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(PROJECTS_KEY);
      return true;
    } catch (error) {
      console.error("خطأ في حذف جميع المشاريع:", error);
      return false;
    }
  }

  /**
   * البحث عن مشاريع
   */
  static async searchProjects(query: string): Promise<ProjectData[]> {
    try {
      const projects = await this.getAllProjects();
      const lowerQuery = query.toLowerCase();
      return projects.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          (p.notes && p.notes.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error("خطأ في البحث عن المشاريع:", error);
      return [];
    }
  }

  /**
   * الحصول على المشاريع المرتبة حسب التاريخ
   */
  static async getProjectsSortedByDate(descending: boolean = true): Promise<ProjectData[]> {
    try {
      const projects = await this.getAllProjects();
      return projects.sort((a, b) => {
        const diff = b.updatedAt - a.updatedAt;
        return descending ? diff : -diff;
      });
    } catch (error) {
      console.error("خطأ في ترتيب المشاريع:", error);
      return [];
    }
  }

  /**
   * الحصول على إحصائيات المشاريع
   */
  static async getProjectStats(): Promise<{
    totalProjects: number;
    totalImages: number;
    totalSize: number;
    oldestProject?: ProjectData;
    newestProject?: ProjectData;
  }> {
    try {
      const projects = await this.getAllProjects();
      const stats = {
        totalProjects: projects.length,
        totalImages: projects.reduce((sum, p) => sum + p.images.length, 0),
        totalSize: 0,
        oldestProject: projects.length > 0 ? projects[projects.length - 1] : undefined,
        newestProject: projects.length > 0 ? projects[0] : undefined,
      };

      return stats;
    } catch (error) {
      console.error("خطأ في الحصول على الإحصائيات:", error);
      return {
        totalProjects: 0,
        totalImages: 0,
        totalSize: 0,
      };
    }
  }

  /**
   * استعادة مشروع من النسخة الاحتياطية
   */
  static async restoreProject(projectId: string): Promise<ProjectData | null> {
    try {
      const project = await this.getProject(projectId);
      if (!project) {
        throw new Error("المشروع غير موجود");
      }

      // تحديث تاريخ الوصول
      return await this.updateProject(projectId, {
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("خطأ في استعادة المشروع:", error);
      return null;
    }
  }
}
