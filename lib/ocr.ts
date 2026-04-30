import Tesseract from "tesseract.js";

export interface ParsedCode {
  code: string;
  number: number;
  fullCode: string;
  confidence: number;
}

const VALID_CODES = [
  // Grupo A
  "MEX",
  "RSA",
  "KOR",
  "CZE",

  // Grupo B
  "CAN",
  "BIH",
  "QAT",
  "SUI",

  // Grupo C
  "BRA",
  "MAR",
  "HAI",
  "SCO",

  // Grupo D
  "USA",
  "PAR",
  "AUS",
  "TUR",

  // Grupo E
  "GER",
  "CUW",
  "CIV",
  "ECU",

  // Grupo F
  "NED",
  "JPN",
  "SWE",
  "TUN",

  // Grupo G
  "BEL",
  "EGY",
  "IRN",
  "NZL",

  // Grupo H
  "ESP",
  "CPV",
  "KSA",
  "URU",

  // Grupo I
  "FRA",
  "SEN",
  "IRQ",
  "NOR",

  // Grupo J
  "ARG",
  "ALG",
  "AUT",
  "JOR",

  // Grupo K
  "POR",
  "COD",
  "UZB",
  "COL",

  // Grupo L
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
  let inputCanvas: HTMLCanvasElement;

  if (imageSource instanceof HTMLCanvasElement) {
    inputCanvas = preprocessCanvas(imageSource);
  } else {
    // fallback (caso venha video ou string)
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");

    if (!ctx) return null;

    tempCanvas.width = 300;
    tempCanvas.height = 150;

    ctx.drawImage(imageSource as any, 0, 0);

    inputCanvas = preprocessCanvas(tempCanvas);
  }

  const worker = await Tesseract.createWorker("eng");

  await worker.setParameters({
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  });

  const result = await worker.recognize(inputCanvas);

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

function preprocessCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return source;

  // 🔥 upscale (igual Python)
  const scale = 2.5;
  canvas.width = source.width * scale;
  canvas.height = source.height * scale;

  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 🔥 grayscale + invert
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;

    const inverted = 255 - gray;

    data[i] = inverted;
    data[i + 1] = inverted;
    data[i + 2] = inverted;
  }

  // 🔥 threshold simples (substitui adaptive)
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += data[i];
  }

  const avg = sum / (data.length / 4);

  for (let i = 0; i < data.length; i += 4) {
    const val = data[i] > avg ? 255 : 0;

    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas;
}
