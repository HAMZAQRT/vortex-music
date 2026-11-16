(() => {
  const JAMENDO_ID = "742f09e7";
  const $ = (id) => document.getElementById(id);
  const audio = $("audio");
  if (!audio) return;
  const fmt = (s) => !isFinite(s) ? "0:00" : Math.floor(s/60) + ":" + String(Math.floor(s%60)).padStart(2,"0");
  const GR = ["#6929c4,#db2777","#0369a1,#7c3aed","#be123c,#7c3aed","#047857,#2563eb"];
  let shuffleOn = false, mode = "app", jam = [], ji = 0, jamSrc = "", cover = null;

  const fp = document.createElement("div");
  fp.className = "fp";
  fp.innerHTML = `<div class="fp-top"><button id="fpClose">⌄</button><span style="font-size:11px;letter-spacing:.2em;color:#a78bfa;font-weight:900">NOW PLAYING</span><button id="fpLike">♡</button></div>
  <div class="fp-cover" id="fpCover">V</div>
  <div class="fp-title" id="fpTitle">-</div><div class="fp-artist" id="fpArtist">-</div>
  <input type="range" id="fpSeek" min="0" max="100" step="0.1" value="0">
  <div class="fp-times"><span id="fpCur">0:00</span><span id="fpDur">0:00</span></div>
  <div class="fp-ctrl"><button id="fpShuf">⇄</button><button id="fpPrev">⏮</button><button id="fpPlay" class="big">▶</button><button id="fpNext">⏭</button><button id="fpRep">↻</button></div>`;
  document.body.appendChild(fp);

  const likeBtn = () => {
    const t = $("miniTitle").textContent;
    const el = [...document.querySelectorAll("#trackList .track")].find((e) => e.querySelector(".track-name")?.textContent === t);
    return el?.querySelector(".save-track");
  };
  const setCover = (url) => {
    cover = url;
    const m = document.querySelector(".mini-cover");
    if (m) { m.style.backgroundImage = url ? `url("${url}")` : ""; m.style.backgroundSize = "cover"; m.textContent = url ? "" : "V"; }
  };
  function sync() {
    $("fpTitle").textContent = $("miniTitle").textContent;
    $("fpArtist").textContent = $("miniArtist").textContent;
    $("fpPlay").textContent = audio.paused ? "▶" : "⏸";
    const c = $("fpCover");
    c.style.backgroundImage = cover ? `url("${cover}")` : "";
    c.textContent = cover ? "" : ($("miniTitle").textContent || "V")[0];
    const liked = likeBtn()?.classList.contains("saved");
    $("fpLike").textContent = liked ? "♥" : "♡";
    $("fpLike").classList.toggle("on", !!liked);
  }

  $("miniPlayer").addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    fp.classList.add("show"); sync();
  });
  $("fpClose").onclick = () => fp.classList.remove("show");
  $("fpPlay").onclick = () => audio.paused ? audio.play() : audio.pause();
  $("fpNext").onclick = () => $("nextButton").click();
  $("fpPrev").onclick = () => $("previousButton").click();
  $("fpLike").onclick = () => { const b = likeBtn(); if (b) { b.click(); setTimeout(sync, 200); } };
  let seeking = false;
  $("fpSeek").oninput = () => { seeking = true; };
  $("fpSeek").onchange = () => {
    if (isFinite(audio.duration)) audio.currentTime = $("fpSeek").value / 100 * audio.duration;
    seeking = false;
  };
  $("fpRep").onclick = () => { audio.loop = !audio.loop; $("fpRep").classList.toggle("on", audio.loop); };
  $("fpShuf").onclick = () => { shuffleOn = !shuffleOn; $("fpShuf").classList.toggle("on", shuffleOn); };

  const randomAppTrack = () => {
    const els = [...document.querySelectorAll("#trackList .track")];
    if (els.length) els[Math.floor(Math.random() * els.length)].click();
  };
  $("nextButton").addEventListener("click", (e) => {
    if (mode === "jam") { e.stopImmediatePropagation(); playJam((ji + 1) % jam.length); }
    else if (shuffleOn) { e.stopImmediatePropagation(); randomAppTrack(); }
  }, true);
  $("previousButton").addEventListener("click", (e) => {
    if (mode !== "jam") return;
    e.stopImmediatePropagation();
    if (audio.currentTime > 3) audio.currentTime = 0;
    else playJam((ji - 1 + jam.length) % jam.length);
  }, true);
  audio.addEventListener("ended", (e) => {
    if (mode === "jam") { e.stopImmediatePropagation(); playJam((ji + 1) % jam.length); }
    else if (shuffleOn) { e.stopImmediatePropagation(); randomAppTrack(); }
  }, true);

  audio.addEventListener("play", () => {
    if (mode === "jam" && audio.currentSrc !== jamSrc) { mode = "app"; setCover(null); }
    sync();
  });
  audio.addEventListener("pause", sync);
  audio.addEventListener("loadedmetadata", sync);
  audio.addEventListener("timeupdate", () => {
    if (seeking || !fp.classList.contains("show")) return;
    const d = audio.duration;
    $("fpSeek").value = isFinite(d) && d > 0 ? audio.currentTime / d * 100 : 0;
    $("fpCur").textContent = fmt(audio.currentTime);
    $("fpDur").textContent = fmt(d);
  });

  function playJam(i) {
    ji = i; const t = jam[i]; mode = "jam";
    jamSrc = new URL(t.audio).href;
    audio.src = t.audio;
    audio.play().catch(console.error);
    $("miniPlayer").classList.add("show");
    $("miniTitle").textContent = t.name;
    $("miniArtist").textContent = t.artist_name;
    setCover(t.image || null);
    sync();
  }

  const card = (title, artist, bg, onclick) => {
    const b = document.createElement("button");
    b.className = "hcard";
    b.innerHTML = `<div class="hc"></div><b></b><small></small>`;
    const hc = b.querySelector(".hc");
    if (bg.startsWith("http")) hc.style.backgroundImage = `url("${bg}")`;
    else { hc.style.background = `linear-gradient(135deg,${bg})`; hc.textContent = (title || "V")[0]; }
    b.querySelector("b").textContent = title;
    b.querySelector("small").textContent = artist;
    b.onclick = onclick;
    return b;
  };
  const section = (id, title) => {
    const s = document.createElement("div");
    s.className = "section";
    s.innerHTML = `<div class="section-header"><div class="section-title">${title}</div></div><div class="hrow" id="${id}"></div>`;
    return s;
  };

  function buildRows() {
    const list = $("trackList");
    if (!list || $("hrowNew")) return;
    const els = [...list.children];
    if (!els.length) return;
    const data = els.map((el, i) => ({ el, i, title: el.querySelector(".track-name")?.textContent || "", artist: el.querySelector(".track-artist")?.textContent || "" }));
    const mk = (id, title, arr) => {
      const s = section(id, title);
      arr.forEach((t) => s.querySelector(".hrow").appendChild(card(t.title, t.artist, GR[t.i % 4], () => t.el.click())));
      return s;
    };
    const anchor = list.closest(".section");
    anchor.before(mk("hrowNew", "New releases", data));
    anchor.before(mk("hrowTop", "Most played", [...data].reverse()));
  }

  const TAGS = [["all","All"],["pop","Pop"],["rock","Rock"],["electronic","Electronic"],["hiphop","Hip-Hop"],["jazz","Jazz"],["lounge","Lounge"],["classical","Classical"]];
  async function loadJamendo(tag) {
    const row = $("hrowJam");
    try {
      const q = tag && tag !== "all" ? `&tags=${tag}` : "";
      const r = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_ID}&format=json&limit=20&order=popularity_week&imagesize=300&audioformat=mp32${q}`);
      const d = await r.json();
      jam = (d.results || []).filter((t) => t.audio);
      row.innerHTML = "";
      jam.forEach((t, i) => row.appendChild(card(t.name, t.artist_name, t.image || GR[i % 4], () => playJam(i))));
    } catch (e) { console.error("jamendo", e); }
  }
  function buildJamendo() {
    if (!JAMENDO_ID || $("hrowJam")) return;
    const anchor = $("trackList")?.closest(".section");
    if (!anchor) return;
    const s = section("hrowJam", "Discover");
    const chips = document.createElement("div");
    chips.className = "chips";
    TAGS.forEach(([k, label], n) => {
      const c = document.createElement("button");
      c.className = "chip" + (n === 0 ? " on" : "");
      c.textContent = label;
      c.onclick = () => { chips.querySelectorAll(".chip").forEach((x) => x.classList.remove("on")); c.classList.add("on"); loadJamendo(k); };
      chips.appendChild(c);
    });
    s.querySelector(".section-header").after(chips);
    anchor.before(s);
    loadJamendo("all");
  }

  window.VortexUI = { playList: (a, i) => { jam = a; playJam(i); }, current: () => (mode === "jam" ? jam[ji] : null) };
  new MutationObserver(buildRows).observe($("trackList"), { childList: true });
  buildRows();
  buildJamendo();
})();
