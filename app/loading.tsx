export default function Loading() {
  return (
    <div className="grid min-h-[55vh] place-items-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />

        <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-white/30">
          Loading Vortex
        </p>
      </div>
    </div>
  );
}
