/* eslint-disable */
(() => {
  const rmEl = document.querySelector(".rm");
  if (!rmEl || !window.VxRoom) return;
  const API = (window.VORTEX_CONFIG && window.VORTEX_CONFIG.apiBase) || "";
  const toast = (m) => { const t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2400); };
  const btn = document.createElement("button");
  btn.hidden = true;
  rmEl.querySelector(".rm-top").appendChild(btn);
  let lk = null, cur = null, busy = false, mic = false, warned = false;

  const paint = () => { btn.textContent = mic ? "\uD83C\uDF99 LIVE" : "\uD83C\uDF99 Mic off"; btn.style.background = mic ? "#ef4444" : ""; };
  const loadLib = () => window.LivekitClient ? Promise.resolve(true) : new Promise((res) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/livekit-client@2/dist/livekit-client.umd.js"\;
    s.onload = () => res(true);
    s.onerror = () => res(false);
    document.head.appendChild(s);
  });
  const token = async (id) => {
    const tk = window.VortexAuth && window.VortexAuth.getToken();
    try {
      const r = await fetch(API + "/api/mobile/live/voice", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: "Bearer " + tk }, body: JSON.stringify({ roomId: id }) });
      let j = {};
      try { j = await r.json(); } catch (e) {}
      return { ok: r.ok, status: r.status, j };
    } catch (e) { return { ok: false, status: 0, j: {} }; }
  };
  const drop = async () => {
    const l = lk; lk = null; mic = false; btn.hidden = true;
    document.querySelectorAll("audio[data-vx]").forEach((e) => e.remove());
    if (l) { try { await l.disconnect(); } catch (e) {} }
  };
  async function join(id) {
    busy = true;
    const t = await token(id);
    if (!t.ok) { if (t.status === 501 && !warned) { warned = true; toast("Voice is not configured on the server"); } busy = false; return; }
    if (!(await loadLib())) { toast("Could not load the voice engine"); busy = false; return; }
    const now = window.VxRoom();
    if (!now || now.id !== id) { busy = false; return; }
    const L = window.LivekitClient;
    const r = new L.Room({ audioCaptureDefaults: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    r.on(L.RoomEvent.TrackSubscribed, (track) => { if (track.kind === "audio") { const el = track.attach(); el.dataset.vx = "1"; document.body.appendChild(el); } });
    r.on(L.RoomEvent.TrackUnsubscribed, (track) => { track.detach().forEach((e) => e.remove()); });
    try { await r.connect(t.j.url, t.j.token); } catch (e) { toast("Voice connection failed"); busy = false; return; }
    lk = r;
    if (t.j.canPublish) { btn.hidden = false; paint(); }
    busy = false;
  }
  btn.onclick = async () => {
    if (!lk) return;
    mic = !mic;
    try { await lk.localParticipant.setMicrophoneEnabled(mic); } catch (e) { mic = false; toast("Microphone permission denied"); }
    paint();
  };
  setInterval(async () => {
    if (busy) return;
    const r = window.VxRoom();
    const id = r ? r.id : null;
    if (id === cur) return;
    cur = id;
    await drop();
    if (id) join(id);
  }, 1500);
})();
