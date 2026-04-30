"use client";

import { useState, useRef, useEffect, useCallback, SubmitEvent } from "react";
import { parseCodeManually, ParsedCode, processImage } from "@/lib/ocr";
import { TEAMS } from "@/types";

interface CameraScannerProps {
  onScan?: (result: {
    code: string;
    number: number;
    isDuplicate: boolean;
  }) => void;
}

export default function CameraScanner({ onScan }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ParsedCode | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [debugImage, setDebugImage] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "duplicate";
  } | null>(null);

  const [lastScannedCode, setLastScannedCode] = useState<string>("");
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera not supported");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setToast({ message: "Erro ao acessar câmera", type: "error" });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const captureAndProcess = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (isScanning || capturedImage) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== 4) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    setIsScanning(true);

    // 🔥 pega dimensões reais na tela
    const videoRect = video.getBoundingClientRect();
    const frameRect = frameRef.current!.getBoundingClientRect();

    // 🔥 escala (tela → resolução real do vídeo)
    const scaleX = canvas.width / videoRect.width;
    const scaleY = canvas.height / videoRect.height;

    // 🔥 posição do frame dentro do vídeo
    const cropX = (frameRect.left - videoRect.left + 10) * scaleX;
    const cropY = (frameRect.top - videoRect.top + 5) * scaleY;
    const cropWidth = frameRect.width * scaleX - 30;
    const cropHeight = frameRect.height * scaleY - 10;

    // 🔥 cria canvas de recorte
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;

    const cropCtx = cropCanvas.getContext("2d");

    if (!cropCtx) {
      setIsScanning(false);
      return;
    }

    cropCtx.drawImage(
      canvas,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );

    const imageBase64 = cropCanvas.toDataURL();

    setCapturedImage(imageBase64);
    setDebugImage(imageBase64);

    try {
      const data = await processImage(cropCanvas);

      if (!data || !data.fullCode) {
        setIsScanning(false);
        return;
      }

      // 🔥 já vem pronto do backend
      const result = {
        code: data.code,
        number: data.number,
        fullCode: data.fullCode,
        confidence: data.confidence,
      };

      // valida segurança (extra)
      if (!result.fullCode) {
        setIsScanning(false);
        return;
      }

      // evita repetir leitura
      if (result.fullCode === lastScannedCode) {
        setIsScanning(false);
        return;
      }

      setScanResult(result);

      // 🔥 resto do fluxo permanece igual
      const checkRes = await fetch("/api/stickers/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullCode: result.fullCode }),
      });

      if (!checkRes.ok) {
        throw new Error("Failed to check duplicate");
      }

      const { isDuplicate } = await checkRes.json();
      setIsDuplicate(isDuplicate);

      await fetch("/api/stickers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: result.code,
          number: result.number,
          fullCode: result.fullCode,
          isDuplicate,
        }),
      });

      setLastScannedCode(result.fullCode);

      const team = TEAMS[result.code];
      const teamName = team?.name || result.code;

      setToast({
        message: isDuplicate
          ? `⚠️ ${teamName} #${result.number} - REPETIDA!`
          : `✅ ${teamName} #${result.number} salva!`,
        type: isDuplicate ? "duplicate" : "success",
      });

      onScan?.({
        code: result.code,
        number: result.number,
        isDuplicate,
      });

      setTimeout(() => {
        setScanResult(null);
        setLastScannedCode("");
      }, 2000);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.warn("OCR demorou demais (timeout)");
        return;
      }

      console.error("Scan error:", err);
    } finally {
      setIsScanning(false);
      setCapturedImage(null);
    }
  }, [isScanning, lastScannedCode, onScan]);

  const handleManualSubmit = async (
    e: SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    const result = parseCodeManually(manualCode);
    if (!result) {
      setToast({
        message: "Código inválido. Use formato: BRA12",
        type: "error",
      });
      return;
    }

    // Check for duplicate
    const checkRes = await fetch("/api/stickers/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullCode: result.fullCode }),
    });

    if (!checkRes.ok) {
      throw new Error("Failed to check duplicate");
    }

    const { isDuplicate } = await checkRes.json();
    // Save to database
    await fetch("/api/stickers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: result.code,
        number: result.number,
        fullCode: result.fullCode,
        isDuplicate,
      }),
    });

    const team = TEAMS[result.code];
    const teamName = team?.name || result.code;

    if (isDuplicate) {
      setToast({
        message: `⚠️ ${teamName} #${result.number} - REPETIDA!`,
        type: "duplicate",
      });
    } else {
      setToast({
        message: `✅ ${teamName} #${result.number} salva!`,
        type: "success",
      });
    }

    setManualCode("");
    setShowManualInput(false);
    onScan?.({
      code: result.code,
      number: result.number,
      isDuplicate: isDuplicate,
    });
  };

  const updatePreview = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || capturedImage) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== 4) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const videoRect = video.getBoundingClientRect();
    const frameRect = frameRef.current!.getBoundingClientRect();

    const scaleX = canvas.width / videoRect.width;
    const scaleY = canvas.height / videoRect.height;

    const cropX = (frameRect.left - videoRect.left + 10) * scaleX;
    const cropY = (frameRect.top - videoRect.top + 5) * scaleY;
    const cropWidth = frameRect.width * scaleX - 30;
    const cropHeight = frameRect.height * scaleY - 10;

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;

    const cropCtx = cropCanvas.getContext("2d");
    if (!cropCtx) return;

    cropCtx.drawImage(
      canvas,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );

    setDebugImage(cropCanvas.toDataURL());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updatePreview();
    }, 300); // 🔥 suave e leve

    return () => clearInterval(interval);
  }, [updatePreview]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (scanResult) {
      const timer = setTimeout(() => {
        setToast(null);
        setScanResult(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanResult]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isScanning && !capturedImage) {
        captureAndProcess();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [captureAndProcess, isScanning, capturedImage]);

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-background">
      {/* Instructions */}
      <div className="absolute top-8 left-4 right-4 text-center">
        <p className="text-white text-lg font-bold drop-shadow-lg">
          Aponte para o código na parte de trás da figurinha
        </p>
        {/* <p className="text-slate-300 text-xs mt-2 drop-shadow">
          Exemplo: BRA12, ARG10, FRA7
        </p> */}
      </div>

      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Canvas for processing (hidden) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Scan Frame Overlay */}
      <div className="scan-frame">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-secondary rounded-full animate-pulse" />
        <div className="h-full relative">
          <div
            ref={frameRef}
            className="h-8 w-20 border-2 border-secondary border-dashed absolute top-[18px] right-[18px] rounded-full"
          />
        </div>

        {/* Floating Scan Button */}
        {/* <button
          onClick={captureAndProcess}
          disabled={isScanning}
          className="fixed -bottom-10 left-1/2 -translate-x-1/2 z-50 w-16 h-16 rounded-full bg-secondary text-black shadow-lg flex items-center justify-center text-xl font-bold active:scale-95 transition"
        >
          {isScanning ? "..." : "📸"}
        </button> */}
      </div>

      {/* Scan Result Display */}
      {scanResult && (
        <div
          className={`absolute bottom-32 left-4 right-4 p-4 rounded-xl text-center ${
            isDuplicate
              ? "bg-accent/90 animate-shake"
              : "bg-green-600/90 animate-pulse-success"
          }`}
        >
          <div className="text-2xl font-bold font-mono">
            {scanResult.code}
            <span className="text-white">{scanResult.number}</span>
          </div>
          <div className="text-sm mt-1">
            {isDuplicate
              ? "⚠️ FIGURINHA REPETIDA!"
              : "✅ Nova figurinha salva!"}
          </div>
        </div>
      )}

      <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-3 px-4 pb-safe">
        {!showManualInput && (
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="px-6 py-2 bg-card/80 backdrop-blur text-white rounded-full text-sm hover:bg-card transition-colors"
          >
            {showManualInput ? "Fechar" : "Digitar código manualmente"}
          </button>
        )}

        {showManualInput && (
          <form
            onSubmit={(data) => handleManualSubmit(data)}
            className="flex gap-2"
          >
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="BRA12"
              className="flex-1 px-4 py-3 bg-card border border-slate-600 rounded-lg text-white font-mono text-lg uppercase placeholder:text-slate-500 focus:outline-none focus:border-secondary"
              maxLength={5}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-secondary text-background font-bold rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Salvar
            </button>
          </form>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 left-4 right-4 p-4 rounded-xl text-center z-50 ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "duplicate"
                ? "bg-accent"
                : "bg-red-600"
          }`}
          onClick={() => setToast(null)}
        >
          <p className="font-medium">{toast.message}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {isScanning && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {capturedImage && <div className="absolute inset-0 bg-black/40 z-40" />}

      {(capturedImage || debugImage) && (
        <img
          src={capturedImage || debugImage || undefined}
          className="absolute top-[13%] left-4 w-32 border rounded-md border-red-500 z-50 bg-black"
        />
      )}
    </div>
  );
}
