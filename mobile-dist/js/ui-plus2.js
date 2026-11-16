/* eslint-disable */
(() => {
  const UI = window.VortexUI;
  const $ = (id) => document.getElementById(id);
  const audio = $("audio");
  if (!UI || !audio) return;
  const ID = "742f09e7";
  const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const api = (q) => `https://api.jamendo.com/v3.0/tracks/?client_id=${ID}&format=json&limit=20&imagesize=300&audioformat=mp32&${q}`;

  function render(box, arr) {
    box.innerHTML = "";
    if (!arr.length) { box.innerHTML = '<div class="jempty">Nothing here yet.</div>'; return; }
    arr.forEach((t, i) => {
      const b = document.createElement("button");
      b.className = "jr";
      b.innerHTML = '<div class="jc"></div><div style="min-width:0"><b></b><small></small></div>';
      if (t.image) b.querySelector(".jc").style.backgroundImage = `url("${t.image}")`;
      b.querySelector("b").textContent = t.name;
      b.querySelector("small").textContent = t.artist_name;
      b.onclick = () => UI.playList(arr, i);
      box.appendChild(b);
    });
  }
  async function fetchTracks(q) {
    const r = await fetch(api(q));
    const d = await r.json();
    return (d.results || []).filter((t) => t.audio);
  }

  function attachSearch(inputId, defaultQuery, title) {
    const input = $(inputId);
    if (!input) return;
    const wrap = document.createElement("div");
    wrap.className = "jbox";
    wrap.innerHTML = `<div class="jtitle"></div><div class="jlist"></div>`;
    wrap.querySelector(".jtitle").textContent = title;
    input.after(wrap);
    const list = wrap.querySelector(".jlist");
    const titleEl = wrap.querySelector(".jtitle");
    const load = async (q, label) => {
      try { titleEl.textContent = label; render(list, await fetchTracks(q)); } catch (e) { console.error(e); }
    };
    let timer;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      const v = input.value.trim();
      timer = setTimeout(() => {
        if (v.length >= 2) load(`search=${encodeURIComponent(v)}`, "Results");
        else if (defaultQuery) load(defaultQuery, title);
        else { list.innerHTML = ""; titleEl.textContent = ""; }
      }, 400);
    });
    if (defaultQuery) load(defaultQuery, title);
    else titleEl.textContent = "";
  }
  attachSearch("exploreSearch", "order=popularity_month", "Trending on Jamendo");
  attachSearch("homeSearch", null, "");

  // history
  audio.addEventListener("play", () => {
    const c = UI.current();
    if (!c) return;
    const h = ls("vx.hist", []).filter((x) => x.id !== c.id);
    h.unshift(c);
    sv("vx.hist", h.slice(0, 20));
  });

  // favorites for jamendo tracks
  const isFav = (c) => ls("vx.fav", []).some((x) => x.id === c.id);
  const paintLike = () => {
    const c = UI.current();
    if (!c) return;
    const on = isFav(c);
    $("fpLike").textContent = on ? "♥" : "♡";
    $("fpLike").classList.toggle("on", on);
  };
  $("fpLike").addEventListener("click", (e) => {
    const c = UI.current();
    if (!c) return;
    e.stopImmediatePropagation();
    let f = ls("vx.fav", []);
    f = isFav(c) ? f.filter((x) => x.id !== c.id) : [c, ...f];
    sv("vx.fav", f);
    paintLike();
    drawLibrary();
  }, true);
  ["play", "loadedmetadata"].forEach((ev) => audio.addEventListener(ev, () => setTimeout(paintLike, 30)));
  $("miniPlayer").addEventListener("click", () => setTimeout(paintLike, 60));

  // library
  const lib = $("libraryContent");
  const libBox = document.createElement("div");
  libBox.innerHTML = '<div class="jtitle">Favorites</div><div id="libFav"></div><div class="jtitle">Recently played</div><div id="libHist"></div>';
  if (lib) lib.after(libBox);
  function drawLibrary() {
    if (!lib) return;
    render($("libFav"), ls("vx.fav", []));
    render($("libHist"), ls("vx.hist", []));
  }
  drawLibrary();
  const libView = $("library");
  if (libView) new MutationObserver(drawLibrary).observe(libView, { attributes: true, attributeFilter: ["class"] });
})();
