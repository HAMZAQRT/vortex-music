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
    name: "FreePD Collection",
    followers: "Public Domain",
    verified: true,
    color: "from-violet-500 to-indigo-950",
    bio: "Public-domain and CC0 audio selected for the Vortex music experience.",
  },
  {
    id: "luna",
    name: "FreePD Sessions",
    followers: "CC0 Audio",
    verified: true,
    color: "from-fuchsia-500 to-purple-950",
    bio: "A Vortex collection built from reusable FreePD audio sources.",
  },
  {
    id: "nova",
    name: "Vortex Open Audio",
    followers: "Licensed Media",
    verified: true,
    color: "from-cyan-500 to-blue-950",
    bio: "Open audio used to test and showcase the Vortex playback experience.",
  },
];

export const albums: Album[] = [
  {
    id: "night-signals",
    title: "FreePD Vol. 1",
    artistId: "vortex-originals",
    year: "Vortex",
    color: "from-violet-500 to-indigo-950",
    trackIds: [
      "midnight-echo",
      "neon-dreams",
    ],
  },
  {
    id: "electric-hearts",
    title: "FreePD Vol. 2",
    artistId: "luna",
    year: "Vortex",
    color: "from-fuchsia-500 to-purple-950",
    trackIds: [
      "after-dark",
      "gravity",
    ],
  },
  {
    id: "horizons",
    title: "Open Audio Collection",
    artistId: "nova",
    year: "Vortex",
    color: "from-cyan-500 to-blue-950",
    trackIds: [
      "midnight-echo",
      "after-dark",
      "gravity",
    ],
  },
];

export const playlists: Playlist[] = [
  {
    id: "daily-mix-01",
    title: "Vortex Mix",
    description: "The complete licensed Vortex audio collection.",
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
    title: "Open Night",
    description: "A public-domain mix built for the Vortex player.",
    color: "from-cyan-500 to-indigo-950",
    trackIds: [
      "after-dark",
      "midnight-echo",
      "neon-dreams",
    ],
  },
];
