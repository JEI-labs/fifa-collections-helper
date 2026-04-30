import Tesseract from "tesseract.js";

// Regex pattern to match team codes like BRA12, ARG10, FRA7
// 2-3 uppercase letters followed by 1-2 digits
const CODE_PATTERN = /\b([A-Z]{3})\s?(\d{1,2})\b/g;

export interface ParsedCode {
  code: string;
  number: number;
  fullCode: string;
  confidence: number;
}

export async function processImage(
  imageSource: string | HTMLVideoElement | HTMLCanvasElement,
): Promise<ParsedCode | null> {
  try {
    const worker = await Tesseract.createWorker("eng");

    worker.setParameters({
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
    });

    const result = await Tesseract.recognize(imageSource, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    let text = result.data.text;

    console.log("RAW OCR:", text);

    text = text
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .replace(/\s+/g, "");

    text = text
      .replace(/O/g, "0")
      .replace(/I/g, "1")
      .replace(/Z(?=\d)/g, "2");

    console.log("CLEANED OCR:", text);

    const matches = text.matchAll(CODE_PATTERN);

    for (const match of matches) {
      const code = match[1];
      const number = parseInt(match[2], 10);

      return {
        code,
        number,
        fullCode: `${code}${number}`,
        confidence: result.data.confidence,
      };
    }

    return null;
  } catch (error) {
    console.error("OCR Error:", error);
    return null;
  }
}

export function parseCodeManually(input: string): ParsedCode | null {
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const match = cleaned.match(/^([A-Z]{2,3})(\d{1,2})$/);

  if (match) {
    return {
      code: match[1],
      number: parseInt(match[2], 10),
      fullCode: `${match[1]}${match[2]}`,
      confidence: 100,
    };
  }

  return null;
}

export function validateCode(fullCode: string): boolean {
  const pattern = CODE_PATTERN;
  return pattern.test(fullCode);
}
