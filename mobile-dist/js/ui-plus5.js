(() => {
  const $ = (id) => document.getElementById(id);
  const UI = window.VortexUI;
  const audio = $("audio");
  const C = window.Capacitor;
  let P = null;
  try {
    if (C && C.isNativePlatform && C.isNativePlatform()) {
      P = (C.Plugins && C.Plugins.VortexPlayer) || C.registerPlugin("VortexPlayer");
    }
  } catch (e) {}
  if (!UI || !audio || !P) return;

  const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

  let nat = false, list = [], cur = 0, shown = -1, playing = false, dur = 0, dragging = false, shuf = false, rep = 0;

  const origCurrent = UI.current;
  UI.current = () => (nat ? list[cur] || null : origCurrent());

  window.VortexNativeHook = (arr, i, fallback) => {
    try {
      audio.pause();
      const items = arr.map((t) => ({
        id: "jam:" + t.id,
        url: t.audio,
        title: t.name,
        artist: t.artist_name,
        artwork: t.image || ""
      }));
      list = arr; cur = i; shown = -1; nat = true;
      P.setQueue({ items, startIndex: i })
        .then(() => P.play())
        .catch(() => { nat = false; fallback(); });
      return true;
    } catch (e) { return false; }
  };

  // if a local/app track starts, stop the native player
  audio.addEventListener("play", () => {
    if (nat) { nat = false; P.pause().catch(() => {}); }
  });

  function show(t) {
    $("miniPlayer").classList.add("show");
    $("miniTitle").textContent = t.name;
    $("miniArtist").textContent = t.artist_name;
    const bg = t.image ? `url("${t.image}")` : "";
    const m = document.querySelector(".mini-cover");
    if (m) { m.style.backgroundImage = bg; m.style.backgroundSize = "cover"; m.textContent = t.image ? "" : "V"; }
    $("fpTitle").textContent = t.name;
    $("fpArtist").textContent = t.artist_name;
    const c = $("fpCover");
    c.style.backgroundImage = bg;
    c.textContent = t.image ? "" : (t.name || "V")[0];
    const h = ls("vx.hist", []).filter((x) => x.id !== t.id);
    h.unshift(t);
    sv("vx.hist", h.slice(0, 20));
    const fav = ls("vx.fav", []).some((x) => x.id === t.id);
    $("fpLike").textContent = fav ? "♥" : "♡";
    $("fpLike").classList.toggle("on", fav);
  }

  setInterval(async () => {
    if (!nat) return;
    let s;
    try { s = await P.getState(); } catch { return; }
    playing = !!s.playing;
    dur = s.duration > 0 ? s.duration : 0;
    if (s.index >= 0 && s.index < list.length) cur = s.index;
    if (cur !== shown && list[cur]) { shown = cur; show(list[cur]); }
    $("pauseButton").textContent = playing ? "Ⅱ" : "▶";
    $("fpPlay").textContent = playing ? "⏸" : "▶";
    const pct = dur ? Math.min(100, (s.position / dur) * 100) : 0;
    $("miniProgress").style.width = pct + "%";
    if (!dragging) {
      $("fpSeek").value = pct;
      $("fpCur").textContent = fmt(s.position);
      $("fpDur").textContent = fmt(dur);
    }
  }, 500);

  const on = (id, ev, fn) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener(ev, (e) => {
      if (!nat) return;
      e.stopImmediatePropagation();
      Promise.resolve(fn(e)).catch(() => {});
    }, true);
  };
  const toggle = () => (playing ? P.pause() : P.play());
  on("pauseButton", "click", toggle);
  on("fpPlay", "click", toggle);
  on("nextButton", "click", () => P.next());
  on("fpNext", "click", () => P.next());
  on("previousButton", "click", () => P.previous());
  on("fpPrev", "click", () => P.previous());
  on("fpSeek", "input", () => { dragging = true; });
  on("fpSeek", "change", () => {
    if (dur > 0) P.seek({ position: ($("fpSeek").value / 100) * dur });
    dragging = false;
  });
  on("fpShuf", "click", () => {
    shuf = !shuf;
    $("fpShuf").classList.toggle("on", shuf);
    return P.setShuffle({ enabled: shuf });
  });
  on("fpRep", "click", () => {
    rep = (rep + 1) % 3;
    $("fpRep").classList.toggle("on", rep > 0);
    $("fpRep").textContent = rep === 2 ? "🔂" : "↻";
    return P.setRepeat({ mode: ["off", "all", "one"][rep] });
  });
})();
