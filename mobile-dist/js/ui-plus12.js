/* eslint-disable */
(() => {
  const $ = (id) => document.getElementById(id);
  const audio = $("audio");
  const mt = $("miniTitle");
  if (!audio || !mt) return;
  const toast = (m) => { const t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 1800); };

  // animated equalizer next to the title while playing
  const eq = document.createElement("span");
  eq.className = "eq";
  eq.innerHTML = "<i></i><i></i><i></i>";
  mt.before(eq);
  eq.style.display = "none";
  setInterval(() => {
    const pb = $("pauseButton");
    eq.style.display = pb && pb.textContent.trim() === "\u2161" ? "inline-flex" : "none";
  }, 600);

  // share current track
  const fp = document.querySelector(".fp-extra");
  if (fp) {
    const sh = document.createElement("button");
    sh.textContent = "Share";
    sh.onclick = async () => {
      const text = ($("miniTitle").textContent || "") + " - " + ($("miniArtist").textContent || "") + " on Vortex";
      try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); toast("Copied"); } } catch (e) {}
    };
    fp.appendChild(sh);
    const sp = document.createElement("button");
    sp.textContent = "Speed 1x";
    const speeds = [1, 1.25, 1.5, 0.75];
    let si = 0;
    sp.onclick = () => { si = (si + 1) % speeds.length; audio.playbackRate = speeds[si]; sp.textContent = "Speed " + speeds[si] + "x"; };
    fp.appendChild(sp);
  }

  // long press on a card to like
  const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const UI = window.VortexUI;
  document.addEventListener("contextmenu", (e) => { if (e.target.closest(".hcard,.jr")) e.preventDefault(); });
  let tm;
  document.addEventListener("touchstart", (e) => {
    const c = e.target.closest(".hcard,.jr");
    if (!c) return;
    tm = setTimeout(() => toast("Tip: open the player and tap the heart to save"), 700);
  }, { passive: true });
  ["touchend", "touchmove"].forEach((ev) => document.addEventListener(ev, () => clearTimeout(tm), { passive: true }));
})();
