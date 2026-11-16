/* eslint-disable */
(() => {
  const $ = (id) => document.getElementById(id);
  const fp = document.querySelector(".fp");
  const audio = $("audio");
  if (!fp || !audio) return;
  const P = (() => { try { const C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() ? (C.Plugins && C.Plugins.VortexPlayer) || C.registerPlugin("VortexPlayer") : null; } catch { return null; } })();

  const row = document.createElement("div");
  row.className = "fp-extra";
  row.innerHTML = '<button id="fpSleep">Sleep: off</button>';
  fp.appendChild(row);

  const steps = [0, 15, 30, 60];
  let idx = 0, timer = null;
  $("fpSleep").onclick = () => {
    idx = (idx + 1) % steps.length;
    const m = steps[idx];
    clearTimeout(timer);
    const b = $("fpSleep");
    b.textContent = m ? "Sleep: " + m + " min" : "Sleep: off";
    b.classList.toggle("on", !!m);
    if (m) timer = setTimeout(() => {
      audio.pause();
      if (P) P.pause().catch(() => {});
      idx = 0; b.textContent = "Sleep: off"; b.classList.remove("on");
    }, m * 60000);
  };

  // swipe down on the full player to close it
  let y0 = null;
  fp.addEventListener("touchstart", (e) => { y0 = e.touches[0].clientY; }, { passive: true });
  fp.addEventListener("touchend", (e) => {
    if (y0 !== null && e.changedTouches[0].clientY - y0 > 120 && !e.target.closest("input")) fp.classList.remove("show");
    y0 = null;
  }, { passive: true });

  // Android back button closes the full player instead of exiting
  try {
    const A = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (A && A.addListener) A.addListener("backButton", () => { if (fp.classList.contains("show")) fp.classList.remove("show"); });
  } catch (e) {}
})();
