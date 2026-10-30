// The celebration bits: gift gate, confetti, birthday tune, letter and cake.
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ================= Confetti =================
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  const colors = ["#ff6b9d", "#f7c873", "#ffd6e3", "#c48ad8", "#ffffff", "#e0457b"];
  let pieces = [];
  let running = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  function burst(x, y, count = 160) {
    if (reduceMotion) return;
    for (let n = 0; n < count; n++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 3;
      pieces.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        size: Math.random() * 8 + 6,
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() < 0.3 ? "heart" : Math.random() < 0.5 ? "circle" : "rect",
        life: 1,
      });
    }
    if (!running) {
      running = true;
      requestAnimationFrame(drawConfetti);
    }
  }

  function drawConfetti() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of pieces) {
      p.vy += 0.22;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 0.006;

      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      if (p.shape === "heart") {
        ctx.font = `${p.size * 1.8}px serif`;
        ctx.fillText("♥", -p.size / 2, p.size / 2);
      } else if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }
    pieces = pieces.filter((p) => p.life > 0 && p.y < window.innerHeight + 50);

    if (pieces.length) {
      requestAnimationFrame(drawConfetti);
    } else {
      running = false;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function celebrate() {
    const w = window.innerWidth, h = window.innerHeight;
    burst(w / 2, h / 2);
    setTimeout(() => burst(w * 0.2, h * 0.4, 90), 300);
    setTimeout(() => burst(w * 0.8, h * 0.4, 90), 550);
  }

  // ================= Birthday tune (Web Audio, no file needed) =================
  // "Happy Birthday" melody: [frequency, beats]
  const G4 = 392, A4 = 440, B4 = 493.88, C5 = 523.25, D5 = 587.33,
        E5 = 659.25, F5 = 698.46, G5 = 783.99;
  const melody = [
    [G4, .75], [G4, .25], [A4, 1], [G4, 1], [C5, 1], [B4, 2],
    [G4, .75], [G4, .25], [A4, 1], [G4, 1], [D5, 1], [C5, 2],
    [G4, .75], [G4, .25], [G5, 1], [E5, 1], [C5, 1], [B4, 1], [A4, 2],
    [F5, .75], [F5, .25], [E5, 1], [C5, 1], [D5, 1], [C5, 3],
  ];
  const beat = 0.48;
  let audio = null, master = null, loopTimer = null, playing = false;
  const musicBtn = document.getElementById("music-toggle");

  function note(freq, start, length) {
    for (const [type, mult, vol] of [["triangle", 1, 0.22], ["sine", 0.5, 0.12], ["sine", 2, 0.03]]) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = type;
      osc.frequency.value = freq * mult;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + length * 0.95);
      osc.connect(gain).connect(master);
      osc.start(start);
      osc.stop(start + length);
    }
  }

  function playMelody() {
    let t = audio.currentTime + 0.1;
    for (const [freq, beats] of melody) {
      note(freq, t, beats * beat);
      t += beats * beat;
    }
    // Pause for a moment, then sing it again
    loopTimer = setTimeout(playMelody, (t - audio.currentTime + 2) * 1000);
  }

  function startMusic() {
    if (!audio) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audio = new Ctx();
      master = audio.createGain();
      master.gain.value = 0.6;
      master.connect(audio.destination);
    }
    audio.resume();
    master.gain.setValueAtTime(0.6, audio.currentTime);
    playMelody();
    playing = true;
    musicBtn.classList.add("playing");
    musicBtn.setAttribute("aria-label", "Pause birthday tune");
  }

  function stopMusic() {
    clearTimeout(loopTimer);
    if (master) master.gain.setTargetAtTime(0, audio.currentTime, 0.05);
    playing = false;
    musicBtn.classList.remove("playing");
    musicBtn.setAttribute("aria-label", "Play birthday tune");
  }

  musicBtn.addEventListener("click", () => {
    if (playing) {
      stopMusic();
    } else {
      // Fresh context timing so muted leftovers don't overlap
      if (audio) {
        audio.close();
        audio = null;
      }
      startMusic();
    }
  });

  // ================= Gift gate =================
  const gate = document.getElementById("gate");
  document.getElementById("open-gift").addEventListener("click", () => {
    gate.classList.add("opening");
    startMusic();
    setTimeout(() => {
      celebrate();
      gate.classList.add("hidden");
      document.body.classList.remove("locked");
      document.body.classList.add("opened");
      document.dispatchEvent(new Event("gift-opened"));
    }, 700);
  });

  // ================= Letter =================
  const envelope = document.getElementById("envelope");
  function openLetter() {
    if (envelope.classList.contains("open")) return;
    envelope.classList.add("open");
    envelope.removeAttribute("role");
    envelope.removeAttribute("tabindex");
    setTimeout(() => {
      envelope.classList.add("read");
      envelope.querySelectorAll(".paper p").forEach((p, n) => {
        p.style.animationDelay = 0.3 + n * 0.35 + "s";
      });
      const rect = envelope.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + 40, 70);
    }, 1300);
  }
  envelope.addEventListener("click", openLetter);
  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLetter();
    }
  });

  // ================= Cake =================
  const cake = document.getElementById("cake-el");
  function blowCandles() {
    if (cake.classList.contains("out")) return;
    cake.classList.add("out");
    document.getElementById("cake-hint").textContent = "Your wish is on its way 🌠";
    document.getElementById("wish-msg").classList.add("show");
    const rect = cake.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + 40, 200);
  }
  cake.addEventListener("click", blowCandles);
  cake.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      blowCandles();
    }
  });

  // ================= Finale =================
  document.getElementById("replay").addEventListener("click", () => {
    celebrate();
    // Relight the candles so she can wish again
    cake.classList.remove("out");
    document.getElementById("cake-hint").textContent = "Tap the candles to blow them out";
    document.getElementById("wish-msg").classList.remove("show");
  });
})();
