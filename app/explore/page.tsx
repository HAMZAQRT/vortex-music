import AppShell from "../../components/AppShell";

const genres = [
  ["Pop", "from-pink-500 to-red-700"],
  ["Arabic", "from-amber-400 to-orange-800"],
  ["Electronic", "from-cyan-400 to-blue-800"],
  ["Hip-Hop", "from-violet-500 to-purple-950"],
  ["Chill", "from-emerald-400 to-teal-900"],
  ["Rock", "from-red-500 to-neutral-900"],
];

export default function ExplorePage() {
  return (
    <AppShell>
      <header className="py-6">
        <p className="text-xs font-black tracking-[0.35em] text-violet-400">
          VORTEX
        </p>
        <h1 className="mt-1 text-3xl font-black">Explore</h1>
        <p className="mt-2 text-sm text-white/40">
          Find your next sound.
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white/50">
        ⌕ Search songs, artists, albums and playlists
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-bold">Browse genres</h2>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {genres.map(([name, color]) => (
            <article
              key={name}
              className={`h-28 overflow-hidden rounded-3xl bg-gradient-to-br ${color} p-4`}
            >
              <h3 className="text-lg font-black">{name}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-9">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
          Global
        </p>
        <h2 className="mt-1 text-xl font-bold">Top charts</h2>

        <div className="mt-4 space-y-2">
          {["Midnight Echo", "Neon Dreams", "After Dark", "Gravity"].map(
            (track, index) => (
              <div
                key={track}
                className="flex items-center gap-4 rounded-2xl p-3 hover:bg-white/5"
              >
                <span className="w-5 text-white/30">{index + 1}</span>

                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-900" />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{track}</p>
                  <p className="text-sm text-white/40">Vortex Artist</p>
                </div>

                <button aria-label={`Play ${track}`}>▶</button>
              </div>
            ),
          )}
        </div>
      </section>
    </AppShell>
  );
}
