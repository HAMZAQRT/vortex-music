/* eslint-disable */
(() => {
  const UI = window.VortexUI;
  const nav = document.querySelector(".nav");
  if (!UI || !nav) return;

  // local tracks must use the web player (blob URLs), not the native one
  const origHook = window.VortexNativeHook;
  window.VortexNativeHook = (arr, i, fb) => (arr[i] && arr[i].local) ? false : (origHook ? origHook(arr, i, fb) : false);

  // ---------- storage (IndexedDB) ----------
  const dbp = new Promise((res, rej) => {
    const q = indexedDB.open("vxdev", 1);
    q.onupgradeneeded = () => q.result.createObjectStore("songs", { keyPath: "id" });
    q.onsuccess = () => res(q.result);
    q.onerror = () => rej(q.error);
  });
  const tx = async (mode, fn) => {
    const db = await dbp;
    return new Promise((res, rej) => {
      const t = db.transaction("songs", mode);
      const r = fn(t.objectStore("songs"));
      t.oncomplete = () => res(r && r.result);
      t.onerror = () => rej(t.error);
    });
  };

  // ---------- ID3 tags ----------
  const dec = (enc, data) => {
    try {
      const label = enc === 1 ? "utf-16" : enc === 2 ? "utf-16be" : enc === 3 ? "utf-8" : "iso-8859-1";
      return new TextDecoder(label).decode(data).split("\u0000").join("").trim();
    } catch (e) { return ""; }
  };
  const id3 = async (file) => {
    const out = {};
    try {
      const head = new Uint8Array(await file.slice(0, 10).arrayBuffer());
      if (String.fromCharCode(head[0], head[1], head[2]) !== "ID3") return out;
      const ver = head[3];
      const size = (head[6] << 21) | (head[7] << 14) | (head[8] << 7) | head[9];
      const buf = new Uint8Array(await file.slice(10, 10 + Math.min(size, 4000000)).arrayBuffer());
      let p = 0;
      while (p + 10 < buf.length) {
        const id = String.fromCharCode(buf[p], buf[p + 1], buf[p + 2], buf[p + 3]);
        if (!/^[A-Z0-9]{4}$/.test(id)) break;
        const len = ver === 4
          ? (buf[p + 4] << 21) | (buf[p + 5] << 14) | (buf[p + 6] << 7) | buf[p + 7]
          : buf[p + 4] * 16777216 + (buf[p + 5] << 16) + (buf[p + 6] << 8) + buf[p + 7];
        if (len <= 0) break;
        const body = buf.subarray(p + 10, p + 10 + len);
        if (id === "TIT2") out.title = dec(body[0], body.subarray(1));
        else if (id === "TPE1") out.artist = dec(body[0], body.subarray(1));
        else if (id === "TALB") out.album = dec(body[0], body.subarray(1));
        else if (id === "APIC" && !out.cover) {
          const enc = body[0];
          let i = 1;
          while (i < body.length && body[i] !== 0) i++;
          const mime = String.fromCharCode.apply(null, body.subarray(1, i)) || "image/jpeg";
          i += 2;
          if (enc === 1 || enc === 2) { while (i + 1 < body.length && !(body[i] === 0 && body[i + 1] === 0)) i += 2; i += 2; }
          else { while (i < body.length && body[i] !== 0) i++; i += 1; }
          const img = body.subarray(i);
          if (img.length > 100) out.cover = new Blob([img], { type: mime.indexOf("/") > 0 ? mime : "image/jpeg" });
        }
        p += 10 + len;
      }
    } catch (e) {}
    return out;
  };

  // ---------- state ----------
  let songs = [];
  let filter = "";
  let query = "";
  const urls = [];
  const toTrack = (r) => {
    const a = URL.createObjectURL(r.blob);
    urls.push(a);
    let img = "";
    if (r.cover) { img = URL.createObjectURL(r.cover); urls.push(img); }
    return { id: r.id, name: r.name, artist_name: r.artist, album: r.album, image: img, audio: a, local: true, badge: "Device" };
  };
  const reload = async () => {
    urls.splice(0).forEach((u) => URL.revokeObjectURL(u));
    const all = (await tx("readonly", (s) => s.getAll())) || [];
    all.sort((x, y) => (x.artist + x.name).localeCompare(y.artist + y.name));
    songs = all.map(toTrack);
    render();
  };

  // ---------- page ----------
  const page = document.createElement("div");
  page.className = "ar dv";
  page.innerHTML =
    '<div class="ar-hero"><div class="ar-eyebrow">MY DEVICE</div><div class="ar-title" style="font-size:30px">My Music</div>' +
    '<div class="ar-sub" id="dvCount">No songs yet.</div>' +
    '<div class="ar-actions"><button id="dvAdd">Add songs</button><button class="alt" id="dvPlay">Play all</button><button class="alt" id="dvShuf">Shuffle</button></div></div>' +
    '<input id="dvFile" type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.flac,.aac" multiple hidden>' +
    '<input class="search" id="dvSearch" type="search" placeholder="Search your music...">' +
    '<div class="chips" id="dvChips"></div><div id="dvList"></div>';
  document.body.appendChild(page);
  const $d = (id) => page.querySelector("#" + id);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.innerHTML = '<span class="icon">\u266B</span>Device';
  nav.appendChild(btn);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".ar").forEach((x) => x.classList.remove("show"));
    nav.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    page.classList.add("show");
    page.scrollTop = 0;
  });
  nav.querySelectorAll("button").forEach((b) => {
    if (b !== btn) b.addEventListener("click", () => { page.classList.remove("show"); btn.classList.remove("active"); }, true);
  });

  const visible = () => songs.filter((t) =>
    (!filter || t.artist_name === filter) &&
    (!query || (t.name + " " + t.artist_name).toLowerCase().indexOf(query) >= 0));

  function render() {
    $d("dvCount").textContent = songs.length ? songs.length + " songs on this device" : "No songs yet.";
    const chips = $d("dvChips");
    chips.innerHTML = "";
    const artists = Array.from(new Set(songs.map((t) => t.artist_name)));
    if (artists.length > 1) {
      ["All"].concat(artists).forEach((a) => {
        const c = document.createElement("button");
        const on = (a === "All" && !filter) || a === filter;
        c.className = "chip" + (on ? " on" : "");
        c.textContent = a;
        c.onclick = () => { filter = a === "All" ? "" : a; render(); };
        chips.appendChild(c);
      });
    }
    const list = $d("dvList");
    list.innerHTML = "";
    if (!songs.length) {
      const d = document.createElement("div");
      d.className = "dvempty";
      d.textContent = "Tap \"Add songs\" and choose mp3 files from your phone. They are copied into Vortex and stay available offline.";
      list.appendChild(d);
      return;
    }
    const arr = visible();
    arr.forEach((t, i) => {
      const w = document.createElement("div");
      w.className = "drow";
      const r = document.createElement("button");
      r.className = "jr";
      r.innerHTML = '<div class="jc"></div><div style="min-width:0"><b></b><small></small></div>';
      if (t.image) r.querySelector(".jc").style.backgroundImage = 'url("' + t.image + '")';
      r.querySelector("b").textContent = t.name;
      r.querySelector("small").textContent = t.artist_name;
      r.onclick = () => UI.playList(arr, i);
      const x = document.createElement("button");
      x.className = "del";
      x.textContent = "\u2715";
      x.onclick = async () => { if (confirm("Remove from Vortex?")) { await tx("readwrite", (s) => s.delete(t.id)); reload(); } };
      w.appendChild(r); w.appendChild(x);
      list.appendChild(w);
    });
  }

  $d("dvSearch").addEventListener("input", (e) => { query = e.target.value.trim().toLowerCase(); render(); });
  $d("dvAdd").onclick = () => $d("dvFile").click();
  $d("dvPlay").onclick = () => { const a = visible(); if (a.length) UI.playList(a, 0); };
  $d("dvShuf").onclick = () => {
    const a = visible().slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    if (a.length) UI.playList(a, 0);
  };

  $d("dvFile").addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    const sub = $d("dvCount");
    let n = 0;
    for (const f of files) {
      n++;
      sub.textContent = "Importing " + n + " / " + files.length + "...";
      try {
        const meta = await id3(f);
        const base = f.name.replace(/\.[^.]+$/, "");
        let title = meta.title, artist = meta.artist;
        if (!title) {
          const parts = base.split(" - ");
          if (parts.length > 1) { artist = artist || parts[0].trim(); title = parts.slice(1).join(" - ").trim(); }
          else title = base;
        }
        await tx("readwrite", (s) => s.put({
          id: "dv" + f.name + "_" + f.size,
          name: title,
          artist: artist || "Unknown artist",
          album: meta.album || "",
          blob: f,
          cover: meta.cover || null
        }));
      } catch (err) {}
    }
    e.target.value = "";
    reload();
  });

  reload();
})();
