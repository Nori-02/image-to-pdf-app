import * as FileSystem from "expo-file-system/legacy";

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
}

/**
 * خدمة استخراج النصوص من الصور باستخدام Vision API
 */
export class OCRService {
  /**
   * استخراج النصوص من صورة واحدة
   */
  static async extractTextFromImage(imagePath: string, language: string = "ar"): Promise<OCRResult> {
    try {
      // قراءة الصورة وتحويلها إلى Base64
      const imageData = await FileSystem.readAsStringAsync(imagePath, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // استدعاء Vision API (يجب أن يكون لديك مفتاح API)
      const response = await fetch("https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: imageData,
              },
              features: [
                {
                  type: "TEXT_DETECTION",
                  maxResults: 10,
                },
                {
                  type: "DOCUMENT_TEXT_DETECTION",
                  maxResults: 10,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.responses && data.responses[0].fullTextAnnotation) {
        const fullText = data.responses[0].fullTextAnnotation.text;
        const confidence = data.responses[0].fullTextAnnotation.confidence || 0.95;

        return {
          text: fullText,
          confidence,
          language,
        };
      }

      return {
        text: "",
        confidence: 0,
        language,
      };
    } catch (error) {
      console.error("خطأ في استخراج النصوص:", error);
      throw error;
    }
  }

  /**
   * استخراج النصوص من عدة صور
   */
  static async extractTextFromMultipleImages(
    imagePaths: string[],
    language: string = "ar"
  ): Promise<OCRResult[]> {
    const results: OCRResult[] = [];

    for (const imagePath of imagePaths) {
      try {
        const result = await this.extractTextFromImage(imagePath, language);
        results.push(result);
      } catch (error) {
        console.error(`خطأ في معالجة الصورة ${imagePath}:`, error);
        results.push({
          text: "",
          confidence: 0,
          language,
        });
      }
    }

    return results;
  }

  /**
   * دمج النصوص المستخرجة من عدة صور
   */
  static mergTexts(results: OCRResult[]): string {
    return results.map((r) => r.text).filter((t) => t.length > 0).join("\n\n");
  }

  /**
   * حفظ النصوص المستخرجة في ملف
   */
  static async saveExtractedText(text: string, fileName: string = "extracted_text.txt"): Promise<string> {
    try {
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, text, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      return filePath;
    } catch (error) {
      console.error("خطأ في حفظ النصوص:", error);
      throw error;
    }
  }
}
