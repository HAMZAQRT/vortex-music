/* eslint-disable */
(() => {
  const $ = (id) => document.getElementById(id);
  const UI = window.VortexUI;
  const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
  const setAccent = (c) => { document.documentElement.style.setProperty("--accent", c); sv("vx.accent", c); };
  setAccent(ls("vx.accent", "#8b5cf6"));

  const nameEl = () => document.querySelector("#profile .profile-name");
  const firstName = () => {
    const n = ((nameEl() && nameEl().textContent) || "").trim();
    return n && n !== "Vortex User" ? n.split(" ")[0] : "";
  };

  // greeting on home
  const h1 = document.querySelector("#home h1");
  const greet = () => {
    if (!h1) return;
    const h = new Date().getHours();
    const g = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    const n = firstName();
    h1.textContent = g + (n ? ", " + n : "") + ".";
  };
  greet();
  setInterval(greet, 3000);

  const card = (t, arr, i) => {
    const b = document.createElement("button");
    b.className = "hcard";
    b.innerHTML = '<div class="hc"></div><b></b><small></small>';
    const hc = b.querySelector(".hc");
    if (t.image) hc.style.backgroundImage = 'url("' + t.image + '")';
    else hc.textContent = (t.name || "V")[0];
    b.querySelector("b").textContent = t.name;
    b.querySelector("small").textContent = t.artist_name;
    b.onclick = () => UI && UI.playList(arr, i);
    return b;
  };
  const rowOf = (title, arr) => {
    const s = document.createElement("div");
    s.className = "section";
    s.innerHTML = '<div class="section-header"><div class="section-title"></div></div><div class="hrow"></div>';
    s.querySelector(".section-title").textContent = title;
    const r = s.querySelector(".hrow");
    if (!arr.length) { s.style.display = "none"; return s; }
    arr.forEach((t, i) => r.appendChild(card(t, arr, i)));
    return s;
  };

  // profile
  const prof = $("profile");
  const actions = prof && prof.querySelector(".profile-actions");
  let box = null;
  if (actions) {
    const stats = document.createElement("div");
    stats.className = "pstats";
    stats.innerHTML = '<div class="pstat"><strong id="psLiked">0</strong><span>Liked</span></div><div class="pstat"><strong id="psPlayed">0</strong><span>Recently played</span></div><div class="pstat"><strong id="psArtists">0</strong><span>Artists</span></div>';
    actions.after(stats);
    box = document.createElement("div");
    const sect = prof.querySelector(".profile-section");
    if (sect) sect.before(box);
    else prof.appendChild(box);
  }
  function drawProfile() {
    if (!box) return;
    const fav = ls("vx.fav", []);
    const hist = ls("vx.hist", []);
    const artists = new Set(fav.concat(hist).map((t) => t.artist_name));
    $("psLiked").textContent = fav.length;
    $("psPlayed").textContent = hist.length;
    $("psArtists").textContent = artists.size;
    box.innerHTML = "";
    box.appendChild(rowOf("Recently played", hist));
    box.appendChild(rowOf("Your favorites", fav));
  }
  drawProfile();
  if (prof) new MutationObserver(drawProfile).observe(prof, { attributes: true, attributeFilter: ["class"] });

  // settings sheet
  const bg = document.createElement("div");
  bg.className = "sheet-bg";
  bg.innerHTML = '<div class="sheet"><h3>Settings</h3><div style="font-size:11px;color:rgba(255,255,255,.4);font-weight:900;letter-spacing:.15em">ACCENT COLOR</div><div class="sw" id="sw"></div><button class="row" id="stHist">Clear recently played</button><button class="row danger" id="stFav">Clear favorites</button><button class="row" id="stAbout">About Vortex</button><button class="row" id="stClose">Close</button></div>';
  document.body.appendChild(bg);
  const sw = bg.querySelector("#sw");
  ["#8b5cf6", "#ec4899", "#22d3ee", "#22c55e", "#f59e0b"].forEach((c) => {
    const b = document.createElement("button");
    b.style.background = c;
    if (c === ls("vx.accent", "#8b5cf6")) b.className = "on";
    b.onclick = () => { setAccent(c); sw.querySelectorAll("button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); };
    sw.appendChild(b);
  });
  const close = () => bg.classList.remove("show");
  bg.addEventListener("click", (e) => { if (e.target === bg) close(); });
  $("stClose").onclick = close;
  $("stHist").onclick = () => { sv("vx.hist", []); drawProfile(); close(); };
  $("stFav").onclick = () => { sv("vx.fav", []); drawProfile(); close(); };
  $("stAbout").onclick = () => { alert("Vortex Music - built with open music sources (Jamendo, Audius)."); };
  const gear = prof && prof.querySelector(".profile-settings");
  if (gear) gear.onclick = () => bg.classList.add("show");

  // library: play-all buttons
  const libFav = $("libFav");
  if (libFav) {
    const b = document.createElement("button");
    b.className = "playall";
    b.textContent = "Play all favorites";
    b.onclick = () => { const f = ls("vx.fav", []); if (f.length && UI) UI.playList(f, 0); };
    libFav.before(b);
  }
})();
