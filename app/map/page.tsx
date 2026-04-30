"use client";

import dynamic from "next/dynamic";

const TradeMap = dynamic(() => import("@/components/TradeMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "calc(100dvh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #002776 0%, #0f172a 100%)",
        gap: "16px",
      }}
    >
      <span style={{ fontSize: "52px" }}>⚽</span>
      <div
        style={{
          color: "#FFDF00",
          fontWeight: 700,
          fontSize: "16px",
          letterSpacing: "0.5px",
        }}
      >
        Carregando o mapa…
      </div>
      <div
        style={{
          width: "48px",
          height: "4px",
          background: "rgba(255,255,255,0.15)",
          borderRadius: "2px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "40%",
            background: "#FFDF00",
            borderRadius: "2px",
            animation: "mapLoading 1.2s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  ),
});

export default function MapPage() {
  return <TradeMap />;
}
