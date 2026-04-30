import Tesseract from "tesseract.js";

export interface ParsedCode {
  code: string;
  number: number;
  fullCode: string;
  confidence: number;
}

const VALID_CODES = [
  "MEX",
  "RSA",
  "KOR",
  "CZE",
  "CAN",
  "BIH",
  "QAT",
  "SUI",
  "BRA",
  "MAR",
  "HAI",
  "SCO",
  "USA",
  "PAR",
  "AUS",
  "TUR",
  "GER",
  "CUW",
  "CIV",
  "ECU",
  "NED",
  "JPN",
  "SWE",
  "TUN",
  "BEL",
  "EGY",
  "IRN",
  "NZL",
  "ESP",
  "CPV",
  "KSA",
  "URU",
  "FRA",
  "SEN",
  "IRQ",
  "NOR",
  "ARG",
  "ALG",
  "AUT",
  "JOR",
  "POR",
  "COD",
  "UZB",
  "COL",
  "ENG",
  "CRO",
  "GHA",
  "PAN",
];

function normalizeText(text: string) {
  let t = text.toUpperCase();

  t = t.replace(/\s+/g, "");
  t = t.replace(/[^A-Z0-9]/g, "");

  const replacements: Record<string, string> = {
    I: "1",
    L: "1",
    "|": "1",
    "!": "1",
    O: "0",
    Q: "0",
    G: "6",
    B: "8",
    S: "5",
  };

  for (const [k, v] of Object.entries(replacements)) {
    t = t.replaceAll(k, v);
  }

  return t;
}

function fixCode(code: string) {
  return VALID_CODES.find((c) => c === code) || null;
}

export async function processImage(
  imageSource: string | HTMLVideoElement | HTMLCanvasElement,
) {
  const worker = await Tesseract.createWorker("eng");

  await worker.setParameters({
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  });

  const result = await worker.recognize(imageSource);

  const raw = result.data.text;

  console.log("🧠 RAW OCR:", raw);

  const cleaned = normalizeText(raw);

  console.log("🧼 CLEANED:", cleaned);

  // 🔥 candidatos tipo python
  const candidates = cleaned.match(/[A-Z0-9]{4,6}/g) || [];

  console.log("🔎 CANDIDATES:", candidates);

  for (const c of candidates) {
    // 🔥 sliding window (CRÍTICO)
    for (let i = 0; i < c.length - 3; i++) {
      const sub = c.slice(i, i + 5);

      const match = sub.match(/^([A-Z0-9]{3})(\d{1,2})$/);
      if (!match) continue;

      const rawCode = match[1];
      const number = parseInt(match[2], 10);

      const fixed = fixCode(rawCode);

      if (fixed) {
        return {
          code: fixed,
          number,
          fullCode: `${fixed}${number}`,
          confidence: result.data.confidence,
        };
      }
    }
  }

  return null;
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
