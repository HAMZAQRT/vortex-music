/* eslint-disable */
(() => {
  const UI = window.VortexUI;
  const nav = document.querySelector(".nav");
  const audio = document.getElementById("audio");
  if (!UI || !nav || !audio) return;
  const API = (window.VORTEX_CONFIG && window.VORTEX_CONFIG.apiBase) || "";
  const C = window.Capacitor;
  let P = null;
  try { if (C && C.isNativePlatform && C.isNativePlatform()) P = (C.Plugins && C.Plugins.VortexPlayer) || C.registerPlugin("VortexPlayer"); } catch (e) {}
  const EM = ["\uD83D\uDD25", "\u2764\uFE0F", "\uD83D\uDC4F", "\uD83D\uDE02", "\uD83C\uDF89"];

  const toast = (m) => { const t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2200); };
  const api = async (path, opt) => {
    const o = opt || {};
    const tk = window.VortexAuth && window.VortexAuth.getToken();
    const h = { Accept: "application/json" };
    if (tk) h.Authorization = "Bearer " + tk;
    if (o.body) h["Content-Type"] = "application/json";
    try {
      const r = await fetch(API + path, { method: o.method || "GET", headers: h, body: o.body ? JSON.stringify(o.body) : undefined });
      let j = {};
      try { j = await r.json(); } catch (e) {}
      return { ok: r.ok, status: r.status, j };
    } catch (e) { return { ok: false, status: 0, j: {} }; }
  };
  const slim = (t) => (t && typeof t.audio === "string" && t.audio.indexOf("https://") === 0)
    ? { id: String(t.id), name: t.name, artist_name: t.artist_name, image: t.image || "", audio: t.audio } : null;
  const seek = (ms) => { if (audio.paused && P) P.seek({ position: ms }).catch(() => {}); else audio.currentTime = ms / 1000; };
  const stop = () => { if (P) P.pause().catch(() => {}); audio.pause(); };
  const getPlay = async () => {
    const t = UI.current && UI.current();
    let playing = !audio.paused, pos = audio.currentTime * 1000;
    if (audio.paused && P) { try { const s = await P.getState(); if (s && s.mediaId) { playing = !!s.playing; pos = s.position; } } catch (e) {} }
    return { t, playing, pos };
  };
  const search = async (q) => {
    const r = await Promise.all([
      fetch("https://api.jamendo.com/v3.0/tracks/?client_id=742f09e7&format=json&limit=8&imagesize=200&audioformat=mp32&search=" + encodeURIComponent(q)).then((x) => x.json()).catch(() => ({})),
      fetch("https://api.audius.co/v1/tracks/search?app_name=vortex&limit=8&query=" + encodeURIComponent(q)).then((x) => x.json()).catch(() => ({}))
    ]);
    const j = (r[0].results || []).filter((t) => t.audio).map((t) => ({ id: "j" + t.id, name: t.name, artist_name: t.artist_name, image: t.image, audio: t.audio }));
    const u = (r[1].data || []).filter((t) => t.id).map((t) => ({ id: "au" + t.id, name: t.title, artist_name: (t.user && t.user.name) || "Audius", image: (t.artwork && t.artwork["150x150"]) || "", audio: "https://api.audius.co/v1/tracks/" + t.id + "/stream?app_name=vortex" }));
    return j.concat(u);
  };

  // ---------- live page ----------
  const page = document.createElement("div");
  page.className = "ar lv";
  page.innerHTML =
    '<div class="ar-hero"><div class="ar-eyebrow"><span class="lvdot"></span>VORTEX LIVE</div><div class="ar-title" style="font-size:30px">Live Rooms</div>' +
    '<div class="ar-sub">Listen together in real time. Chat, react and request songs.</div></div>' +
    '<input class="search" id="lvName" placeholder="Name your room...">' +
    '<div class="ar-actions"><button id="lvStart">Start a room</button><button class="alt" id="lvRefresh">Refresh</button></div>' +
    '<div class="jtitle">Live now</div><div id="lvList"></div>';
  document.body.appendChild(page);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.innerHTML = '<span class="icon">\u25C9</span>Live';
  nav.appendChild(btn);

  let listTimer = null;
  const closePage = () => { page.classList.remove("show"); btn.classList.remove("active"); clearInterval(listTimer); };
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".ar").forEach((x) => x.classList.remove("show"));
    nav.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    page.classList.add("show");
    page.scrollTop = 0;
    loadList();
    clearInterval(listTimer);
    listTimer = setInterval(loadList, 6000);
  });
  nav.querySelectorAll("button").forEach((b) => { if (b !== btn) b.addEventListener("click", closePage, true); });

  async function loadList() {
    const box = page.querySelector("#lvList");
    const r = await api("/api/mobile/live/rooms");
    box.innerHTML = "";
    if (r.status === 401 || !(window.VortexAuth && window.VortexAuth.getToken())) { const d = document.createElement("div"); d.className = "dvempty"; d.textContent = "Sign in to see and join live rooms."; box.appendChild(d); return; }
    const rooms = r.j.rooms || [];
    if (!r.ok) { const d = document.createElement("div"); d.className = "dvempty"; d.textContent = "Cannot reach the server. It may be waking up, try Refresh in a few seconds."; box.appendChild(d); return; }
    if (!rooms.length) { const d = document.createElement("div"); d.className = "dvempty"; d.textContent = "No live rooms right now. Start one!"; box.appendChild(d); return; }
    rooms.forEach((rm) => {
      const c = document.createElement("button");
      c.className = "lvcard";
      c.innerHTML = '<div><b></b><small></small></div><span>Join</span>';
      c.querySelector("b").textContent = rm.title;
      c.querySelector("small").textContent = rm.hostName + "  -  " + rm.listeners + " listening" + (rm.track ? "  -  " + rm.track.name : "");
      c.onclick = () => enter(rm.id, rm.title);
      box.appendChild(c);
    });
  }
  page.querySelector("#lvRefresh").onclick = loadList;
  page.querySelector("#lvStart").onclick = async () => {
    const title = page.querySelector("#lvName").value.trim();
    if (!title) { toast("Give your room a name"); return; }
    const r = await api("/api/mobile/live/rooms", { method: "POST", body: { title } });
    if (!r.ok) { toast(r.status === 401 ? "Sign in first" : "Could not create the room"); return; }
    page.querySelector("#lvName").value = "";
    enter(r.j.room.id, r.j.room.title, true);
  };

  // ---------- room ----------
  const rm = document.createElement("div");
  rm.className = "rm";
  rm.innerHTML =
    '<div class="rm-top"><button id="rmBack">Leave</button><div><b id="rmTitle"></b><small id="rmSub"></small></div></div>' +
    '<div class="rm-np"><div class="rm-cv" id="rmCv"></div><div class="rm-t"><b id="rmTrack">Nothing playing</b><small id="rmArtist"></small></div><button id="rmPP">\u23EF</button></div>' +
    '<div class="rm-chat" id="rmChat"></div>' +
    '<div class="rm-panel" id="rmPanel" hidden><input id="rmQ" type="search" placeholder="Search songs..."><div id="rmRes"></div></div>' +
    '<div class="rm-react" id="rmReact"></div>' +
    '<div class="rm-in"><button id="rmAdd">\u266B</button><input id="rmText" placeholder="Say something..." maxlength="300"><button id="rmSend">\u27A4</button></div>';
  document.body.appendChild(rm);
  const $r = (id) => rm.querySelector("#" + id);

  let room = null, pollT = null, syncT = null, since = null, first = true, lastTrack = null, lastPlaying = null;
  const seen = new Set();

  const floatEmoji = (e) => { const s = document.createElement("span"); s.className = "fl"; s.textContent = e; s.style.left = (8 + Math.random() * 70) + "%"; rm.appendChild(s); setTimeout(() => s.remove(), 2500); };
  const me = () => { const u = window.VortexAuth && window.VortexAuth.getUser(); return u && (u.id || u.username || u.email); };

  function addMsg(m, quiet) {
    if (m.kind === "react") { if (!quiet && m.userId !== me()) floatEmoji(m.body); return; }
    const d = document.createElement("div");
    d.className = "rm-m" + (m.kind === "req" ? " req" : "");
    const n = document.createElement("b");
    n.textContent = m.name;
    d.appendChild(n);
    if (m.kind === "req") {
      let t = null; try { t = JSON.parse(m.body); } catch (e) {}
      if (!t) return;
      d.appendChild(document.createTextNode("requested " + t.name));
      if (room && room.host) {
        d.appendChild(document.createElement("br"));
        const b = document.createElement("button");
        b.textContent = "Play now";
        b.onclick = () => UI.playList([t], 0);
        d.appendChild(b);
      }
    } else d.appendChild(document.createTextNode(m.body));
    const box = $r("rmChat");
    const atEnd = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    box.appendChild(d);
    if (atEnd) box.scrollTop = box.scrollHeight;
  }
  function showTrack(t) {
    $r("rmTrack").textContent = t ? t.name : "Nothing playing";
    $r("rmArtist").textContent = t ? t.artist_name : "";
    $r("rmCv").style.backgroundImage = t && t.image ? 'url("' + t.image + '")' : "";
  }
  async function apply(d) {
    const s = d.room;
    showTrack(s.track);
    const expected = s.positionMs + (s.playing ? Math.max(0, d.serverNow - s.syncedAt) : 0);
    if (s.track && s.track.id !== lastTrack) {
      lastTrack = s.track.id;
      lastPlaying = s.playing;
      UI.playList([s.track], 0);
      if (s.playing) setTimeout(() => seek(expected + 1800), 1800);
      else setTimeout(stop, 1800);
      return;
    }
    if (!s.track) return;
    const cur = await getPlay();
    if (s.playing && cur.playing && Math.abs(cur.pos - expected) > 4000) seek(expected);
    if (!s.playing && lastPlaying && cur.playing) stop();
    lastPlaying = s.playing;
  }
  async function poll() {
    if (!room) return;
    const r = await api("/api/mobile/live/rooms/" + room.id + (since ? "?since=" + encodeURIComponent(since) : ""));
    if (!room) return;
    if (!r.ok) { if (r.status === 404 || r.status === 401) { leave(true); toast("Room closed"); } return; }
    const d = r.j;
    room.host = d.room.isHost;
    $r("rmSub").textContent = d.room.hostName + "  -  " + d.listeners + " listening";
    if (d.room.status !== "LIVE") { leave(true); toast("The host ended the room"); return; }
    (d.messages || []).forEach((m) => { if (seen.has(m.id)) return; seen.add(m.id); since = m.createdAt; addMsg(m, first); });
    first = false;
    if (!room.host) apply(d);
    else { const t = UI.current && UI.current(); showTrack(t); }
  }
  async function hostSync() {
    if (!room || !room.host) return;
    const p = await getPlay();
    api("/api/mobile/live/rooms/" + room.id, { method: "POST", body: { action: "sync", track: slim(p.t), playing: p.playing, positionMs: p.pos } });
  }

  function enter(id, title, asHost) {
    room = { id, host: !!asHost };
    since = null; first = true; lastTrack = null; lastPlaying = null; seen.clear();
    $r("rmChat").innerHTML = "";
    $r("rmTitle").textContent = title;
    $r("rmSub").textContent = "";
    $r("rmPanel").hidden = true;
    showTrack(null);
    rm.classList.add("show");
    poll();
    clearInterval(pollT); clearInterval(syncT);
    pollT = setInterval(poll, 2000);
    syncT = setInterval(hostSync, 3000);
  }
  function leave(silent) {
    const r = room;
    room = null;
    clearInterval(pollT); clearInterval(syncT);
    rm.classList.remove("show");
    if (r && r.host && !silent) api("/api/mobile/live/rooms/" + r.id, { method: "POST", body: { action: "end" } });
    if (!silent && r && !r.host) stop();
    loadList();
  }
  $r("rmBack").onclick = () => {
    if (room && room.host && !confirm("End this room for everyone?")) return;
    leave(false);
  };
  $r("rmPP").onclick = () => document.getElementById("pauseButton").click();
  const say = async () => {
    const i = $r("rmText"); const v = i.value.trim();
    if (!v || !room) return;
    i.value = "";
    await api("/api/mobile/live/rooms/" + room.id, { method: "POST", body: { action: "say", text: v } });
    poll();
  };
  $r("rmSend").onclick = say;
  $r("rmText").addEventListener("keydown", (e) => { if (e.key === "Enter") say(); });
  EM.forEach((e) => {
    const b = document.createElement("button");
    b.textContent = e;
    b.onclick = () => { floatEmoji(e); if (room) api("/api/mobile/live/rooms/" + room.id, { method: "POST", body: { action: "react", emoji: e } }); };
    $r("rmReact").appendChild(b);
  });
  $r("rmAdd").onclick = () => { const p = $r("rmPanel"); p.hidden = !p.hidden; if (!p.hidden) $r("rmQ").focus(); };
  let qt;
  $r("rmQ").addEventListener("input", (e) => {
    clearTimeout(qt);
    const v = e.target.value.trim();
    qt = setTimeout(async () => {
      const box = $r("rmRes");
      box.innerHTML = "";
      if (v.length < 2) return;
      const arr = await search(v);
      arr.forEach((t, i) => {
        const r = document.createElement("button");
        r.className = "jr";
        r.innerHTML = '<div class="jc"></div><div style="min-width:0"><b></b><small></small></div>';
        if (t.image) r.querySelector(".jc").style.backgroundImage = 'url("' + t.image + '")';
        r.querySelector("b").textContent = t.name;
        r.querySelector("small").textContent = t.artist_name + (room && room.host ? "  -  tap to play" : "  -  tap to request");
        r.onclick = () => {
          if (room && room.host) { UI.playList(arr, i); $r("rmPanel").hidden = true; }
          else if (room) { api("/api/mobile/live/rooms/" + room.id, { method: "POST", body: { action: "request", track: slim(t) } }); toast("Requested"); $r("rmPanel").hidden = true; }
        };
        box.appendChild(r);
      });
    }, 450);
  });
})();
