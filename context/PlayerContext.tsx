"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { tracks, type Track } from "../data/tracks";
import { useLibrary } from "./LibraryContext";
import { useDebug } from "./DebugContext";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { addToHistory } = useLibrary();
  const { log } = useDebug();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgressState] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");

  const currentTrack = tracks[currentIndex];

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setProgressState(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setCurrentIndex((index) =>
        index === tracks.length - 1 ? 0 : index + 1,
      );
      setProgressState(0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const shouldResume = !audio.paused;

    audio.src = currentTrack.audioSrc;
    audio.load();
    setProgressState(0);

    if (shouldResume) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentTrack.audioSrc]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.volume = volume / 100;
  }, [volume]);

  function togglePlay() {
    const audio = audioRef.current;

    if (!audio) {
      log(
        "error",
        "Audio element unavailable",
      );
      return;
    }

    if (audio.paused) {
      log(
        "player",
        "PLAY requested",
        {
          trackId:
            currentTrack.id,
        },
      );

      audio
        .play()
        .catch((error) => {
          setIsPlaying(false);

          log(
            "error",
            "Audio playback failed",
            {
              trackId:
                currentTrack.id,

              error:
                error instanceof Error
                  ? error.message
                  : String(
                      error,
                    ),
            },
          );
        });
    } else {
      log(
        "player",
        "PAUSE requested",
        {
          trackId:
            currentTrack.id,
        },
      );

      audio.pause();
    }
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

      addToHistory(
        track.id,
      );

      log(
        "player",
        "TRACK_CHANGE",
        {
          trackId:
            track.id,
          title:
            track.title,
          artist:
            track.artist,
        },
      );
    }
  }

  function setProgress(value: number) {
    const safeValue = Math.max(
      0,
      Math.min(value, currentTrack.duration),
    );

    setProgressState(safeValue);

    const audio = audioRef.current;

    if (audio) {
      audio.currentTime = safeValue;
    }

    log(
      "player",
      "SEEK",
      {
        trackId:
          currentTrack.id,
        position:
          safeValue,
      },
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
