import LiveDashboard from "../../components/live/LiveDashboard";

export default function LivePage() {
  return (
    <>
      <header className="py-6">
        <p className="text-xs font-black tracking-[0.35em] text-red-400">
          VORTEX LIVE
        </p>

        <h1 className="mt-1 text-3xl font-black">
          Live Rooms
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-white/35">
          Listen together. Creator rooms and synchronized music are coming online.
        </p>
      </header>

      <LiveDashboard />
    </>
  );
}
