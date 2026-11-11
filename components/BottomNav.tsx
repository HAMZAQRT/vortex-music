const items = [
  {
    href: "/",
    icon: "⌂",
    label: "Home",
  },
  {
    href: "/search",
    icon: "⌕",
    label: "Search",
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
  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/5 bg-[#09090c]/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"
    >
      <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="relative z-[101] flex min-h-16 touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl text-white/45 active:bg-white/10 active:text-white"
          >
            <span className="text-2xl leading-none">
              {item.icon}
            </span>

            <span className="text-xs font-bold">
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}
