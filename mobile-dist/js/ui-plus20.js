/* eslint-disable */
(() => {
  const UI = window.VortexUI;
  const toast = (m) => { const t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); };

  // ---- download online track into Device ----
  const dbp = new Promise((res, rej) => {
    const q = indexedDB.open("vxdev", 1);
    q.onupgradeneeded = () => q.result.createObjectStore("songs", { keyPath: "id" });
    q.onsuccess = () => res(q.result);
    q.onerror = () => rej(q.error);
  });
  const save = async (rec) => {
    const db = await dbp;
    return new Promise((res, rej) => {
      const t = db.transaction("songs", "readwrite");
      t.objectStore("songs").put(rec);
      t.oncomplete = res;
      t.onerror = () => rej(t.error);
    });
  };
  const extra = document.querySelector(".fp-extra");
  if (extra && UI) {
    const b = document.createElement("button");
    b.textContent = "Download";
    b.onclick = async () => {
      const t = UI.current && UI.current();
      if (!t || !t.audio) { toast("Play an online song first"); return; }
      if (t.badge === "30s" || /itunes|mzstatic/.test(t.audio)) { toast("Previews cannot be downloaded"); return; }
      b.textContent = "Downloading...";
      try {
        const r = await fetch(t.audio);
        if (!r.ok) throw new Error("http");
        const blob = await r.blob();
        let cover = null;
        try { if (t.image) cover = await (await fetch(t.image)).blob(); } catch (e) {}
        await save({ id: "dl" + t.id, name: t.name, artist: t.artist_name || "Unknown artist", album: "", blob, cover });
        window.dispatchEvent(new Event("vx-reload"));
        toast("Saved to Device tab");
      } catch (e) { toast("This source blocks downloads"); }
      b.textContent = "Download";
    };
    extra.appendChild(b);
  }

  // ---- profile cleanup ----
  const prof = document.getElementById("profile");
  if (!prof) return;
  const old = Array.from(prof.querySelectorAll("button.playall")).find((x) => /Wrapped/.test(x.textContent));
  const sect = prof.querySelector(".profile-section");
  if (old && sect) {
    old.classList.add("wr-old");
    const row = document.createElement("button");
    row.type = "button";
    row.className = "profile-row";
    row.innerHTML = '<span class="profile-row-icon cyan">\u2605</span><span><strong>Your Wrapped</strong><small>Your listening stats</small></span><b>\u203A</b>';
    row.onclick = () => old.click();
    sect.appendChild(row);
  }
})();
