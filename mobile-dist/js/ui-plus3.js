/* eslint-disable */
(() => {
  const $ = (id) => document.getElementById(id);
  const audio = $("audio");
  if (!audio) return;
  const ms = navigator.mediaSession;

  function meta() {
    if (!ms || typeof MediaMetadata === "undefined") return;
    const m = document.querySelector(".mini-cover");
    const bg = m && m.style.backgroundImage ? m.style.backgroundImage.replace(/^url\(["']?|["']?\)$/g, "") : "";
    try {
      ms.metadata = new MediaMetadata({
        title: $("miniTitle").textContent || "Vortex",
        artist: $("miniArtist").textContent || "",
        artwork: bg ? [{ src: bg, sizes: "300x300", type: "image/jpeg" }] : []
      });
    } catch (e) {}
  }

  if (ms) {
    ms.setActionHandler("play", () => audio.play());
    ms.setActionHandler("pause", () => audio.pause());
    ms.setActionHandler("nexttrack", () => $("nextButton").click());
    ms.setActionHandler("previoustrack", () => $("previousButton").click());
    ms.setActionHandler("seekto", (d) => { if (d.seekTime != null) audio.currentTime = d.seekTime; });
    audio.addEventListener("play", () => { ms.playbackState = "playing"; setTimeout(meta, 150); });
    audio.addEventListener("pause", () => { ms.playbackState = "paused"; });
    audio.addEventListener("loadedmetadata", meta);
  }

  // keep audio going when the app is hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !audio.paused) setTimeout(() => { if (audio.paused) audio.play().catch(() => {}); }, 300);
  });

  // volume-safe: resume after audio focus loss from short interruptions
  audio.addEventListener("error", () => {
    setTimeout(() => { if (audio.src) { const t = audio.currentTime; audio.load(); audio.currentTime = t; audio.play().catch(() => {}); } }, 1500);
  });
})();
