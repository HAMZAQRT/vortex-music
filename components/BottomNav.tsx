"use client";

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
  function navigate(
    href: string,
  ) {
    window.location.assign(
      href,
    );
  }

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-[9999] bg-[#09090c] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
    >
      <div className="mx-auto grid max-w-xl grid-cols-4">

        {items.map(
          (item) => (
            <button
              key={
                item.href
              }
              type="button"
              onClick={() =>
                navigate(
                  item.href,
                )
              }
              className="flex min-h-[72px] touch-manipulation flex-col items-center justify-center gap-1 text-white/55 active:bg-white/10 active:text-white"
              aria-label={
                item.label
              }
            >
              <span className="text-2xl leading-none">
                {item.icon}
              </span>

              <span className="text-xs font-bold">
                {item.label}
              </span>
            </button>
          ),
        )}

      </div>
    </nav>
  );
}
