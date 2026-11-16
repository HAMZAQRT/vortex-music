import {
  registerPlugin,
} from "@capacitor/core";

const NativePlayer =
  registerPlugin(
    "VortexPlayer"
  );

function mediaUrl(track) {
  return (
    track.localUrl ||
    track.src ||
    track.streamUrl ||
    track.remoteUrl ||
    ""
  );
}

function serialize(
  track
) {
  return {
    id:
      String(track.id),

    url:
      mediaUrl(track),

    title:
      track.title ||
      "",

    artist:
      track.artist ||
      "",

    artwork:
      track.cover ||
      track.coverUrl ||
      ""
  };
}

async function setQueue(
  tracks,
  startIndex = 0
) {
  const items =
    tracks
      .map(
        serialize
      )
      .filter(
        (track) =>
          Boolean(
            track.url
          )
      );

  if (!items.length) {
    throw new Error(
      "No playable tracks"
    );
  }

  await NativePlayer.setQueue({
    items,
    startIndex
  });
}

async function play() {
  return NativePlayer.play();
}

async function pause() {
  return NativePlayer.pause();
}

async function next() {
  return NativePlayer.next();
}

async function previous() {
  return NativePlayer.previous();
}

async function seek(
  position
) {
  return NativePlayer.seek({
    position
  });
}

async function shuffle(
  enabled
) {
  return NativePlayer.setShuffle({
    enabled
  });
}

async function repeat(
  mode
) {
  return NativePlayer.setRepeat({
    mode
  });
}

async function state() {
  return NativePlayer.getState();
}

window.VortexPlayer = {
  setQueue,
  play,
  pause,
  next,
  previous,
  seek,
  shuffle,
  repeat,
  state
};
