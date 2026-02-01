import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import jsPDF from "jspdf";

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

export class PDFServiceV2 {
  /**
   * تحويل صور متعددة إلى ملف PDF باستخدام jsPDF
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

      // الحصول على أبعاد الصفحة بالملليمتر
      const pageDimensions = this.getPageDimensions(pageSize, orientation);

      // إنشاء مستند PDF
      const pdf = new jsPDF({
        orientation: orientation as "portrait" | "landscape",
        unit: "mm",
        format: pageSize as any,
        compress: compression,
      });

      // إضافة الصور إلى PDF
      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        // إذا لم تكن الصورة الأولى، أضف صفحة جديدة
        if (i > 0) {
          pdf.addPage();
        }

        try {
          // قراءة الصورة وتحويلها إلى Base64
          const imageBase64 = await this.imageToBase64(image.uri);

          // حساب أبعاد الصورة لتناسب الصفحة
          const imgWidth = pageDimensions.width - 10; // ترك هامش 5 ملم من كل جانب
          const imgHeight = (imgWidth * (image.height || pageDimensions.height)) / (image.width || pageDimensions.width);

          // التأكد من عدم تجاوز ارتفاع الصفحة
          const finalHeight = Math.min(imgHeight, pageDimensions.height - 10);
          const finalWidth = (finalHeight * (image.width || pageDimensions.width)) / (image.height || pageDimensions.height);

          // إضافة الصورة إلى الصفحة
          pdf.addImage(imageBase64, "JPEG", 5, 5, finalWidth, finalHeight);
        } catch (error) {
          console.error(`خطأ في إضافة الصورة ${i + 1}:`, error);
          // متابعة مع الصور الأخرى
        }
      }

      // إضافة علامة مائية إذا كانت موجودة
      if (options.watermark) {
        this.addWatermarkToPDF(pdf, options.watermark);
      }

      // حفظ الملف
      const fileName_safe = fileName.replace(/[^a-zA-Z0-9_-]/g, "_");
      const pdfPath = `${FileSystem.documentDirectory}${fileName_safe}.pdf`;

      // الحصول على محتوى PDF كـ Base64
      const pdfBase64 = pdf.output("dataurlstring");
      const pdfData = pdfBase64.replace("data:application/pdf;base64,", "");

      // حفظ الملف
      await FileSystem.writeAsStringAsync(pdfPath, pdfData, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return pdfPath;
    } catch (error) {
      console.error("خطأ في تحويل الصور إلى PDF:", error);
      throw new Error("فشل تحويل الصور إلى PDF");
    }
  }

  /**
   * تحويل الصورة إلى Base64
   */
  static async imageToBase64(imageUri: string): Promise<string> {
    try {
      // إذا كانت الصورة من الويب
      if (imageUri.startsWith("http")) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      // إذا كانت الصورة محلية
      if (Platform.OS !== "web") {
        const fileContent = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return fileContent;
      }

      // على الويب
      return imageUri;
    } catch (error) {
      console.error("خطأ في تحويل الصورة إلى Base64:", error);
      throw new Error("فشل تحويل الصورة");
    }
  }

  /**
   * إضافة علامة مائية إلى PDF
   */
  static addWatermarkToPDF(pdf: jsPDF, watermarkText: string): void {
    try {
      const pageCount = pdf.getNumberOfPages();
      const pageSize = pdf.internal.pageSize;
      const pageWidth = pageSize.getWidth();
      const pageHeight = pageSize.getHeight();

      // إضافة علامة مائية إلى كل صفحة
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFont("Arial");
        pdf.setFontSize(60);
        pdf.setTextColor(200, 200, 200);
        (pdf as any).setGState(new (pdf as any).GState({ opacity: 0.3 }));

        // كتابة النص بزاوية
        pdf.text(watermarkText, pageWidth / 2, pageHeight / 2, {
          align: "center",
          angle: 45,
        });

        (pdf as any).setGState(new (pdf as any).GState({ opacity: 1 }));
      }
    } catch (error) {
      console.error("خطأ في إضافة العلامة المائية:", error);
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
   * دمج عدة ملفات PDF
   */
  static async mergePDFs(pdfPaths: string[], outputFileName: string): Promise<string> {
    try {
      // في التطبيق الحقيقي، ستستخدم مكتبة دمج PDF
      // للآن، نعيد أول ملف
      return pdfPaths[0];
    } catch (error) {
      console.error("خطأ في دمج ملفات PDF:", error);
      throw new Error("فشل دمج ملفات PDF");
    }
  }

  /**
   * تقسيم ملف PDF
   */
  static async splitPDF(
    pdfPath: string,
    pageNumbers: number[]
  ): Promise<string> {
    try {
      // في التطبيق الحقيقي، ستستخدم مكتبة تقسيم PDF
      // للآن، نعيد نفس الملف
      return pdfPath;
    } catch (error) {
      console.error("خطأ في تقسيم ملف PDF:", error);
      throw new Error("فشل تقسيم ملف PDF");
    }
  }
}
