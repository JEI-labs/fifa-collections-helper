"use client";

import { useEffect, useState } from "react";
import { Sticker } from "@/types";
import StickerCard from "@/components/StickerCard";
import Stats from "@/components/Stats";

export default function CollectionPage() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [stats, setStats] = useState({ total: 0, unique: 0, duplicates: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [filter, setFilter] = useState<"all" | "unique" | "duplicates">("all");

  const loadStickers = async () => {
    try {
      const [stickersRes, statsRes] = await Promise.all([
        fetch("/api/stickers"),
        fetch("/api/stickers/stats"),
      ]);

      if (!stickersRes.ok || !statsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const stickersData = await stickersRes.json();
      const statsData = await statsRes.json();

      setStickers(stickersData);
      setStats(statsData);
    } catch (err) {
      console.error("Error loading stickers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStickers();

    // Refresh every 5 seconds
    const interval = setInterval(loadStickers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/stickers/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      // Atualiza lista após delete
      loadStickers();
    } catch (err) {
      console.error("Error deleting sticker:", err);
    }
  };

  const filteredStickers = stickers.filter((sticker) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      sticker.code.toLowerCase().includes(searchLower) ||
      sticker.full_code.toLowerCase().includes(searchLower) ||
      sticker.number.toString().includes(searchLower);

    const matchesFilter =
      filter === "all" ||
      (filter === "duplicates" && sticker.is_duplicate) ||
      (filter === "unique" && !sticker.is_duplicate);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Minha Coleção</h1>

        {/* Stats */}
        <Stats
          total={stats.total}
          unique={stats.unique}
          duplicates={stats.duplicates}
        />

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar figurinha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-card border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-secondary"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="flex gap-2 mt-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === "all" ? "bg-secondary text-black" : "bg-card text-white"
          }`}
        >
          Todas
        </button>

        <button
          onClick={() => setFilter("unique")}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === "unique"
              ? "bg-secondary text-black"
              : "bg-card text-white"
          }`}
        >
          Únicas
        </button>

        <button
          onClick={() => setFilter("duplicates")}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === "duplicates"
              ? "bg-secondary text-black"
              : "bg-card text-white"
          }`}
        >
          Repetidas
        </button>
      </div>

      {/* Sticker Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredStickers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-slate-400 text-lg">
            {searchTerm
              ? "Nenhuma figurinha encontrada"
              : "Nenhuma figurinha salva ainda"}
          </p>
          <p className="text-slate-500 text-sm mt-2">
            {searchTerm
              ? "Tente buscar por outro código"
              : "Use a câmera para escanear suas figurinhas"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredStickers.map((sticker) => (
            <StickerCard
              key={sticker.id}
              sticker={sticker}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
