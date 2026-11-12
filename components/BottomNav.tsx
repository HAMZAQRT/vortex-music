"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/",
    icon: "⌂",
    label: "Home",
  },
  {
    href: "/explore",
    icon: "⌕",
    label: "Explore",
  },
  {
    href: "/live",
    icon: "◉",
    label: "Live",
  },
  {
    href: "/library",
    icon: "♫",
    label: "Library",
  },
] as const;

export default function BottomNav() {
  const pathname =
    usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-[9999] border-t border-white/5 bg-[#09090c]/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl"
    >
      <div className="mx-auto grid max-w-xl grid-cols-4">
        {items.map(
          (item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname ===
                    item.href ||
                  pathname.startsWith(
                    `${item.href}/`,
                  );

            return (
              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                className={`relative flex min-h-[72px] touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl ${
                  active
                    ? "text-white"
                    : "text-white/45"
                }`}
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
              >
                {active && (
                  <span className="absolute top-0 h-1 w-8 rounded-full bg-violet-500" />
                )}

                <span className="text-2xl leading-none">
                  {
                    item.icon
                  }
                </span>

                <span className="text-xs font-bold">
                  {
                    item.label
                  }
                </span>
              </Link>
            );
          },
        )}
      </div>
    </nav>
  );
}
