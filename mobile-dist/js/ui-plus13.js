/* eslint-disable */
(() => {
  const UI = window.VortexUI;
  const $ = (id) => document.getElementById(id);
  if (!UI) return;
  const GR = ["#6929c4,#db2777", "#0369a1,#7c3aed", "#be123c,#7c3aed", "#047857,#2563eb", "#b45309,#be123c"];
  const AR = "\u0639\u0631\u0628\u064a";

  const ov = async (q, n) => {
    try {
      const r = await fetch("https://api.openverse.org/v1/audio/?page_size=" + (n || 20) + "&q=" + encodeURIComponent(q));
      return ((await r.json()).results || []).filter((x) => x.url).map((x) => ({
        id: "ov" + x.id,
        name: x.title || "Untitled",
        artist_name: x.creator || "Openverse",
        image: x.thumbnail || "",
        audio: x.url,
        badge: "CC"
      }));
    } catch (e) { return []; }
  };
  const cc = async (tags) => {
    try {
      const r = await fetch("https://ccmixter.org/api/query?f=json&limit=20&sort=rank&tags=" + encodeURIComponent(tags));
      return (await r.json()).filter((x) => x.files && x.files[0] && x.files[0].download_url).map((x) => ({
        id: "cc" + x.upload_id,
        name: x.upload_name,
        artist_name: x.user_name,
        image: "",
        audio: x.files[0].download_url,
        badge: "CC"
      }));
    } catch (e) { return []; }
  };

  const card = (t, arr, i) => {
    const b = document.createElement("button");
    b.className = "hcard";
    b.innerHTML = '<div class="hc"></div><b></b><small></small>';
    const hc = b.querySelector(".hc");
    if (t.image) hc.style.backgroundImage = 'url("' + t.image + '")';
    else { hc.style.background = "linear-gradient(135deg," + GR[i % 5] + ")"; hc.textContent = (t.name || "V")[0]; }
    b.querySelector("b").textContent = t.name;
    const s = b.querySelector("small"); s.textContent = t.artist_name;
    const g = document.createElement("span"); g.className = "badge"; g.textContent = t.badge; s.after(g);
    b.onclick = () => UI.playList(arr, i);
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
  const ROWS = [
    ["Free full tracks - Arabic", () => ov(AR)],
    ["Free full tracks - Oud and Middle East", () => ov("oud")],
    ["Free full tracks - Pop", () => ov("pop")],
    ["Free full tracks - Rock", () => ov("rock")],
    ["Free full tracks - Hip-Hop", () => ov("hip hop")],
    ["Free full tracks - Electronic", () => ov("electronic")],
    ["Free full tracks - Classical", () => ov("classical piano")],
    ["Free full tracks - Jazz", () => ov("jazz")],
    ["Free full tracks - Folk and World", () => ov("world folk")],
    ["ccMixter - Hip-Hop", () => cc("hip_hop")],
    ["ccMixter - Instrumental", () => cc("instrumental")],
    ["ccMixter - Chill", () => cc("chill")]
  ];
  const fill = async (host) => {
    for (const [title, fn] of ROWS) {
      const { s, r } = section(host, title);
      const arr = await fn();
      r.innerHTML = "";
      if (arr.length < 3) { s.remove(); continue; }
      arr.forEach((t, i) => r.appendChild(card(t, arr, i)));
      await new Promise((x) => setTimeout(x, 200));
    }
  };

  const ex = $("explore");
  if (ex) { const h = document.createElement("div"); ex.appendChild(h); fill(h); }
  const ar = document.querySelector(".ar #arHome");
  if (ar) { const h = document.createElement("div"); ar.appendChild(h); (async () => { const { s, r } = section(h, "Free full tracks - Arabic (CC)"); const a = await ov(AR, 25); r.innerHTML = ""; if (a.length < 3) return s.remove(); a.forEach((t, i) => r.appendChild(card(t, a, i))); })(); }

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
        list.innerHTML = ""; title.textContent = "";
        if (v.length < 2) return;
        const res = await Promise.all([ov(v, 20), cc(v)]);
        const arr = res[0].concat(res[1]);
        title.textContent = arr.length ? "Free full tracks (CC)" : "";
        arr.forEach((t, i) => {
          const r = document.createElement("button");
          r.className = "jr";
          r.innerHTML = '<div class="jc"></div><div style="min-width:0"><b></b><small></small></div>';
          if (t.image) r.querySelector(".jc").style.backgroundImage = 'url("' + t.image + '")';
          r.querySelector("b").textContent = t.name;
          r.querySelector("small").textContent = t.artist_name + "  -  CC";
          r.onclick = () => UI.playList(arr, i);
          list.appendChild(r);
        });
      }, 500);
    });
  });
})();
