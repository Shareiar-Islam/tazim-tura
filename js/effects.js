// Hero text animation, floating hearts, sparkle trail, scroll reveals and flip cards.
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Hero name: split into letters so each one can pop in ----
  const nameEl = document.getElementById("hero-name");
  let i = 0;
  nameEl.innerHTML = nameEl.textContent
    .trim()
    .split(" ")
    .map((word) => {
      const letters = [...word]
        .map((ch) => `<span class="letter" style="animation-delay:${0.4 + i++ * 0.06}s">${ch}</span>`)
        .join("");
      return `<span class="word">${letters}</span>`;
    })
    .join(" ");

  // ---- Typewriter ----
  const lines = [
    "To the girl I've never held, but somehow always feel close to.",
    "Distance never stood a chance against us.",
    "Today, the whole sky is celebrating you. ✨",
    "And so am I, from miles away, with all my heart. 💖",
  ];
  const typeEl = document.getElementById("typewriter");

  function typewriter() {
    let line = 0, pos = 0, deleting = false;
    (function tick() {
      const text = lines[line];
      typeEl.textContent = text.slice(0, pos);
      let delay = deleting ? 25 : 55;
      if (!deleting && pos === text.length) {
        deleting = true;
        delay = 2200;
      } else if (deleting && pos === 0) {
        deleting = false;
        line = (line + 1) % lines.length;
        delay = 400;
      } else {
        pos += deleting ? -1 : 1;
      }
      setTimeout(tick, delay);
    })();
  }

  // ---- Floating hearts ----
  const heartLayer = document.getElementById("hearts");
  const heartChars = ["♥", "❤", "💕", "💗", "✦"];

  function spawnHeart() {
    const el = document.createElement("span");
    el.className = "float-heart";
    el.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
    el.style.left = Math.random() * 100 + "vw";
    el.style.fontSize = Math.random() * 16 + 12 + "px";
    el.style.animationDuration = Math.random() * 6 + 8 + "s";
    heartLayer.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }

  // ---- Sparkle trail following the pointer ----
  let lastSparkle = 0;
  function sparkle(x, y) {
    const now = performance.now();
    if (now - lastSparkle < 40) return;
    lastSparkle = now;
    const el = document.createElement("span");
    el.className = "sparkle";
    el.style.left = x - 4 + "px";
    el.style.top = y - 4 + "px";
    el.style.setProperty("--dx", (Math.random() - 0.5) * 40 + "px");
    el.style.setProperty("--dy", Math.random() * 30 + 10 + "px");
    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }

  // ---- Reveal on scroll ----
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  // ---- Reason cards ----
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => card.classList.toggle("flipped"));
  });

  // ---- Start everything once the gift is opened ----
  document.addEventListener("gift-opened", () => {
    typewriter();
    if (reduceMotion) return;
    for (let n = 0; n < 12; n++) setTimeout(spawnHeart, n * 150);
    setInterval(spawnHeart, 900);
    window.addEventListener("pointermove", (e) => sparkle(e.clientX, e.clientY));
  }, { once: true });
})();
