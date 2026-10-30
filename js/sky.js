// Twinkling starfield with the occasional shooting star.
(function () {
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w, h, stars = [], shooters = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round((w * h) / 4500);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.005,
      warm: Math.random() < 0.15,
    }));
  }

  function spawnShooter() {
    shooters.push({
      x: Math.random() * w * 0.8 + w * 0.2,
      y: Math.random() * h * 0.4,
      len: Math.random() * 120 + 80,
      speed: Math.random() * 6 + 8,
      life: 1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (const s of stars) {
      s.phase += s.speed;
      const alpha = 0.35 + Math.sin(s.phase) * 0.35 + 0.3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.warm ? `rgba(255, 214, 227, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }

    for (const sh of shooters) {
      const tailX = sh.x + sh.len;
      const tailY = sh.y - sh.len * 0.5;
      const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${sh.life})`);
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      sh.x -= sh.speed;
      sh.y += sh.speed * 0.5;
      sh.life -= 0.012;
    }
    shooters = shooters.filter((sh) => sh.life > 0);

    if (Math.random() < 0.006) spawnShooter();

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);

  if (reduceMotion) {
    // Draw a single still frame
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fill();
    }
  } else {
    draw();
  }
})();
