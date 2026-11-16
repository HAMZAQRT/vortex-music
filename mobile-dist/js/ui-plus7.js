/* eslint-disable */
(() => {
  const $ = (id) => document.getElementById(id);
  const audio = $("audio");
  const C = window.Capacitor;
  let P = null;
  try {
    if (C && C.isNativePlatform && C.isNativePlatform()) {
      P = (C.Plugins && C.Plugins.VortexPlayer) || C.registerPlugin("VortexPlayer");
    }
  } catch (e) {}
  if (!audio || !P) return;

  // When an app/server track starts on <audio>, hand it to the native player
  let handing = false;
  audio.addEventListener("play", async () => {
    if (handing) return;
    const src = audio.currentSrc || audio.src;
    if (!src || !src.startsWith("https://")) return;
    if (window.VortexUI && window.VortexUI.current && window.VortexUI.current()) return;
    handing = true;
    try {
      const pos = audio.currentTime || 0;
      const title = $("miniTitle").textContent || "Vortex";
      const artist = $("miniArtist").textContent || "";
      const m = document.querySelector(".mini-cover");
      const bg = m && m.style.backgroundImage ? m.style.backgroundImage.replace(/^url\(["']?|["']?\)$/g, "") : "";
      audio.pause();
      await P.setQueue({ items: [{ id: "srv:" + src, url: src, title, artist, artwork: bg }], startIndex: 0 });
      if (pos > 1) await P.seek({ position: pos * 1000 });
      await P.play();
    } catch (e) {
      audio.play().catch(() => {});
    }
    setTimeout(() => { handing = false; }, 800);
  });
})();
