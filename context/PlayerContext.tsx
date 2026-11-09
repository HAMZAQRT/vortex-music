"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { tracks, type Track } from "../data/tracks";

type RepeatMode = "off" | "all" | "one";

type PlayerContextValue = {
  queue: Track[];
  currentTrack: Track;
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  playTrack: (track: Track) => void;
  setProgress: (value: number) => void;
  setVolume: (value: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgressState] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");

  const currentTrack = tracks[currentIndex];

  function togglePlay() {
    setIsPlaying((value) => !value);
  }

  function next() {
    setCurrentIndex((index) => {
      if (shuffle) {
        return Math.floor(Math.random() * tracks.length);
      }

      if (index === tracks.length - 1) {
        return repeat === "all" ? 0 : index;
      }

      return index + 1;
    });

    setProgressState(0);
    setIsPlaying(true);
  }

  function previous() {
    if (progress > 5) {
      setProgressState(0);
      return;
    }

    setCurrentIndex((index) =>
      index === 0 ? tracks.length - 1 : index - 1,
    );

    setProgressState(0);
    setIsPlaying(true);
  }

  function playTrack(track: Track) {
    const index = tracks.findIndex((item) => item.id === track.id);

    if (index !== -1) {
      setCurrentIndex(index);
      setProgressState(0);
      setIsPlaying(true);
    }
  }

  function setProgress(value: number) {
    setProgressState(
      Math.max(0, Math.min(value, currentTrack.duration)),
    );
  }

  function setVolume(value: number) {
    setVolumeState(Math.max(0, Math.min(value, 100)));
  }

  function toggleShuffle() {
    setShuffle((value) => !value);
  }

  function cycleRepeat() {
    setRepeat((value) => {
      if (value === "off") return "all";
      if (value === "all") return "one";
      return "off";
    });
  }

  const value: PlayerContextValue = {
    queue: tracks,
    currentTrack,
    currentIndex,
    isPlaying,
    progress,
    volume,
    shuffle,
    repeat,
    togglePlay,
    next,
    previous,
    playTrack,
    setProgress,
    setVolume,
    toggleShuffle,
    cycleRepeat,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error(
      "usePlayer must be used inside PlayerProvider",
    );
  }

  return context;
}
