/* eslint-disable */
(() => {
  const page = document.querySelector(".ar.lv");
  if (!page) return;
  const API = (window.VORTEX_CONFIG && window.VORTEX_CONFIG.apiBase) || "";
  const list = page.querySelector("#lvList");
  const box = document.createElement("div");
  box.innerHTML = '<div class="jtitle">Friends in live rooms</div><div class="fr" id="frRow"></div>';
  list.before(box);
  const row = box.querySelector("#frRow");

  const load = async () => {
    if (!page.classList.contains("show")) return;
    const tk = window.VortexAuth && window.VortexAuth.getToken();
    if (!tk) { box.style.display = "none"; return; }
    try {
      const r = await fetch(API + "/api/mobile/live/friends", { headers: { Authorization: "Bearer " + tk, Accept: "application/json" } });
      const j = await r.json();
      const f = j.friends || [];
      row.innerHTML = "";
      box.style.display = f.length ? "" : "none";
      f.forEach((x) => {
        const b = document.createElement("button");
        b.innerHTML = "<b></b><small></small><i>Join</i>";
        b.querySelector("b").textContent = x.name;
        b.querySelector("small").textContent = x.roomTitle;
        b.onclick = () => {
          const cards = Array.from(page.querySelectorAll(".lvcard"));
          const c = cards.find((e) => e.querySelector("b").textContent === x.roomTitle);
          if (c) c.click();
        };
        row.appendChild(b);
      });
    } catch (e) {}
  };
  setInterval(load, 7000);
  setTimeout(load, 1500);
})();
