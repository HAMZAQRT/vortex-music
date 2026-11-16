/* eslint-disable */
(() => {
  const UI = window.VortexUI;
  const $ = (id) => document.getElementById(id);
  if (!UI) return;
  const GR = ["#6929c4,#db2777", "#0369a1,#7c3aed", "#be123c,#7c3aed", "#047857,#2563eb", "#b45309,#be123c"];

  const card = (t, arr, i, onclick) => {
    const b = document.createElement("button");
    b.className = "hcard";
    b.innerHTML = '<div class="hc"></div><b></b><small></small>';
    const hc = b.querySelector(".hc");
    if (t.image) hc.style.backgroundImage = 'url("' + t.image + '")';
    else { hc.style.background = "linear-gradient(135deg," + GR[i % 5] + ")"; hc.textContent = (t.name || "V")[0]; }
    b.querySelector("b").textContent = t.name;
    const s = b.querySelector("small");
    s.textContent = t.artist_name;
    if (t.badge) { const g = document.createElement("span"); g.className = "badge"; g.textContent = t.badge; s.after(g); }
    b.onclick = onclick || (() => UI.playList(arr, i));
    return b;
  };
  const section = (host, title) => {
    const s = document.createElement("div");
    s.className = "section";
    s.innerHTML = '<div class="section-header"><div class="section-title"></div></div><div class="hrow"></div>';
    s.querySelector(".section-title").textContent = title;
    const r = s.querySelector(".hrow");
    for (let i = 0; i < 4; i++) { const k = document.createElement("div"); k.className = "sk"; r.appendChild(k); }
    host.appendChild(s);
    return { s, r };
  };

  // ---------- iTunes previews (30s) ----------
  const itunes = async (term, country) => {
    try {
      const u = "https://itunes.apple.com/search?media=music&entity=song&limit=25&country=" + country + "&term=" + encodeURIComponent(term);
      const d = await (await fetch(u)).json();
      return (d.results || []).filter((x) => x.previewUrl).map((x) => ({
        id: "it" + x.trackId,
        name: x.trackName,
        artist_name: x.artistName,
        image: (x.artworkUrl100 || "").replace("100x100", "400x400"),
        audio: x.previewUrl,
        badge: "30s preview"
      }));
    } catch (e) { return []; }
  };

  // ---------- Internet Archive ----------
  const archive = async (q) => {
    try {
      const u = "https://archive.org/advancedsearch.php?q=" + encodeURIComponent("mediatype:audio AND collection:opensource_audio AND (" + q + ")") +
        "&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=creator&rows=20&sort%5B%5D=downloads+desc&output=json";
      const d = await (await fetch(u)).json();
      return ((d.response && d.response.docs) || []).map((x) => ({
        id: "ia" + x.identifier,
        ident: x.identifier,
        name: x.title || x.identifier,
        artist_name: Array.isArray(x.creator) ? x.creator[0] : (x.creator || "Internet Archive"),
        image: "https://archive.org/services/img/" + x.identifier,
        badge: "Archive"
      }));
    } catch (e) { return []; }
  };
  const playArchive = async (item) => {
    try {
      const m = await (await fetch("https://archive.org/metadata/" + item.ident)).json();
      const files = (m.files || []).filter((f) => /\.mp3$/i.test(f.name)).slice(0, 40);
      if (!files.length) return;
      const arr = files.map((f, i) => ({
        id: "ia" + item.ident + i,
        name: f.title || f.name.replace(/\.mp3$/i, ""),
        artist_name: item.artist_name,
        image: item.image,
        audio: "https://archive.org/download/" + item.ident + "/" + encodeURIComponent(f.name)
      }));
      UI.playList(arr, 0);
    } catch (e) { /* ignore */ }
  };

  const ITUNES_ROWS = [
    ["Arabic pop - Egypt", "arabic pop", "EG"],
    ["Khaleeji - Saudi", "khaleeji", "SA"],
    ["Arabic hits - UAE", "arabic", "AE"],
    ["Levant - Lebanon", "fairuz", "LB"],
    ["Top Pop - USA", "pop hits", "US"],
    ["Hip-Hop - USA", "hip hop", "US"],
    ["Latin - Mexico", "latin", "MX"],
    ["K-Pop - Korea", "kpop", "KR"],
    ["Rock classics - UK", "rock classics", "GB"]
  ];
  const ARCHIVE_ROWS = [
    ["Archive - Arabic music", "subject:arabic OR title:arabic OR subject:oud"],
    ["Archive - Classical", "subject:classical"],
    ["Archive - Jazz", "subject:jazz"],
    ["Archive - World", "subject:world"],
    ["Archive - Quran & nasheed", "subject:nasheed OR subject:quran"]
  ];

  function fill(host) {
    ITUNES_ROWS.forEach(async ([title, term, cc]) => {
      const { s, r } = section(host, title);
      const arr = await itunes(term, cc);
      r.innerHTML = "";
      if (arr.length < 3) return s.remove();
      arr.forEach((t, i) => r.appendChild(card(t, arr, i)));
    });
    ARCHIVE_ROWS.forEach(async ([title, q]) => {
      const { s, r } = section(host, title);
      const arr = await archive(q);
      r.innerHTML = "";
      if (arr.length < 3) return s.remove();
      arr.forEach((t, i) => r.appendChild(card(t, arr, i, () => playArchive(t))));
    });
  }

  // Home
  const home = $("home");
  if (home) { const h = document.createElement("div"); home.appendChild(h); fill(h); }

  // Explore: sources note
  const ex = $("explore");
  if (ex) {
    const n = document.createElement("div");
    n.className = "srcnote";
    n.textContent = "Sources: Jamendo and Audius (full tracks), Internet Archive (public domain / open licenses), Apple iTunes (30-second previews only).";
    ex.appendChild(n);
  }
})();
