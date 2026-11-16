(() => {
  const UI = window.VortexUI;
  const $ = (id) => document.getElementById(id);
  if (!UI) return;
  const ID = "742f09e7";
  const GR = ["#6929c4,#db2777","#0369a1,#7c3aed","#be123c,#7c3aed","#047857,#2563eb","#b45309,#be123c","#0f766e,#4338ca"];
  const get = async (ep, q) => {
    try {
      const r = await fetch(`https://api.jamendo.com/v3.0/${ep}/?client_id=${ID}&format=json&imagesize=300&${q}`);
      return (await r.json()).results || [];
    } catch { return []; }
  };
  const tracks = async (q) => (await get("tracks", `limit=20&audioformat=mp32&${q}`)).filter((t) => t.audio);
  const card = (title, sub, img, i, fn, cls) => {
    const b = document.createElement("button");
    b.className = "hcard " + (cls || "");
    b.innerHTML = '<div class="hc"></div><b></b><small></small>';
    const hc = b.querySelector(".hc");
    if (img) hc.style.backgroundImage = `url("${img}")`;
    else { hc.style.background = `linear-gradient(135deg,${GR[i % GR.length]})`; hc.textContent = (title || "V")[0]; }
    b.querySelector("b").textContent = title;
    b.querySelector("small").textContent = sub;
    b.onclick = fn;
    return b;
  };
  const sec = (title) => {
    const s = document.createElement("div");
    s.className = "section";
    s.innerHTML = '<div class="section-header"><div class="section-title"></div></div><div class="hrow"></div>';
    s.querySelector(".section-title").textContent = title;
    return s;
  };

  const ROWS = [
    ["Trending now", "order=popularity_week", "t"],
    ["New releases", "order=releasedate_desc", "t"],
    ["Popular artists", "", "a"],
    ["Arabic", "lang=ar&order=popularity_month", "t"],
    ["Chill vibes", "tags=chillout&order=popularity_month", "t"],
    ["Pop hits", "tags=pop&order=popularity_month", "t"],
    ["Rock", "tags=rock&order=popularity_month", "t"],
    ["Electronic", "tags=electronic&order=popularity_month", "t"],
    ["Hip-Hop", "tags=hiphop&order=popularity_month", "t"],
    ["Jazz & Lounge", "tags=jazz&order=popularity_month", "t"],
    ["Acoustic", "tags=acoustic&order=popularity_month", "t"]
  ];

  const home = $("home");
  const hero = home && home.querySelector(".hero");
  if (hero) {
    const box = document.createElement("div");
    hero.after(box);
    let first = [];
    ROWS.forEach(async ([title, q, kind]) => {
      const s = sec(title);
      const row = s.querySelector(".hrow");
      box.appendChild(s);
      if (kind === "a") {
        const arr = await get("artists", "limit=15&order=popularity_week");
        if (!arr.length) return s.remove();
        arr.forEach((a, i) => row.appendChild(card(a.name, "Artist", a.image, i, async () => {
          const t = await tracks(`artist_id=${a.id}&order=popularity_total`);
          if (t.length) UI.playList(t, 0);
        }, "art")));
        return;
      }
      const arr = await tracks(q);
      if (!arr.length) return s.remove();
      if (title === "Trending now") first = arr;
      arr.forEach((t, i) => row.appendChild(card(t.name, t.artist_name, t.image, i, () => UI.playList(arr, i))));
    });
    const hp = $("heroPlay");
    if (hp) hp.addEventListener("click", async (e) => {
      e.stopImmediatePropagation();
      const t = first.length ? first : await tracks("order=popularity_week");
      if (t.length) UI.playList(t, 0);
    }, true);
  }

  const tidy = () => {
    ["hrowNew", "hrowTop"].forEach((id) => { const s = $(id) && $(id).closest(".section"); if (s) s.style.display = "none"; });
    const tl = $("trackList");
    const s = tl && tl.closest(".section");
    if (s) s.style.display = tl.children.length ? "" : "none";
  };
  setInterval(tidy, 1200);
  tidy();

  const ex = $("exploreSearch");
  if (ex) {
    const G = [["Pop","pop"],["Rock","rock"],["Electronic","electronic"],["Hip-Hop","hiphop"],["Jazz","jazz"],["Classical","classical"],["Arabic","lang=ar"],["Chill","chillout"],["Acoustic","acoustic"],["Dance","dance"],["Metal","metal"],["Reggae","reggae"]];
    const grid = document.createElement("div");
    grid.className = "gg";
    const out = document.createElement("div");
    G.forEach(([n, tag], i) => {
      const b = document.createElement("button");
      b.className = "gt";
      b.style.background = `linear-gradient(135deg,${GR[i % GR.length]})`;
      b.textContent = n;
      b.onclick = async () => {
        const arr = await tracks((tag.includes("=") ? tag : "tags=" + tag) + "&order=popularity_month");
        out.innerHTML = '<div class="jtitle"></div>';
        out.firstChild.textContent = n;
        arr.forEach((t, k) => {
          const r = document.createElement("button");
          r.className = "jr";
          r.innerHTML = '<div class="jc"></div><div style="min-width:0"><b></b><small></small></div>';
          if (t.image) r.querySelector(".jc").style.backgroundImage = `url("${t.image}")`;
          r.querySelector("b").textContent = t.name;
          r.querySelector("small").textContent = t.artist_name;
          r.onclick = () => UI.playList(arr, k);
          out.appendChild(r);
        });
        out.scrollIntoView({ behavior: "smooth" });
      };
      grid.appendChild(b);
    });
    ex.after(grid);
    grid.after(out);
  }
})();
