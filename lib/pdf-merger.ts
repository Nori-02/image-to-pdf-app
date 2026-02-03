import { PDFDocument } from "pdf-lib";
import * as FileSystem from "expo-file-system/legacy";

export interface PDFMergeOptions {
  outputFileName?: string;
  removeBlankPages?: boolean;
}

/**
 * خدمة دمج ملفات PDF المتعددة
 */
export class PDFMerger {
  /**
   * دمج عدة ملفات PDF في ملف واحد
   */
  static async mergePDFs(
    pdfPaths: string[],
    options: PDFMergeOptions = {}
  ): Promise<string> {
    try {
      if (pdfPaths.length === 0) {
        throw new Error("لا توجد ملفات PDF للدمج");
      }

      if (pdfPaths.length === 1) {
        // إذا كان هناك ملف واحد فقط، أرجع نسخة منه
        const fileName = options.outputFileName || `merged-${Date.now()}.pdf`;
        const outputPath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({
          from: pdfPaths[0],
          to: outputPath,
        });
        return outputPath;
      }

      // إنشاء مستند PDF جديد
      const mergedPdf = await PDFDocument.create();

      // دمج جميع ملفات PDF
      for (const pdfPath of pdfPaths) {
        try {
          // قراءة الملف
          const pdfData = await FileSystem.readAsStringAsync(pdfPath, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // تحويل Base64 إلى Uint8Array
          const binaryString = atob(pdfData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // تحميل المستند
          const pdfToMerge = await PDFDocument.load(bytes);

          // نسخ جميع الصفحات
          const pageIndices = pdfToMerge.getPageIndices();
          const copiedPages = await mergedPdf.copyPages(pdfToMerge, pageIndices);

          copiedPages.forEach((page: any) => {
            mergedPdf.addPage(page);
          });
        } catch (error) {
          console.error(`خطأ في معالجة الملف ${pdfPath}:`, error);
        }
      }

      // حفظ الملف المدمج
      const fileName = options.outputFileName || `merged-${Date.now()}.pdf`;
      const outputPath = `${FileSystem.documentDirectory}${fileName}`;

      const pdfBytes = await mergedPdf.save();
      const base64String = this.uint8ArrayToBase64(pdfBytes);

      await FileSystem.writeAsStringAsync(outputPath, base64String, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return outputPath;
    } catch (error) {
      console.error("خطأ في دمج ملفات PDF:", error);
      throw error;
    }
  }

  /**
   * دمج ملفات PDF مع الحفاظ على الترتيب
   */
  static async mergePDFsWithOrder(
    pdfPaths: string[],
    order: number[],
    options: PDFMergeOptions = {}
  ): Promise<string> {
    try {
      // ترتيب الملفات حسب الترتيب المطلوب
      const orderedPaths = order.map((i) => pdfPaths[i]);
      return this.mergePDFs(orderedPaths, options);
    } catch (error) {
      console.error("خطأ في دمج ملفات PDF المرتبة:", error);
      throw error;
    }
  }

  /**
   * تحويل Uint8Array إلى Base64
   */
  private static uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * الحصول على عدد الصفحات في ملف PDF
   */
  static async getPageCount(pdfPath: string): Promise<number> {
    try {
      const pdfData = await FileSystem.readAsStringAsync(pdfPath, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const binaryString = atob(pdfData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pdf = await PDFDocument.load(bytes);
      return pdf.getPageCount();
    } catch (error) {
      console.error("خطأ في الحصول على عدد الصفحات:", error);
      return 0;
    }
  }
}
