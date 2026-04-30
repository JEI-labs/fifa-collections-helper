"use client";

import { TEAMS } from "@/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

interface Trader {
  id: string;
  name: string;
  lat: number;
  lng: number;
  stickers: string[];
  distance?: number;
}

const MOCK_TRADERS: Trader[] = [
  {
    id: "1",
    name: "Carlos S.",
    lat: -23.5605,
    lng: -46.6533,
    stickers: ["BRA10", "ARG5", "FRA3", "GER7"],
  },
  {
    id: "2",
    name: "Maria F.",
    lat: -23.5455,
    lng: -46.6233,
    stickers: ["BRA10", "GER7", "ESP2", "POR1"],
  },
  {
    id: "3",
    name: "João P.",
    lat: -23.5705,
    lng: -46.6133,
    stickers: ["BRA10", "ITA1", "POR8", "ARG3"],
  },
  {
    id: "4",
    name: "Ana L.",
    lat: -23.5355,
    lng: -46.6433,
    stickers: ["ESP5", "FRA8", "BRA10", "USA2"],
  },
  {
    id: "5",
    name: "Pedro M.",
    lat: -23.5805,
    lng: -46.6333,
    stickers: ["BRA12", "BRA10", "GER4", "ENG9"],
  },
  {
    id: "6",
    name: "Lucas R.",
    lat: -23.5505,
    lng: -46.6633,
    stickers: ["ARG10", "BRA10", "FRA6", "ITA3"],
  },
  {
    id: "7",
    name: "Fernanda T.",
    lat: -23.5655,
    lng: -46.6483,
    stickers: ["BRA10", "MEX5", "JPN2", "KOR7"],
  },
  {
    id: "8",
    name: "Roberto C.",
    lat: -23.5405,
    lng: -46.6083,
    stickers: ["BRA10", "ARG8", "ENG3", "FRA4"],
  },
  {
    id: "9",
    name: "Beatriz N.",
    lat: -23.5255,
    lng: -46.6583,
    stickers: ["BRA5", "ARG5", "URU2", "COL4"],
  },
  {
    id: "10",
    name: "Diego A.",
    lat: -23.5755,
    lng: -46.6383,
    stickers: ["BRA10", "MEX3", "USA5", "CAN1"],
  },
];

const DEFAULT_RADIUS_KM = 10;

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

function getTeamFlag(stickerCode: string): string {
  const teamCode = stickerCode.replace(/\d+$/, "").toUpperCase();
  return TEAMS[teamCode]?.flag ?? "🏳️";
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  const prev = useRef<string | null>(null);
  useEffect(() => {
    if (!target) return;
    const key = `${target[0]},${target[1]}`;
    if (key === prev.current) return;
    prev.current = key;
    map.flyTo(target, 14, { animate: true, duration: 1.5 });
  }, [target, map]);
  return null;
}

export default function TradeMap() {
  const [search, setSearch] = useState("");
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [searchMode, setSearchMode] = useState<"default" | "code">("default");
  const [lastSearchedCode, setLastSearchedCode] = useState("");
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  const traderIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `<div style="width:44px;height:44px;background:linear-gradient(135deg,#009C3B,#00C24A);border:3px solid #FFDF00;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 20px rgba(0,156,59,0.55),0 0 0 3px rgba(255,223,0,0.2);"><span style="display:block;transform:rotate(45deg);text-align:center;line-height:38px;font-size:22px;">⚽</span></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -50],
      }),
    [],
  );

  const userIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;background:#002776;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 6px rgba(0,39,118,0.25),0 2px 10px rgba(0,0,0,0.35);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    [],
  );

  const runDefaultSearch = useCallback((pos: [number, number]) => {
    const results = MOCK_TRADERS.map((t) => ({
      ...t,
      distance: haversineKm(pos[0], pos[1], t.lat, t.lng),
    }))
      .filter((t) => (t.distance as number) <= DEFAULT_RADIUS_KM)
      .sort((a, b) => (a.distance as number) - (b.distance as number));
    setTraders(results);
    setSearchMode("default");
    setLastSearchedCode("");
  }, []);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError(true);
      return;
    }
    setGeoLoading(true);
    setGeoError(false);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos: [number, number] = [coords.latitude, coords.longitude];
        setUserPos(pos);
        setFlyTo(pos);
        setGeoLoading(false);
        setHasLocation(true);
      },
      () => {
        setGeoLoading(false);
        setGeoError(true);
      },
      { timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    if (userPos) runDefaultSearch(userPos);
  }, [userPos, runDefaultSearch]);

  const STICKER_REGEX = /^[A-Za-z]{2,3}\d{1,2}$/;
  const isValidCode = STICKER_REGEX.test(search.trim());

  const handleSearch = useCallback(() => {
    const code = search.trim().toUpperCase();
    if (!STICKER_REGEX.test(code)) return;
    const results = MOCK_TRADERS.filter((t) =>
      t.stickers.some((s) => s.toUpperCase().includes(code)),
    )
      .map((t) => ({
        ...t,
        distance: userPos
          ? haversineKm(userPos[0], userPos[1], t.lat, t.lng)
          : undefined,
      }))
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    setTraders(results);
    setSearchMode("code");
    setLastSearchedCode(code);
    if (results.length > 0) {
      setFlyTo([results[0].lat, results[0].lng]);
    }
  }, [search, userPos]);

  const handleClear = useCallback(() => {
    setSearch("");
    setLastSearchedCode("");
    if (userPos) {
      runDefaultSearch(userPos);
      setFlyTo(userPos);
    } else {
      setSearchMode("default");
    }
  }, [userPos, runDefaultSearch]);

  return (
    <div
      style={{
        height: "calc(100dvh - 64px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Search card (top overlay) ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
          padding: "12px 16px",
        }}
      >
        <div
          style={{
            background: "rgba(0,39,118,0.94)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: "20px",
            padding: "16px",
            boxShadow:
              "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,223,0,0.25)",
            maxWidth: "480px",
            margin: "0 auto",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <span style={{ fontSize: "32px", lineHeight: 1 }}>⚽</span>
            <div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "19px",
                  letterSpacing: "-0.3px",
                  lineHeight: 1.2,
                }}
              >
                Troca Figurinhas
              </div>
              <div
                style={{
                  color: "#FFDF00",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  marginTop: "2px",
                }}
              >
                🇧🇷 Copa do Mundo 2026
              </div>
            </div>
          </div>

          {/* Search row */}
          <div style={{ display: "flex", gap: "8px" }}>
            {/* Input with × */}
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Filtrar por código, ex: BRA10"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  border: "1.5px solid rgba(255,255,255,0.18)",
                  borderRadius: "12px",
                  padding:
                    search.length > 0 ? "13px 40px 13px 16px" : "13px 16px",
                  fontSize: "15px",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                  transition: "border-color 0.2s, background 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(255,223,0,0.55)";
                  e.target.style.background = "rgba(255,255,255,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.18)";
                  e.target.style.background = "rgba(255,255,255,0.1)";
                }}
              />
              {search.length > 0 && (
                <button
                  onClick={handleClear}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    borderRadius: "50%",
                    width: "22px",
                    height: "22px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "13px",
                    fontWeight: 700,
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              disabled={!isValidCode}
              style={{
                background: isValidCode
                  ? "linear-gradient(135deg, #009C3B, #00B347)"
                  : "rgba(255,255,255,0.1)",
                color: isValidCode ? "#fff" : "rgba(255,255,255,0.3)",
                border: "1.5px solid rgba(255,223,0,0.35)",
                borderRadius: "12px",
                padding: "13px 18px",
                fontSize: "20px",
                cursor: isValidCode ? "pointer" : "not-allowed",
                fontWeight: 700,
                boxShadow: isValidCode
                  ? "0 4px 14px rgba(0,156,59,0.4)"
                  : "none",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
              onMouseDown={(e) =>
                isValidCode && (e.currentTarget.style.transform = "scale(0.95)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              🔍
            </button>
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      <MapContainer
        center={[-23.5505, -46.6333]}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <FlyTo target={flyTo} />

        {userPos && (
          <Marker position={userPos} icon={userIcon}>
            <Popup>
              <div
                style={{
                  textAlign: "center",
                  padding: "6px 4px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "15px" }}>
                  📍 Você está aqui
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {traders.map((trader) => (
          <Marker
            key={trader.id}
            position={[trader.lat, trader.lng]}
            icon={traderIcon}
          >
            <Popup>
              <div
                style={{
                  minWidth: "220px",
                  fontFamily: "Inter, sans-serif",
                  padding: "4px 2px",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "16px",
                    marginBottom: "5px",
                    color: "#111",
                  }}
                >
                  👤 {trader.name}
                </div>
                {trader.distance !== undefined && (
                  <div
                    style={{
                      color: "#555",
                      fontSize: "13px",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        background: "#e8f5e9",
                        color: "#2e7d32",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      📍 {formatDistance(trader.distance)} de você
                    </span>
                  </div>
                )}
                <div style={{ fontSize: "13px", marginBottom: "12px" }}>
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: "7px",
                      color: "#333",
                    }}
                  >
                    🃏 Disponíveis para troca:
                  </div>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}
                  >
                    {trader.stickers.map((s) => (
                      <span
                        key={s}
                        style={{
                          background:
                            "linear-gradient(135deg, #e8f5e9, #f1f8e9)",
                          color: "#1b5e20",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 700,
                          fontFamily: "monospace",
                          border: "1px solid #c8e6c9",
                        }}
                      >
                        {getTeamFlag(s)} {s}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  disabled
                  style={{
                    width: "100%",
                    background: "#f5f5f5",
                    color: "#bbb",
                    border: "1px solid #e0e0e0",
                    borderRadius: "10px",
                    padding: "9px",
                    fontSize: "13px",
                    cursor: "not-allowed",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  💬 Em breve: Contatar
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── Results badge (bottom center) ── */}
      {hasLocation && (
        <div
          style={{
            position: "absolute",
            bottom: "68px",
            left: 0,
            right: 0,
            zIndex: 1001,
            padding: "0 16px",
          }}
        >
          <div
            style={{
              maxWidth: "420px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                flex: 1,
                background:
                  traders.length > 0
                    ? "linear-gradient(135deg, #009C3B, #007830)"
                    : "linear-gradient(135deg, #c62828, #b71c1c)",
                color: "#fff",
                borderRadius: "16px",
                padding: "12px 20px",
                textAlign: "center",
                fontWeight: 700,
                fontSize: "13px",
                boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,223,0,0.3)",
                letterSpacing: "0.1px",
              }}
            >
              {searchMode === "default"
                ? traders.length > 0
                  ? `📍 ${traders.length} colecionador${traders.length > 1 ? "es" : ""} perto de você (${DEFAULT_RADIUS_KM}km)`
                  : `😕 Nenhum colecionador encontrado em ${DEFAULT_RADIUS_KM}km`
                : traders.length > 0
                  ? `🃏 ${traders.length} ${traders.length === 1 ? "pessoa tem" : "pessoas têm"} "${lastSearchedCode}" para trocar!`
                  : `😕 Nenhuma troca encontrada para "${lastSearchedCode}"`}
            </div>

            {/* Clear filter button — only in code mode */}
            {searchMode === "code" && (
              <button
                onClick={handleClear}
                title="Voltar para busca padrão"
                style={{
                  background: "rgba(0,39,118,0.92)",
                  border: "1px solid rgba(255,223,0,0.35)",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  color: "#fff",
                  flexShrink: 0,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                  transition: "transform 0.15s",
                }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.9)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Location FAB (bottom right) ── */}
      <button
        onClick={getLocation}
        title="Usar minha localização"
        style={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          zIndex: 1001,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "#fff",
          border: "2px solid #e0e0e0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {geoLoading ? "⏳" : geoError ? "⚠️" : "📍"}
      </button>
    </div>
  );
}
