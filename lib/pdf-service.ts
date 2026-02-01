import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

interface PDFOptions {
  pageSize?: "A4" | "Letter" | "A3";
  orientation?: "portrait" | "landscape";
  quality?: number;
  compression?: boolean;
  watermark?: string;
}

interface ImageData {
  uri: string;
  width?: number;
  height?: number;
}

export class PDFService {
  /**
   * تحويل صور متعددة إلى ملف PDF
   */
  static async imagesToPDF(
    images: ImageData[],
    fileName: string,
    options: PDFOptions = {}
  ): Promise<string> {
    try {
      const {
        pageSize = "A4",
        orientation = "portrait",
        quality = 100,
        compression = true,
      } = options;

      // الحصول على أبعاد الصفحة
      const pageDimensions = this.getPageDimensions(pageSize, orientation);

      // إنشاء مسار الملف
      const fileName_safe = fileName.replace(/[^a-zA-Z0-9_-]/g, "_");
      const pdfPath = `${FileSystem.documentDirectory}${fileName_safe}.pdf`;

      // محاكاة إنشاء PDF (في التطبيق الحقيقي، ستستخدم مكتبة PDF حقيقية)
      // للآن، نحفظ معلومات الصور في ملف JSON كبديل
      const pdfData = {
        fileName: fileName_safe,
        pageSize,
        orientation,
        quality,
        compression,
        imageCount: images.length,
        images: images.map((img, index) => ({
          index,
          uri: img.uri,
          width: img.width || pageDimensions.width,
          height: img.height || pageDimensions.height,
        })),
        createdAt: new Date().toISOString(),
      };

      // حفظ البيانات
      await FileSystem.writeAsStringAsync(pdfPath, JSON.stringify(pdfData, null, 2));

      return pdfPath;
    } catch (error) {
      console.error("خطأ في تحويل الصور إلى PDF:", error);
      throw new Error("فشل تحويل الصور إلى PDF");
    }
  }

  /**
   * الحصول على أبعاد الصفحة
   */
  static getPageDimensions(
    pageSize: string,
    orientation: string
  ): { width: number; height: number } {
    const sizes: Record<string, { width: number; height: number }> = {
      A4: { width: 210, height: 297 },
      Letter: { width: 216, height: 279 },
      A3: { width: 297, height: 420 },
    };

    let dimensions = sizes[pageSize] || sizes.A4;

    if (orientation === "landscape") {
      return {
        width: dimensions.height,
        height: dimensions.width,
      };
    }

    return dimensions;
  }

  /**
   * مشاركة ملف PDF
   */
  static async sharePDF(filePath: string, fileName: string): Promise<void> {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error("المشاركة غير متاحة على هذا الجهاز");
      }

      await Sharing.shareAsync(filePath, {
        mimeType: "application/pdf",
        dialogTitle: `مشاركة ${fileName}`,
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("خطأ في مشاركة PDF:", error);
      throw new Error("فشل مشاركة الملف");
    }
  }

  /**
   * حفظ PDF في معرض الصور
   */
  static async savePDFToGallery(filePath: string): Promise<void> {
    try {
      if (Platform.OS === "ios") {
        // على iOS، نستخدم المشاركة
        await this.sharePDF(filePath, "PDF");
      } else {
        // على Android، يمكن حفظه مباشرة
        const fileName = filePath.split("/").pop() || "document.pdf";
        const targetPath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({
          from: filePath,
          to: targetPath,
        });
      }
    } catch (error) {
      console.error("خطأ في حفظ PDF:", error);
      throw new Error("فشل حفظ الملف");
    }
  }

  /**
   * حذف ملف PDF
   */
  static async deletePDF(filePath: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(filePath);
    } catch (error) {
      console.error("خطأ في حذف PDF:", error);
      throw new Error("فشل حذف الملف");
    }
  }

  /**
   * الحصول على حجم الملف
   */
  static async getFileSize(filePath: string): Promise<number> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      return (fileInfo as any).size || 0;
    } catch (error) {
      console.error("خطأ في الحصول على حجم الملف:", error);
      return 0;
    }
  }

  /**
   * ضغط الصور
   */
  static async compressImage(
    imageUri: string,
    quality: number = 0.8
  ): Promise<string> {
    try {
      // في التطبيق الحقيقي، ستستخدم مكتبة ضغط الصور
      // للآن، نعيد نفس الصورة
      return imageUri;
    } catch (error) {
      console.error("خطأ في ضغط الصورة:", error);
      throw new Error("فشل ضغط الصورة");
    }
  }

  /**
   * إضافة علامة مائية
   */
  static async addWatermark(
    imageUri: string,
    watermarkText: string
  ): Promise<string> {
    try {
      // في التطبيق الحقيقي، ستستخدم مكتبة معالجة الصور
      // للآن، نعيد نفس الصورة
      return imageUri;
    } catch (error) {
      console.error("خطأ في إضافة العلامة المائية:", error);
      throw new Error("فشل إضافة العلامة المائية");
    }
  }
}
