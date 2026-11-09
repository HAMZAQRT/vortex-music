"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", icon: "⌂", label: "Home" },
  { href: "/search", icon: "⌕", label: "Search" },
  { href: "/live", icon: "◉", label: "Live" },
  { href: "/library", icon: "♫", label: "Library" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#09090c]/95 px-4 pb-3 pt-2 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-16 flex-col items-center gap-1 text-xs transition ${
                active ? "text-violet-400" : "text-white/40"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
