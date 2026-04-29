"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const isScannerActive = pathname === "/" || pathname === "/scanner";
  const isCollectionActive = pathname === "/collection";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-slate-700 z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <Link
          href="/scanner"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isScannerActive
              ? "text-secondary"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-xs mt-1 font-medium">Escanear</span>
        </Link>

        <Link
          href="/collection"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isCollectionActive
              ? "text-secondary"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span className="text-xs mt-1 font-medium">Coleção</span>
        </Link>
      </div>
    </nav>
  );
}
