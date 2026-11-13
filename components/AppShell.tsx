"use client";

import {
  Suspense,
  type ReactNode,
} from "react";

import {
  usePathname,
} from "next/navigation";

import BottomNav from "./BottomNav";
import MiniPlayer from "./MiniPlayer";

export default function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#070709] text-white">
          <div className="mx-auto max-w-6xl px-5">
            {children}
          </div>
        </main>
      }
    >
      <AppShellRuntime>
        {children}
      </AppShellRuntime>
    </Suspense>
  );
}

function AppShellRuntime({
  children,
}: {
  children: ReactNode;
}) {
  const pathname =
    usePathname();

  const authScreen =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith(
      "/forgot-password",
    ) ||
    pathname.startsWith(
      "/reset-password",
    );

  if (authScreen) {
    return <>{children}</>;
  }

  return (
    <main className="min-h-screen bg-[#070709] pb-56 text-white">

      <div className="mx-auto max-w-6xl px-5">
        {children}
      </div>

      <MiniPlayer />
      <BottomNav />

    </main>
  );
}
