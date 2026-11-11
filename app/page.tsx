const tracks = [
  {
    title: "Midnight Echo",
    artist: "Vortex Originals",
    color: "from-violet-500 to-indigo-900",
  },
  {
    title: "Neon Dreams",
    artist: "Luna",
    color: "from-fuchsia-500 to-purple-900",
  },
  {
    title: "After Dark",
    artist: "Nova",
    color: "from-cyan-500 to-blue-900",
  },
];

const liveRooms = [
  {
    name: "Vortex Night",
    subtitle: "Electronic • Chill",
    listeners: "2.8K",
    color: "from-red-500 to-purple-950",
  },
  {
    name: "Arabic Hits",
    subtitle: "Music • Community",
    listeners: "1.7K",
    color: "from-orange-500 to-rose-950",
  },
];

export default function Home() {
  return (
    <>
      <div>

        <header className="flex items-center justify-between py-6">
          <div>
            <p className="text-xs font-black tracking-[0.35em] text-violet-400">
              VORTEX
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Good evening
            </h1>
          </div>

          <button
            aria-label="Profile"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/10 font-black backdrop-blur-xl"
          >
            V
          </button>
        </header>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-700 via-purple-900 to-blue-950 p-6 shadow-2xl shadow-violet-950/30">

          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-fuchsia-500/25 blur-3xl" />

          <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative z-10">
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              VORTEX EXCLUSIVE
            </span>

            <h2 className="mt-8 max-w-sm text-4xl font-black leading-tight">
              Music without boundaries.
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
              Discover music, artists and live experiences built around you.
            </p>

            <div className="mt-6 flex gap-3">
              <button className="rounded-full bg-white px-6 py-3 text-sm font-black text-black">
                ▶ Listen now
              </button>

              <button className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur">
                Explore
              </button>
            </div>
          </div>
        </section>

        <section className="mt-9">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-400">
                Discover
              </p>

              <h2 className="text-xl font-bold">
                Trending now
              </h2>
            </div>

            <button className="text-sm text-white/40">
              See all
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {tracks.map((track) => (
              <article key={track.title}>
                <div
                  className={`aspect-square rounded-2xl bg-gradient-to-br ${track.color} p-3 shadow-xl`}
                >
                  <div className="flex h-full items-end justify-between">
                    <span className="text-3xl font-black text-white/25">
                      V
                    </span>

                    <span className="grid h-8 w-8 place-items-center rounded-full bg-black/30 text-xs backdrop-blur">
                      ▶
                    </span>
                  </div>
                </div>

                <h3 className="mt-2 truncate text-sm font-semibold">
                  {track.title}
                </h3>

                <p className="truncate text-xs text-white/40">
                  {track.artist}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Live
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Happening now
              </h2>
            </div>

            <button className="text-sm text-white/40">
              Explore
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {liveRooms.map((room) => (
              <article
                key={room.name}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${room.color} p-5`}
              >
                <div className="absolute right-4 top-4 rounded-full bg-black/30 px-3 py-1 text-xs font-bold backdrop-blur">
                  ● LIVE
                </div>

                <div className="pt-14">
                  <h3 className="text-xl font-black">
                    {room.name}
                  </h3>

                  <p className="mt-1 text-sm text-white/60">
                    {room.subtitle}
                  </p>

                  <p className="mt-3 text-xs text-white/50">
                    {room.listeners} listening
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Your Vortex
            </p>

            <h2 className="text-xl font-bold">
              Made for you
            </h2>
          </div>

          <div className="space-y-2">
            {[
              ["Daily Mix 01", "Your favorite sounds", "from-violet-500 to-indigo-900"],
              ["Night Drive", "Made for late nights", "from-cyan-500 to-blue-900"],
              ["Discover Weekly", "Fresh picks for you", "from-pink-500 to-purple-900"],
            ].map(([title, subtitle, color]) => (
              <article
                key={title}
                className="flex items-center gap-4 rounded-2xl border border-transparent p-2 transition hover:border-white/5 hover:bg-white/5"
              >
                <div
                  className={`h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br ${color}`}
                />

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">
                    {title}
                  </h3>

                  <p className="truncate text-sm text-white/40">
                    {subtitle}
                  </p>
                </div>

                <button
                  aria-label={`Play ${title}`}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10"
                >
                  ▶
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
