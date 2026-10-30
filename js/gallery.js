// Lightbox for the polaroid gallery: click to open, arrows / swipe to browse.
(function () {
  const items = [...document.querySelectorAll(".polaroid")];
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lb-img");
  const cap = document.getElementById("lb-cap");
  let current = 0;

  function show(index) {
    current = (index + items.length) % items.length;
    const source = items[current].querySelector("img");
    img.src = source.src;
    img.alt = source.alt;
    cap.textContent = items[current].querySelector("figcaption").textContent;
  }

  function open(index) {
    show(index);
    box.classList.add("open");
    box.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
  }

  function close() {
    box.classList.remove("open");
    box.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
  }

  items.forEach((item, index) => item.addEventListener("click", () => open(index)));

  box.querySelector(".lb-close").addEventListener("click", close);
  box.querySelector(".lb-prev").addEventListener("click", () => show(current - 1));
  box.querySelector(".lb-next").addEventListener("click", () => show(current + 1));
  box.addEventListener("click", (e) => {
    if (e.target === box) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  let touchX = null;
  box.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  box.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });
})();
