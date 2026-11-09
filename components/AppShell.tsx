import type { ReactNode } from "react";
import BottomNav from "./BottomNav";
import MiniPlayer from "./MiniPlayer";

export default function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#070709] pb-40 text-white">
      <div className="mx-auto max-w-6xl px-5">
        {children}
      </div>

      <MiniPlayer />
      <BottomNav />
    </main>
  );
}
