/* eslint-disable */
(() => {
  const UI = window.VortexUI;
  const nav = document.querySelector(".nav");
  if (!UI || !nav) return;
  const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const AU = "https://api.audius.co/v1";
  const JID = "742f09e7";
  const GR = ["#f59e0b,#be123c", "#8b5cf6,#2563eb", "#0f766e,#4338ca", "#be123c,#7c3aed", "#047857,#2563eb"];

  const au = async (path) => {
    try {
      const r = await fetch(AU + path + (path.includes("?") ? "&" : "?") + "app_name=vortex");
      return ((await r.json()).data || []).filter((t) => t.id && t.is_streamable !== false).map((t) => ({
        id: "au" + t.id, name: t.title, artist_name: (t.user && t.user.name) || "Audius",
        image: (t.artwork && (t.artwork["480x480"] || t.artwork["150x150"])) || "",
        audio: AU + "/tracks/" + t.id + "/stream?app_name=vortex", badge: "Full"
      }));
    } catch (e) { return []; }
  };
  const jam = async (q) => {
    try {
      const r = await fetch("https://api.jamendo.com/v3.0/tracks/?client_id=" + JID + "&format=json&limit=20&imagesize=300&audioformat=mp32&" + q);
      return ((await r.json()).results || []).filter((t) => t.audio).map((t) => ({
        id: t.id, name: t.name, artist_name: t.artist_name, image: t.image, audio: t.audio, badge: "Full"
      }));
    } catch (e) { return []; }
  };
  const it = async (term, cc, limit) => {
    try {
      const r = await fetch("https://itunes.apple.com/search?media=music&entity=song&limit=" + (limit || 25) + "&country=" + cc + "&term=" + encodeURIComponent(term));
      return ((await r.json()).results || []).filter((x) => x.previewUrl).map((x) => ({
        id: "it" + x.trackId, name: x.trackName, artist_name: x.artistName,
        image: (x.artworkUrl100 || "").replace("100x100", "400x400"), audio: x.previewUrl, badge: "30s"
      }));
    } catch (e) { return []; }
  };
  const archive = async (q) => {
    try {
      const u = "https://archive.org/advancedsearch.php?q=" + encodeURIComponent("mediatype:audio AND (" + q + ")") + "&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=creator&rows=20&sort%5B%5D=downloads+desc&output=json";
      return (((await (await fetch(u)).json()).response || {}).docs || []).map((x) => ({
        id: "ia" + x.identifier, ident: x.identifier, name: x.title || x.identifier,
        artist_name: Array.isArray(x.creator) ? x.creator[0] : (x.creator || "Internet Archive"),
        image: "https://archive.org/services/img/" + x.identifier, badge: "Archive"
      }));
    } catch (e) { return []; }
  };
  const playArchive = async (item) => {
    try {
      const m = await (await fetch("https://archive.org/metadata/" + item.ident)).json();
      const files = (m.files || []).filter((f) => /\.mp3$/i.test(f.name)).slice(0, 40);
      if (!files.length) return;
      UI.playList(files.map((f, i) => ({
        id: "ia" + item.ident + i, name: f.title || f.name.replace(/\.mp3$/i, ""),
        artist_name: item.artist_name, image: item.image,
        audio: "https://archive.org/download/" + item.ident + "/" + encodeURIComponent(f.name)
      })), 0);
    } catch (e) {}
  };

  // ---------- page ----------
  const page = document.createElement("div");
  page.className = "ar";
  page.dir = "rtl";
  page.lang = "ar";
  page.innerHTML =
    '<div class="ar-hero"><div class="ar-eyebrow">VORTEX ARABIC</div><div class="ar-title">المكتبة العربية</div>' +
    '<div class="ar-sub">فنانون وأنماط من كل العالم العربي: شعبي، مهرجانات، راي، خليجي، طرب وراب.</div>' +
    '<div class="ar-actions"><button id="arPlay">تشغيل الكل</button><button class="alt" id="arShuf">عشوائي</button></div></div>' +
    '<input class="search" id="arSearch" type="search" placeholder="ابحث عن فنان أو أغنية...">' +
    '<div class="chips" id="arChips"></div><div id="arOut"></div><div id="arHome"></div>';
  document.body.appendChild(page);
  const $a = (id) => page.querySelector("#" + id);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.innerHTML = '<span class="icon">☪</span>عربي';
  const exploreBtn = nav.querySelector('[data-route="explore"]');
  if (exploreBtn) exploreBtn.after(btn); else nav.appendChild(btn);

  const closePage = () => { page.classList.remove("show"); btn.classList.remove("active"); };
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    nav.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    page.classList.add("show");
    page.scrollTop = 0;
    load();
  });
  nav.querySelectorAll("button[data-route]").forEach((b) => b.addEventListener("click", closePage, true));

  let current = [];
  const card = (t, arr, i, fn) => {
    const b = document.createElement("button");
    b.className = "hcard";
    b.innerHTML = '<div class="hc"></div><b></b><small></small>';
    const hc = b.querySelector(".hc");
    if (t.image) hc.style.backgroundImage = 'url("' + t.image + '")';
    else { hc.style.background = "linear-gradient(135deg," + GR[i % 5] + ")"; hc.textContent = (t.name || "V")[0]; }
    b.querySelector("b").textContent = t.name;
    const s = b.querySelector("small"); s.textContent = t.artist_name;
    if (t.badge) { const g = document.createElement("span"); g.className = "badge"; g.textContent = t.badge; s.after(g); }
    b.onclick = fn || (() => UI.playList(arr, i));
    return b;
  };
  const row = (t, arr, i) => {
    const r = document.createElement("button");
    r.className = "jr";
    r.innerHTML = '<div class="jc"></div><div style="min-width:0"><b></b><small></small></div>';
    if (t.image) r.querySelector(".jc").style.backgroundImage = 'url("' + t.image + '")';
    r.querySelector("b").textContent = t.name;
    r.querySelector("small").textContent = t.artist_name + (t.badge ? "  ·  " + t.badge : "");
    r.onclick = () => UI.playList(arr, i);
    return r;
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
  const showList = (title, arr) => {
    const out = $a("arOut");
    out.innerHTML = '<div class="jtitle"></div>';
    out.firstChild.textContent = title;
    current = arr;
    arr.forEach((t, i) => out.appendChild(row(t, arr, i)));
    if (!arr.length) { const d = document.createElement("div"); d.className = "jempty"; d.textContent = "لا توجد نتائج."; out.appendChild(d); }
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // chips
  const CATS = [
    ["الكل", null],
    ["شعبي", ["shaabi", "shaabi egypt"]],
    ["مهرجانات", ["mahraganat", "mahragan"]],
    ["راي", ["rai", "cheb khaled"]],
    ["خليجي", ["khaleeji", "khaliji"]],
    ["راب", ["arabic rap", "arab hip hop"]],
    ["طرب", ["tarab", "oud"]],
    ["أناشيد", ["nasheed", "anasheed"]]
  ];
  const chips = $a("arChips");
  CATS.forEach(([label, q], n) => {
    const c = document.createElement("button");
    c.className = "chip" + (n === 0 ? " on" : "");
    c.textContent = label;
    c.onclick = async () => {
      chips.querySelectorAll(".chip").forEach((x) => x.classList.remove("on"));
      c.classList.add("on");
      if (!q) { $a("arOut").innerHTML = ""; $a("arHome").style.display = ""; return; }
      $a("arHome").style.display = "none";
      const res = await Promise.all([au("/tracks/search?query=" + encodeURIComponent(q[0]) + "&limit=25"), au("/tracks/search?query=" + encodeURIComponent(q[1]) + "&limit=15"), it(q[1], "EG", 20)]);
      const seen = new Set();
      showList(label, [].concat(res[0], res[1], res[2]).filter((t) => !seen.has(t.id) && seen.add(t.id)));
    };
    chips.appendChild(c);
  });

  // search
  let timer;
  $a("arSearch").addEventListener("input", (e) => {
    clearTimeout(timer);
    const v = e.target.value.trim();
    timer = setTimeout(async () => {
      if (v.length < 2) { $a("arOut").innerHTML = ""; $a("arHome").style.display = ""; return; }
      $a("arHome").style.display = "none";
      const res = await Promise.all([au("/tracks/search?query=" + encodeURIComponent(v) + "&limit=20"), it(v, "EG", 20), jam("search=" + encodeURIComponent(v))]);
      showList("نتائج: " + v, [].concat(res[0], res[2], res[1]));
    }, 450);
  });

  // play all / shuffle
  $a("arPlay").onclick = () => { if (current.length) UI.playList(current, 0); else { const f = firstRow; if (f.length) UI.playList(f, 0); } };
  $a("arShuf").onclick = () => {
    const src = (current.length ? current : firstRow).slice();
    for (let i = src.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const x = src[i]; src[i] = src[j]; src[j] = x; }
    if (src.length) UI.playList(src, 0);
  };

  // artists
  const ARTISTS = [
    ["فيروز", "Fairuz"], ["أم كلثوم", "Umm Kulthum"], ["عمرو دياب", "Amr Diab"], ["نانسي عجرم", "Nancy Ajram"],
    ["تامر حسني", "Tamer Hosny"], ["كاظم الساهر", "Kadim Al Sahir"], ["ويجز", "Wegz"], ["مروان بابلو", "Marwan Pablo"],
    ["سعد لمجرد", "Saad Lamjarred"], ["محمد عبده", "Mohammed Abdo"], ["ماجدة الرومي", "Majida El Roumi"], ["حسين الجسمي", "Hussain Al Jassmi"],
    ["أصالة", "Assala"], ["إليسا", "Elissa"], ["الشاب خالد", "Cheb Khaled"], ["عبد الحليم", "Abdel Halim Hafez"],
    ["وائل كفوري", "Wael Kfoury"], ["راشد الماجد", "Rashed Al Majed"], ["محمد رمضان", "Mohamed Ramadan"], ["شيرين", "Sherine"]
  ];
  let firstRow = [];
  let loaded = false;
  async function load() {
    if (loaded) return;
    loaded = true;
    const home = $a("arHome");
    const as = document.createElement("div");
    as.className = "section";
    as.innerHTML = '<div class="section-header"><div class="section-title">الفنانون</div></div><div class="ar-art"></div>';
    home.appendChild(as);
    const av = as.querySelector(".ar-art");
    const cache = ls("vx.arimg", {});
    ARTISTS.forEach(([ar, en], i) => {
      const b = document.createElement("button");
      b.className = "ar-a";
      b.innerHTML = '<div class="av"></div><b></b>';
      const d = b.querySelector(".av");
      d.textContent = ar[0];
      d.style.background = "linear-gradient(135deg," + GR[i % 5] + ")";
      if (cache[en]) { d.style.backgroundImage = 'url("' + cache[en] + '")'; d.textContent = ""; }
      b.querySelector("b").textContent = ar;
      b.onclick = async () => { const arr = await it(en, "EG", 25); showList(ar, arr); if (arr.length) UI.playList(arr, 0); };
      av.appendChild(b);
      b._d = d; b._en = en;
    });
    // lazy artist photos, throttled
    (async () => {
      for (const b of av.children) {
        if (cache[b._en]) continue;
        const r = await it(b._en, "EG", 1);
        if (r[0] && r[0].image) { cache[b._en] = r[0].image; b._d.style.backgroundImage = 'url("' + r[0].image + '")'; b._d.textContent = ""; sv("vx.arimg", cache); }
        await sleep(450);
      }
    })();

    const ROWS = [
      ["أغاني كاملة · عربي", () => au("/tracks/search?query=arabic&limit=25")],
      ["شعبي", () => au("/tracks/search?query=shaabi&limit=25")],
      ["مهرجانات", () => au("/tracks/search?query=mahraganat&limit=25")],
      ["خليجي", () => au("/tracks/search?query=khaleeji&limit=25")],
      ["راب عربي", () => au("/tracks/search?query=arabic%20rap&limit=25")],
      ["Jamendo · عربي", () => jam("lang=ar&order=popularity_month")],
      ["معاينات · مصر", () => it("arabic pop", "EG")],
      ["معاينات · السعودية", () => it("khaleeji", "SA")],
      ["معاينات · الإمارات", () => it("arabic", "AE")],
      ["معاينات · لبنان", () => it("lebanese", "LB")],
      ["معاينات · المغرب", () => it("moroccan", "MA")],
      ["معاينات · العراق", () => it("iraqi", "IQ")],
      ["معاينات · الكويت", () => it("kuwaiti", "KW")],
      ["الأرشيف · موسيقى عربية", () => archive("subject:arabic OR title:arabic OR subject:oud")],
      ["الأرشيف · قرآن وأناشيد", () => archive("subject:nasheed OR subject:quran")]
    ];
    for (let n = 0; n < ROWS.length; n++) {
      const { s, r } = section(home, ROWS[n][0]);
      const arr = await ROWS[n][1]();
      r.innerHTML = "";
      if (arr.length < 3) { s.remove(); continue; }
      if (!firstRow.length) firstRow = arr;
      const isArch = arr[0].ident;
      arr.forEach((t, i) => r.appendChild(card(t, arr, i, isArch ? () => playArchive(t) : null)));
      await sleep(250);
    }
  }
})();
