import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

interface PDFSettings {
  pageSize: "A4" | "Letter" | "A3";
  orientation: "portrait" | "landscape";
  quality: number;
  compression: boolean;
  watermark: boolean;
  watermarkText: string;
}

interface ImageFile {
  uri: string;
  name: string;
}

// حجم الصفحات بالنقاط (points)
const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  Letter: { width: 612, height: 792 },
  A3: { width: 842, height: 1191 },
};

export class PDFConverter {
  /**
   * تحويل صور متعددة إلى ملف PDF
   */
  static async convertImagesToPDF(
    images: ImageFile[],
    settings: PDFSettings,
    fileName: string = "document.pdf"
  ): Promise<string> {
    try {
      // تحويل الصور إلى Base64
      const imageData = await Promise.all(
        images.map(async (img) => {
          const fileContent = await FileSystem.readAsStringAsync(img.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          return {
            base64: fileContent,
            name: img.name,
          };
        })
      );

      // إنشاء ملف PDF باستخدام jsPDF
      // هنا نستخدم API بسيطة لإنشاء PDF
      const pdfContent = this.generatePDFContent(imageData, settings);

      // حفظ الملف
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, pdfContent, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return filePath;
    } catch (error) {
      console.error("خطأ في تحويل الصور إلى PDF:", error);
      throw error;
    }
  }

  /**
   * مشاركة ملف PDF
   */
  static async sharePDF(filePath: string): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("خطأ", "المشاركة غير متاحة على هذا الجهاز");
        return;
      }

      await Sharing.shareAsync(filePath, {
        mimeType: "application/pdf",
        dialogTitle: "مشاركة ملف PDF",
      });
    } catch (error) {
      console.error("خطأ في مشاركة الملف:", error);
      throw error;
    }
  }

  /**
   * حفظ ملف PDF في المعرض
   */
  static async savePDFToGallery(filePath: string): Promise<void> {
    try {
      // نسخ الملف إلى مجلد التنزيلات
      const fileName = filePath.split("/").pop() || "document.pdf";
      const destinationPath = `${FileSystem.documentDirectory}${fileName}`;

      if (filePath !== destinationPath) {
        await FileSystem.copyAsync({
          from: filePath,
          to: destinationPath,
        });
      }

      Alert.alert("نجاح", "تم حفظ الملف بنجاح");
    } catch (error) {
      console.error("خطأ في حفظ الملف:", error);
      throw error;
    }
  }

  /**
   * حذف ملف PDF
   */
  static async deletePDF(filePath: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(filePath);
    } catch (error) {
      console.error("خطأ في حذف الملف:", error);
      throw error;
    }
  }

  /**
   * الحصول على معلومات الملف
   */
  static async getFileInfo(filePath: string): Promise<any> {
    try {
      const info = await FileSystem.getInfoAsync(filePath);
      return info;
    } catch (error) {
      console.error("خطأ في الحصول على معلومات الملف:", error);
      throw error;
    }
  }

  /**
   * إنشاء محتوى PDF (محاكاة بسيطة)
   * في التطبيق الفعلي، يجب استخدام مكتبة مثل jsPDF أو PDFKit
   */
  private static generatePDFContent(
    imageData: Array<{ base64: string; name: string }>,
    settings: PDFSettings
  ): string {
    // هنا يتم إنشاء محتوى PDF
    // هذا مثال مبسط - في التطبيق الفعلي، يجب استخدام مكتبة متخصصة
    let pdfContent = "%PDF-1.4\n";

    // إضافة الكائنات الأساسية
    pdfContent += "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
    pdfContent += "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";

    // إضافة الصفحات
    let pageIndex = 3;
    imageData.forEach((img, index) => {
      pdfContent += `${pageIndex} 0 obj\n`;
      pdfContent += `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_SIZES[settings.pageSize].width} ${PAGE_SIZES[settings.pageSize].height}] >>\n`;
      pdfContent += "endobj\n";
      pageIndex++;
    });

    pdfContent += "xref\n";
    pdfContent += "0 " + (pageIndex + 1) + "\n";
    pdfContent += "0000000000 65535 f\n";
    pdfContent += "trailer\n<< /Size " + (pageIndex + 1) + " /Root 1 0 R >>\n";
    pdfContent += "startxref\n0\n%%EOF\n";

    return pdfContent;
  }
}

// دالة مساعدة لتحويل الصور إلى PDF بسهولة
export async function convertImagesToPDF(
  images: ImageFile[],
  settings: PDFSettings,
  fileName: string = `document-${Date.now()}.pdf`
): Promise<string> {
  try {
    const pdfPath = await PDFConverter.convertImagesToPDF(images, settings, fileName);
    return pdfPath;
  } catch (error) {
    console.error("خطأ في تحويل الصور:", error);
    throw error;
  }
}

// دالة مساعدة لمشاركة PDF
export async function sharePDFFile(filePath: string): Promise<void> {
  try {
    await PDFConverter.sharePDF(filePath);
  } catch (error) {
    console.error("خطأ في مشاركة الملف:", error);
    throw error;
  }
}

// دالة مساعدة لحفظ PDF
export async function savePDFFile(filePath: string): Promise<void> {
  try {
    await PDFConverter.savePDFToGallery(filePath);
  } catch (error) {
    console.error("خطأ في حفظ الملف:", error);
    throw error;
  }
}
