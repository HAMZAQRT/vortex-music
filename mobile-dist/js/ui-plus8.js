(() => {
  const UI = window.VortexUI;
  const $ = (id) => document.getElementById(id);
  if (!UI) return;
  const H = "https://api.audius.co/v1"\;
  const GR = ["#6929c4,#db2777","#0369a1,#7c3aed","#be123c,#7c3aed","#047857,#2563eb","#b45309,#be123c","#0f766e,#4338ca"];
  const conv = (a) => (a || []).filter((t) => t.id && t.is_streamable !== false).map((t) => ({
    id: "au" + t.id,
    name: t.title,
    artist_name: (t.user && t.user.name) || "Audius",
    image: t.artwork && (t.artwork["480x480"] || t.artwork["150x150"]) || "",
    audio: `${H}/tracks/${t.id}/stream?app_name=vortex`
  }));
  const get = async (path) => {
    try { const r = await fetch(`${H}${path}${path.includes("?") ? "&" : "?"}app_name=vortex`); return conv((await r.json()).data); }
    catch { return []; }
  };
  const card = (t, i, arr) => {
    const b = document.createElement("button");
    b.className = "hcard";
    b.innerHTML = '<div class="hc"></div><b></b><small></small>';
    const hc = b.querySelector(".hc");
    if (t.image) hc.style.backgroundImage = `url("${t.image}")`;
    else { hc.style.background = `linear-gradient(135deg,${GR[i % GR.length]})`; hc.textContent = (t.name || "V")[0]; }
    b.querySelector("b").textContent = t.name;
    b.querySelector("small").textContent = t.artist_name;
    b.onclick = () => UI.playList(arr, i);
    return b;
  };
  const sec = (title) => {
    const s = document.createElement("div");
    s.className = "section";
    s.innerHTML = '<div class="section-header"><div class="section-title"></div></div><div class="hrow"></div>';
    s.querySelector(".section-title").textContent = title;
    return s;
  };
  const rowsDef = [
    ["عربي · Arabic hits", "/tracks/search?query=arabic&limit=25"],
    ["شعبي · Shaabi", "/tracks/search?query=shaabi&limit=25"],
    ["مهرجانات · Mahraganat", "/tracks/search?query=mahraganat&limit=25"],
    ["راي · Rai", "/tracks/search?query=rai&limit=25"],
    ["خليجي · Khaleeji", "/tracks/search?query=khaleeji&limit=25"],
    ["راب عربي · Arabic Rap", "/tracks/search?query=arabic%20rap&limit=25"],
    ["Global trending", "/tracks/trending?limit=25"],
    ["Pop", "/tracks/trending?genre=Pop&limit=25"],
    ["Hip-Hop / Rap", "/tracks/trending?genre=Hip-Hop%2FRap&limit=25"],
    ["R&B / Soul", "/tracks/trending?genre=R%26B%2FSoul&limit=25"],
    ["Latin", "/tracks/trending?genre=Latin&limit=25"],
    ["Electronic", "/tracks/trending?genre=Electronic&limit=25"],
    ["Lo-Fi", "/tracks/trending?genre=Lo-Fi&limit=25"],
    ["Rock", "/tracks/trending?genre=Rock&limit=25"],
    ["World", "/tracks/trending?genre=World&limit=25"]
  ];
  const hero = $("home") && $("home").querySelector(".hero");
  if (hero) {
    const box = document.createElement("div");
    hero.after(box);
    rowsDef.forEach(async ([title, path]) => {
      const s = sec(title);
      box.appendChild(s);
      const arr = await get(path);
      if (arr.length < 3) return s.remove();
      const row = s.querySelector(".hrow");
      arr.forEach((t, i) => row.appendChild(card(t, i, arr)));
    });
  }

  // combined search: Audius results shown under the existing Jamendo results
  ["homeSearch", "exploreSearch"].forEach((id) => {
    const input = $(id);
    if (!input) return;
    const wrap = document.createElement("div");
    wrap.className = "jbox";
    wrap.innerHTML = '<div class="jtitle"></div><div class="jl"></div>';
    input.parentNode.appendChild(wrap);
    let timer;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      const v = input.value.trim();
      timer = setTimeout(async () => {
        const list = wrap.querySelector(".jl");
        const title = wrap.querySelector(".jtitle");
        if (v.length < 2) { list.innerHTML = ""; title.textContent = ""; return; }
        const arr = await get(`/tracks/search?query=${encodeURIComponent(v)}&limit=25`);
        title.textContent = arr.length ? "More results" : "";
        list.innerHTML = "";
        arr.forEach((t, i) => {
          const r = document.createElement("button");
          r.className = "jr";
          r.innerHTML = '<div class="jc"></div><div style="min-width:0"><b></b><small></small></div>';
          if (t.image) r.querySelector(".jc").style.backgroundImage = `url("${t.image}")`;
          r.querySelector("b").textContent = t.name;
          r.querySelector("small").textContent = t.artist_name;
          r.onclick = () => UI.playList(arr, i);
          list.appendChild(r);
        });
      }, 450);
    });
  });
})();
