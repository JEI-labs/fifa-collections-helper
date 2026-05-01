"use client";

import { Sticker, TEAMS } from "@/types";

interface StickerCardProps {
  sticker: Sticker;
  count: number;
  onDelete?: (id: string) => void;
}

export default function StickerCard({
  sticker,
  count,
  onDelete,
}: StickerCardProps) {
  const team = TEAMS[sticker.code];
  const teamName = team?.name || sticker.code;
  const flag = team?.flag ?? "";

  return (
    <div
      className={`relative sticker-card fade-in-up rounded-xl overflow-hidden select-none bg-[#4E8558] aspect-[3/4]
      ${count > 1 ? "border-2 border-yellow-400" : ""}
    `}
    >
      {/* FIFA World Cup trophy background */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        style={{ opacity: 0.07 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="w-4/5 object-contain" />
      </div>

      {/* Trash icon — top left */}
      {onDelete && (
        <button
          onClick={() => onDelete(sticker.id)}
          className="absolute top-1.5 left-1.5 bg-black/25 rounded-full w-4 h-4 flex items-center justify-center hover:bg-black/45 transition-colors z-10"
        >
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}

      {/* Sticker code — center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white font-black leading-none text-2xl drop-shadow">
          <span style={{ fontSize: "0.9em", opacity: 0.85 }}>
            {sticker.code}
          </span>
          {sticker.number}
        </span>
      </div>

      {/* Collected checkmark — top right */}
      <div className="absolute top-1.5 right-1.5 bg-white/90 rounded-full w-4 h-4 flex items-center justify-center shadow z-10">
        <svg
          className="w-2.5 h-2.5 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Country name + flag — bottom left */}
      <div className="absolute bottom-2 left-2 right-7 flex items-center gap-0.5">
        <span style={{ fontSize: "0.65rem" }}>{flag}</span>
        <span
          className="text-white font-bold tracking-wider uppercase leading-none truncate drop-shadow"
          style={{ fontSize: "0.5rem" }}
        >
          {teamName}
        </span>
      </div>

      {/* Duplicate count badge — bottom right */}
      {count > 1 && (
        <div
          className="absolute bottom-0 right-0 bg-yellow-400 text-black font-black rounded-tl-lg min-w-[20px] h-5 flex items-center justify-center px-1 shadow"
          style={{ fontSize: "0.5rem" }}
        >
          ×{count}
        </div>
      )}
    </div>
  );
}
