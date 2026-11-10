import AppShell from "../../components/AppShell";
import LibraryDashboard from "../../components/library/LibraryDashboard";
import PlaylistManager from "../../components/library/PlaylistManager";

export default function LibraryPage() {
  return (
    <AppShell>
      <header className="py-6">
        <p className="text-xs font-black tracking-[0.35em] text-violet-400">
          YOUR VORTEX
        </p>

        <h1 className="mt-1 text-3xl font-black">
          Library
        </h1>

        <p className="mt-2 text-sm text-white/35">
          Music and artists that belong to your world.
        </p>
      </header>

      <LibraryDashboard />
      <PlaylistManager />
    </AppShell>
  );
}
