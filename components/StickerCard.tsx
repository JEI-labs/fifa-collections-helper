"use client";

import { Sticker, TEAMS } from "@/types";

interface StickerCardProps {
  sticker: Sticker;
  onDelete?: (id: string) => void;
}

export default function StickerCard({ sticker, onDelete }: StickerCardProps) {
  const team = TEAMS[sticker.code];
  const flag = team?.flag || "🏳️";
  const teamName = team?.name || sticker.code;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`sticker-card bg-card rounded-xl p-4 relative fade-in-up ${
        sticker.is_duplicate
          ? "border-2 border-accent"
          : "border-2 border-transparent"
      }`}
    >
      {/* Duplicate Badge */}
      {sticker.is_duplicate && (
        <div className="absolute -top-3 bg-accent text-white text-[8px] font-semibold px-2 py-1 rounded-full">
          REPETIDA
        </div>
      )}

      {/* Flag & Code */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{flag}</span>
        <div>
          <div className="font-mono text-2xl font-bold text-secondary">
            {sticker.code}
            <span className="text-white">{sticker.number}</span>
          </div>
          <div className="text-xs text-slate-400">{teamName}</div>
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-xs text-slate-500">
        {formatDate(sticker.scanned_at)}
      </div>

      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={() => onDelete(sticker.id)}
          className="mt-2 w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
        >
          Excluir
        </button>
      )}
    </div>
  );
}
