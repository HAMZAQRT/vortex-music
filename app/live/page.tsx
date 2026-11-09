import AppShell from "../../components/AppShell";

const rooms = [
  ["Vortex Night", "2.8K listening", "from-red-500 to-purple-950"],
  ["Arabic Hits", "1.7K listening", "from-orange-500 to-rose-950"],
  ["Midnight Club", "936 listening", "from-blue-500 to-indigo-950"],
  ["Chill Together", "721 listening", "from-cyan-500 to-teal-950"],
];

export default function LivePage() {
  return (
    <AppShell>
      <header className="flex items-end justify-between py-6">
        <div>
          <p className="flex items-center gap-2 text-xs font-black tracking-[0.3em] text-red-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            VORTEX LIVE
          </p>

          <h1 className="mt-1 text-3xl font-black">Live now</h1>
        </div>

        <button className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">
          + Go Live
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {rooms.map(([name, listeners, color]) => (
          <article
            key={name}
            className={`relative min-h-48 overflow-hidden rounded-[2rem] bg-gradient-to-br ${color} p-5`}
          >
            <span className="absolute right-4 top-4 rounded-full bg-black/30 px-3 py-1 text-xs font-bold backdrop-blur">
              ● LIVE
            </span>

            <div className="flex h-full min-h-36 flex-col justify-end">
              <h2 className="text-2xl font-black">{name}</h2>
              <p className="mt-1 text-sm text-white/60">{listeners}</p>

              <button className="mt-4 w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
                Join room
              </button>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
