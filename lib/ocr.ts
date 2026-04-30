import Tesseract from "tesseract.js";

// Regex pattern to match team codes like BRA12, ARG10, FRA7
// 2-3 uppercase letters followed by 1-2 digits
const CODE_PATTERN = /\b([A-Z]{3})(\d{1,2})\b/g;

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
    const result = await Tesseract.recognize(imageSource, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const text = result.data.text;
    console.log("OCR Result:", text);

    // Find all matches of the pattern
    const matches = text.matchAll(CODE_PATTERN);

    let bestMatch: ParsedCode | null = null;
    let highestConfidence = 0;

    for (const match of matches) {
      const code = match[1];
      const number = parseInt(match[2], 10);
      const fullCode = `${code}${number}`;

      // Calculate confidence based on text confidence and match quality
      const confidence = result.data.confidence;

      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        bestMatch = {
          code,
          number,
          fullCode,
          confidence,
        };
      }
    }

    return bestMatch;
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
