export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  color: string;
  audioSrc: string;
};

export const tracks: Track[] = [
  {
    id: "midnight-echo",
    title: "Midnight Echo",
    artist: "Vortex Originals",
    album: "Night Signals",
    duration: 224,
    color: "from-violet-500 to-indigo-900",
    audioSrc: "/audio/midnight-echo.mp3",
  },
  {
    id: "neon-dreams",
    title: "Neon Dreams",
    artist: "Luna",
    album: "Electric Hearts",
    duration: 198,
    color: "from-fuchsia-500 to-purple-900",
    audioSrc: "/audio/neon-dreams.mp3",
  },
  {
    id: "after-dark",
    title: "After Dark",
    artist: "Nova",
    album: "Horizons",
    duration: 241,
    color: "from-cyan-500 to-blue-900",
    audioSrc: "/audio/after-dark.mp3",
  },
  {
    id: "gravity",
    title: "Gravity",
    artist: "Vortex Collective",
    album: "Orbit",
    duration: 215,
    color: "from-orange-500 to-rose-900",
    audioSrc: "/audio/gravity.mp3",
  },
];
