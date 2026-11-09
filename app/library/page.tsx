import AppShell from "../../components/AppShell";

const libraryItems = [
  ["♥", "Liked Songs", "42 songs"],
  ["♫", "Your Playlists", "8 playlists"],
  ["▣", "Albums", "12 saved"],
  ["◉", "Artists", "18 following"],
  ["↺", "History", "Recently played"],
];

export default function LibraryPage() {
  return (
    <AppShell>
      <header className="py-6">
        <p className="text-xs font-black tracking-[0.35em] text-violet-400">
          YOUR VORTEX
        </p>
        <h1 className="mt-1 text-3xl font-black">Library</h1>
      </header>

      <section className="space-y-2">
        {libraryItems.map(([icon, title, subtitle]) => (
          <article
            key={title}
            className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4"
          >
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-600/40 to-blue-600/20 text-xl text-violet-300">
              {icon}
            </div>

            <div className="flex-1">
              <h2 className="font-bold">{title}</h2>
              <p className="mt-1 text-sm text-white/40">{subtitle}</p>
            </div>

            <span className="text-white/20">›</span>
          </article>
        ))}
      </section>

      <button className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 py-4 font-bold">
        + Create playlist
      </button>
    </AppShell>
  );
}
