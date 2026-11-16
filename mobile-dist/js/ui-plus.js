(() => {
  const $ = (id) => document.getElementById(id);
  const audio = $("audio");
  if (!audio) return;
  const fmt = (s) => !isFinite(s) ? "0:00" : Math.floor(s/60) + ":" + String(Math.floor(s%60)).padStart(2,"0");
  const GR = ["#6929c4,#db2777","#0369a1,#7c3aed","#be123c,#7c3aed","#047857,#2563eb"];

  const fp = document.createElement("div");
  fp.className = "fp";
  fp.innerHTML = `<div class="fp-top"><button id="fpClose">⌄</button><span style="font-size:11px;letter-spacing:.2em;color:#a78bfa;font-weight:900">NOW PLAYING</span><span style="width:42px"></span></div>
  <div class="fp-cover" id="fpCover">V</div>
  <div class="fp-title" id="fpTitle">-</div><div class="fp-artist" id="fpArtist">-</div>
  <input type="range" id="fpSeek" min="0" max="100" step="0.1" value="0">
  <div class="fp-times"><span id="fpCur">0:00</span><span id="fpDur">0:00</span></div>
  <div class="fp-ctrl"><button id="fpShuf">⇄</button><button id="fpPrev">⏮</button><button id="fpPlay" class="big">▶</button><button id="fpNext">⏭</button><button id="fpRep">↻</button></div>`;
  document.body.appendChild(fp);

  const mini = $("miniPlayer");
  mini.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    fp.classList.add("show"); sync();
  });
  $("fpClose").onclick = () => fp.classList.remove("show");
  $("fpPlay").onclick = () => audio.paused ? audio.play() : audio.pause();
  $("fpNext").onclick = () => $("nextButton").click();
  $("fpPrev").onclick = () => $("previousButton").click();
  let seeking = false;
  $("fpSeek").oninput = () => { seeking = true; };
  $("fpSeek").onchange = () => {
    if (isFinite(audio.duration)) audio.currentTime = $("fpSeek").value / 100 * audio.duration;
    seeking = false;
  };
  $("fpRep").onclick = () => { audio.loop = !audio.loop; $("fpRep").classList.toggle("on", audio.loop); };
  $("fpShuf").onclick = () => $("fpShuf").classList.toggle("on");

  function sync() {
    $("fpTitle").textContent = $("miniTitle").textContent;
    $("fpArtist").textContent = $("miniArtist").textContent;
    $("fpPlay").textContent = audio.paused ? "▶" : "⏸";
    const c = $("fpCover");
    c.textContent = ($("miniTitle").textContent || "V")[0];
  }
  audio.addEventListener("play", sync);
  audio.addEventListener("pause", sync);
  audio.addEventListener("loadedmetadata", sync);
  audio.addEventListener("timeupdate", () => {
    if (seeking || !fp.classList.contains("show")) return;
    const d = audio.duration;
    $("fpSeek").value = isFinite(d) && d > 0 ? audio.currentTime / d * 100 : 0;
    $("fpCur").textContent = fmt(audio.currentTime);
    $("fpDur").textContent = fmt(d);
  });

  // horizontal sections built from the existing track list
  function buildRows() {
    const list = $("trackList");
    if (!list || $("hrowNew")) return;
    const items = [...list.children];
    if (!items.length) return;
    const data = items.map((el, i) => ({
      el, i,
      title: el.querySelector(".track-name")?.textContent || "",
      artist: el.querySelector(".track-artist")?.textContent || ""
    }));
    const mk = (id, title, arr) => {
      const s = document.createElement("div");
      s.className = "section";
      s.innerHTML = `<div class="section-header"><div class="section-title">${title}</div></div><div class="hrow" id="${id}"></div>`;
      const row = s.querySelector(".hrow");
      arr.forEach((t) => {
        const b = document.createElement("button");
        b.className = "hcard";
        b.innerHTML = `<div class="hc" style="background:linear-gradient(135deg,${GR[t.i%4]})">${(t.title||"V")[0]}</div><b></b><small></small>`;
        b.querySelector("b").textContent = t.title;
        b.querySelector("small").textContent = t.artist;
        b.onclick = () => t.el.click();
        row.appendChild(b);
      });
      return s;
    };
    const home = $("home");
    const anchor = list.closest(".section");
    anchor.before(mk("hrowNew", "New releases", data));
    anchor.before(mk("hrowTop", "Most played", [...data].reverse()));
  }
  new MutationObserver(buildRows).observe($("trackList"), { childList: true });
  buildRows();
})();
