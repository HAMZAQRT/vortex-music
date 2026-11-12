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
    title: "Alls Fair In Love",
    artist: "FreePD",
    album: "Vortex FreePD Collection",
    duration: 0,
    color: "from-violet-500 to-indigo-900",
    audioSrc: "/audio/alls-fair-in-love.mp3",
  },
  {
    id: "neon-dreams",
    title: "Attic Secrets",
    artist: "FreePD",
    album: "Vortex FreePD Collection",
    duration: 0,
    color: "from-fuchsia-500 to-purple-900",
    audioSrc: "/audio/attic-secrets.mp3",
  },
  {
    id: "after-dark",
    title: "Barnville",
    artist: "FreePD",
    album: "Vortex FreePD Collection",
    duration: 0,
    color: "from-cyan-500 to-blue-900",
    audioSrc: "/audio/barnville.mp3",
  },
  {
    id: "gravity",
    title: "Baltic Levity",
    artist: "FreePD",
    album: "Vortex FreePD Collection",
    duration: 0,
    color: "from-orange-500 to-rose-900",
    audioSrc: "/audio/baltic-levity.mp3",
  },
];
