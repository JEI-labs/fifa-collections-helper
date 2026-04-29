'use client';

interface StatsProps {
  total: number;
  unique: number;
  duplicates: number;
}

export default function Stats({ total, unique, duplicates }: StatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-card rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-white">{total}</div>
        <div className="text-xs text-slate-400">Total</div>
      </div>
      <div className="bg-card rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-green-500">{unique}</div>
        <div className="text-xs text-slate-400">Únicas</div>
      </div>
      <div className="bg-card rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-accent">{duplicates}</div>
        <div className="text-xs text-slate-400">Repetidas</div>
      </div>
    </div>
  );
}