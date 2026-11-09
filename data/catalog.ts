export type Artist = {
  id: string;
  name: string;
  followers: string;
  verified: boolean;
  color: string;
  bio: string;
};

export type Album = {
  id: string;
  title: string;
  artistId: string;
  year: string;
  color: string;
  trackIds: string[];
};

export type Playlist = {
  id: string;
  title: string;
  description: string;
  color: string;
  trackIds: string[];
};

export const artists: Artist[] = [
  {
    id: "vortex-originals",
    name: "Vortex Originals",
    followers: "124K",
    verified: true,
    color: "from-violet-500 to-indigo-950",
    bio: "Original sounds created for the Vortex universe.",
  },
  {
    id: "luna",
    name: "Luna",
    followers: "89K",
    verified: true,
    color: "from-fuchsia-500 to-purple-950",
    bio: "Electronic pop, neon nights and atmospheric sound.",
  },
  {
    id: "nova",
    name: "Nova",
    followers: "67K",
    verified: true,
    color: "from-cyan-500 to-blue-950",
    bio: "Future-facing electronic music and late-night energy.",
  },
];

export const albums: Album[] = [
  {
    id: "night-signals",
    title: "Night Signals",
    artistId: "vortex-originals",
    year: "2026",
    color: "from-violet-500 to-indigo-950",
    trackIds: ["midnight-echo"],
  },
  {
    id: "electric-hearts",
    title: "Electric Hearts",
    artistId: "luna",
    year: "2026",
    color: "from-fuchsia-500 to-purple-950",
    trackIds: ["neon-dreams"],
  },
  {
    id: "horizons",
    title: "Horizons",
    artistId: "nova",
    year: "2026",
    color: "from-cyan-500 to-blue-950",
    trackIds: ["after-dark"],
  },
];

export const playlists: Playlist[] = [
  {
    id: "daily-mix-01",
    title: "Daily Mix 01",
    description: "A personal mix of sounds from across Vortex.",
    color: "from-violet-500 to-blue-950",
    trackIds: [
      "midnight-echo",
      "neon-dreams",
      "after-dark",
      "gravity",
    ],
  },
  {
    id: "night-drive",
    title: "Night Drive",
    description: "Electronic sounds for the road after dark.",
    color: "from-cyan-500 to-indigo-950",
    trackIds: [
      "after-dark",
      "midnight-echo",
      "neon-dreams",
    ],
  },
];
