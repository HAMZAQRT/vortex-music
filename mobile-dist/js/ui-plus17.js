/* eslint-disable */
(() => {
  const UI = window.VortexUI;
  if (!UI) return;
  const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const toast = (m) => { const t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2200); };

  // ---------- listening stats ----------
  let last = null;
  setInterval(() => {
    const c = UI.current && UI.current();
    if (!c || c.id === last) return;
    last = c.id;
    const s = ls("vx.stats", { n: 0, a: {}, t: {} });
    const a = c.artist_name || "Unknown";
    s.n++;
    s.a[a] = (s.a[a] || 0) + 1;
    const k = c.name + " - " + a;
    s.t[k] = (s.t[k] || 0) + 1;
    sv("vx.stats", s);
  }, 2500);

  const top = (o, n) => Object.keys(o).sort((x, y) => o[y] - o[x]).slice(0, n);
  const bg = document.createElement("div");
  bg.className = "sheet-bg";
  bg.innerHTML = '<div class="sheet"><h3>Your Wrapped</h3><div id="wrBody"></div><button class="row" id="wrClose">Close</button></div>';
  document.body.appendChild(bg);
  bg.addEventListener("click", (e) => { if (e.target === bg) bg.classList.remove("show"); });
  bg.querySelector("#wrClose").onclick = () => bg.classList.remove("show");
  const showWrapped = () => {
    const s = ls("vx.stats", { n: 0, a: {}, t: {} });
    const b = bg.querySelector("#wrBody");
    b.innerHTML = "";
    const add = (txt, big) => { const d = document.createElement("div"); d.style.cssText = big ? "font-size:34px;font-weight:1000;margin:6px 0" : "margin:6px 0;font-size:14px"; d.textContent = txt; b.appendChild(d); };
    add(s.n + " songs played", true);
    add("Top artists", false);
    top(s.a, 5).forEach((k, i) => add((i + 1) + ".  " + k + "  (" + s.a[k] + ")", false));
    add("Top songs", false);
    top(s.t, 5).forEach((k, i) => add((i + 1) + ".  " + k + "  (" + s.t[k] + ")", false));
    if (!s.n) add("Play some music and come back.", false);
    bg.classList.add("show");
  };
  const stats = document.querySelector(".pstats");
  if (stats) {
    const w = document.createElement("button");
    w.className = "playall";
    w.style.marginTop = "12px";
    w.textContent = "Your Wrapped";
    w.onclick = showWrapped;
    stats.after(w);
  }

  // ---------- share card ----------
  const draw = (t, img) => {
    const c = document.createElement("canvas");
    c.width = 1080; c.height = 1350;
    const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 1080, 1350);
    g.addColorStop(0, "#3b1d8f"); g.addColorStop(1, "#070709");
    x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
    x.save();
    x.beginPath();
    if (x.roundRect) x.roundRect(90, 140, 900, 900, 48); else x.rect(90, 140, 900, 900);
    x.clip();
    if (img) x.drawImage(img, 90, 140, 900, 900);
    else { const g2 = x.createLinearGradient(90, 140, 990, 1040); g2.addColorStop(0, "#7c3aed"); g2.addColorStop(1, "#ec4899"); x.fillStyle = g2; x.fillRect(90, 140, 900, 900); }
    x.restore();
    x.fillStyle = "#fff"; x.font = "bold 64px sans-serif";
    x.fillText((t.name || "").slice(0, 28), 90, 1130);
    x.fillStyle = "rgba(255,255,255,.65)"; x.font = "42px sans-serif";
    x.fillText((t.artist_name || "").slice(0, 36), 90, 1195);
    x.fillStyle = "#c4b5fd"; x.font = "bold 36px sans-serif";
    x.fillText("VORTEX", 90, 1290);
    return c;
  };
  const share = async (t, canvas) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { toast("Could not create the card"); return; }
      const f = new File([blob], "vortex.png", { type: "image/png" });
      try {
        if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], text: t.name + " - " + t.artist_name + " on Vortex" });
        else toast("Sharing images is not supported here");
      } catch (e) {}
    }, "image/png");
  };
  const makeCard = () => {
    const t = UI.current && UI.current();
    if (!t) { toast("Play a Jamendo or Audius song first"); return; }
    if (!t.image) { share(t, draw(t, null)); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { try { const c = draw(t, img); c.toDataURL(); share(t, c); } catch (e) { share(t, draw(t, null)); } };
    img.onerror = () => share(t, draw(t, null));
    img.src = t.image;
  };
  const extra = document.querySelector(".fp-extra");
  if (extra) {
    const b = document.createElement("button");
    b.textContent = "Card";
    b.onclick = makeCard;
    extra.appendChild(b);
  }
})();
