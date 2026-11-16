/* eslint-disable */
(() => {
  const UI = window.VortexUI;
  const lib = document.getElementById("library");
  if (!UI || !lib) return;
  const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const toast = (m) => { const t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2200); };
  const slim = (t) => (t && !t.local && typeof t.audio === "string" && t.audio.indexOf("https://") === 0)
    ? { id: String(t.id), name: t.name, artist_name: t.artist_name, image: t.image || "", audio: t.audio } : null;
  const get = () => ls("vx.pl", []);
  const put = (a) => { sv("vx.pl", a); draw(); };
  const uid = () => "pl" + Date.now().toString(36) + Math.floor(Math.random() * 10000);
  const enc = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o))));
  const dec = (s) => JSON.parse(decodeURIComponent(escape(atob(s))));

  // add-to-playlist sheet
  const bg = document.createElement("div");
  bg.className = "sheet-bg";
  bg.innerHTML = '<div class="sheet" style="max-height:80vh;overflow-y:auto"><h3>Add to playlist</h3><div id="plList"></div><input class="search" id="plNew" placeholder="New playlist name..." style="margin-top:10px"><button class="row" id="plCreate">Create and add</button><button class="row" id="plClose">Close</button></div>';
  document.body.appendChild(bg);
  const close = () => bg.classList.remove("show");
  bg.addEventListener("click", (e) => { if (e.target === bg) close(); });
  bg.querySelector("#plClose").onclick = close;
  let pending = null;
  const addTo = (id) => {
    const a = get();
    const p = a.find((x) => x.id === id);
    if (!p) return;
    if (!p.tracks.some((t) => t.id === pending.id)) p.tracks.push(pending);
    put(a); close(); toast("Added to " + p.name);
  };
  bg.querySelector("#plCreate").onclick = () => {
    const n = bg.querySelector("#plNew").value.trim();
    if (!n || !pending) { toast("Enter a name"); return; }
    const a = get();
    const p = { id: uid(), name: n, tracks: [] };
    a.unshift(p);
    put(a);
    bg.querySelector("#plNew").value = "";
    addTo(p.id);
  };
  function openSheet() {
    pending = slim(UI.current && UI.current());
    if (!pending) { toast("Only online songs can be added"); return; }
    const box = bg.querySelector("#plList");
    box.innerHTML = "";
    get().forEach((p) => {
      const b = document.createElement("button");
      b.className = "row";
      b.textContent = p.name + "  (" + p.tracks.length + ")";
      b.onclick = () => addTo(p.id);
      box.appendChild(b);
    });
    bg.classList.add("show");
  }
  const extra = document.querySelector(".fp-extra");
  if (extra) { const b = document.createElement("button"); b.textContent = "+ Playlist"; b.onclick = openSheet; extra.appendChild(b); }

  // library section
  const box = document.createElement("div");
  lib.appendChild(box);
  const shareCode = async (p) => {
    const text = "VXPL:" + enc({ name: p.name, tracks: p.tracks });
    try { if (navigator.share) await navigator.share({ title: p.name, text }); else { await navigator.clipboard.writeText(text); toast("Code copied"); } } catch (e) {}
  };
  function draw() {
    box.innerHTML = '<div class="jtitle">My playlists</div>';
    const a = get();
    if (!a.length) { const d = document.createElement("div"); d.className = "jempty"; d.textContent = "No playlists yet. Open the player and tap + Playlist."; box.appendChild(d); }
    a.forEach((p) => {
      const w = document.createElement("div");
      w.className = "drow";
      const r = document.createElement("button");
      r.className = "jr";
      r.innerHTML = '<div class="jc"></div><div style="min-width:0"><b></b><small></small></div>';
      const first = p.tracks.find((t) => t.image);
      if (first) r.querySelector(".jc").style.backgroundImage = 'url("' + first.image + '")';
      r.querySelector("b").textContent = p.name;
      r.querySelector("small").textContent = p.tracks.length + " songs";
      r.onclick = () => { if (p.tracks.length) UI.playList(p.tracks, 0); };
      const s = document.createElement("button");
      s.className = "del"; s.textContent = "\u21EA"; s.onclick = () => shareCode(p);
      const x = document.createElement("button");
      x.className = "del"; x.textContent = "\u2715";
      x.onclick = () => { if (confirm("Delete playlist?")) put(get().filter((q) => q.id !== p.id)); };
      w.appendChild(r); w.appendChild(s); w.appendChild(x);
      box.appendChild(w);
    });
    const imp = document.createElement("div");
    imp.style.cssText = "display:flex;gap:8px;margin-top:14px";
    imp.innerHTML = '<input class="search" id="plCode" placeholder="Paste a playlist code..." style="margin-top:0"><button class="playall" id="plImp">Import</button>';
    box.appendChild(imp);
    imp.querySelector("#plImp").onclick = () => {
      const v = imp.querySelector("#plCode").value.trim().replace(/^VXPL:/, "");
      try {
        const o = dec(v);
        const tr = (o.tracks || []).filter((t) => t && typeof t.audio === "string" && t.audio.indexOf("https://") === 0).slice(0, 100);
        if (!tr.length) throw new Error("empty");
        const a2 = get();
        a2.unshift({ id: uid(), name: String(o.name || "Imported").slice(0, 60), tracks: tr });
        put(a2); toast("Playlist imported");
      } catch (e) { toast("Invalid code"); }
    };
  }
  draw();
})();
