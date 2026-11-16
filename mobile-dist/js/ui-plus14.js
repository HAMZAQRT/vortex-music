/* eslint-disable */
(() => {
  const hide = () => {
    document.querySelectorAll(".hcard,.jr").forEach((el) => {
      const t = el.textContent || "";
      if (/30s/.test(t)) el.style.display = "none";
    });
    document.querySelectorAll(".section").forEach((s) => {
      const t = (s.querySelector(".section-title") || {}).textContent || "";
      if (/\u0645\u0639\u0627\u064a\u0646\u0627\u062a/.test(t) || /Arabic pop - Egypt|Khaleeji - Saudi|Arabic hits - UAE|Levant|Top Pop|Hip-Hop - USA|Latin - Mexico|K-Pop|Rock classics/.test(t)) s.style.display = "none";
    });
  };
  new MutationObserver(hide).observe(document.body, { childList: true, subtree: true });
  hide();
})();
