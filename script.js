const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

/* ---------- прожектор за курсором ---------- */
window.addEventListener("pointermove", (e) => {
  root.style.setProperty("--mx", `${e.clientX}px`);
  root.style.setProperty("--my", `${e.clientY}px`);
});

/* ---------- навигация прячется при скролле вниз ---------- */
const nav = document.querySelector(".nav");
let lastY = 0;
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  nav?.classList.toggle("is-hidden", y > lastY && y > 200);
  lastY = y;
}, { passive: true });

/* ---------- печатающий терминал ---------- */
// строки задаёт каждая страница через window.TERMINAL_LINES
const lines = window.TERMINAL_LINES || [];
const typed = document.getElementById("typed");

// печатаем посимвольно, не разрывая html-теги
function tokenize(html) {
  return html.match(/<[^>]+>|&[a-z]+;|./g) || [];
}

async function typeLoop() {
  if (!typed || !lines.length) return;
  if (reduceMotion) { typed.innerHTML = lines[0]; return; }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let i = 0;
  while (true) {
    const tokens = tokenize(lines[i % lines.length]);
    let out = "";
    for (const t of tokens) {
      out += t;
      typed.innerHTML = out;
      if (!t.startsWith("<")) await sleep(38 + Math.random() * 40);
    }
    await sleep(1800);
    while (tokens.length) {
      tokens.pop();
      typed.innerHTML = tokens.join("");
      await sleep(14);
    }
    await sleep(300);
    i++;
  }
}
typeLoop();

/* ---------- 3D-наклон голограммы и телефона (только мышь) ---------- */
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
document.querySelectorAll("[data-tilt]").forEach((el) => {
  if (reduceMotion || !finePointer) return;
  const max = el.classList.contains("phone") ? 8 : 14;
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(x - 0.5) * max}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * max}deg`);
    el.style.setProperty("--px", `${x * 100}%`);
    el.style.setProperty("--py", `${y * 100}%`);
  });
  el.addEventListener("pointerleave", () => {
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--px", "50%");
    el.style.setProperty("--py", "50%");
  });
});

/* ---------- блик по карточкам за курсором ---------- */
document.addEventListener("pointermove", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty("--cx", `${e.clientX - r.left}px`);
  card.style.setProperty("--cy", `${e.clientY - r.top}px`);
});

/* ---------- счётчики ---------- */
function countUp(el) {
  const target = +el.dataset.count;
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  if (reduceMotion) { el.textContent = prefix + target + suffix; return; }
  const dur = 1400;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- появление при скролле ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add("is-visible");
    el.querySelectorAll("[data-count]").forEach(countUp);
    io.unobserve(el);
  });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".reveal, .step, .phone").forEach((el, i) => {
  // лёгкий каскад для соседних элементов
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  const idx = siblings.indexOf(el);
  if (idx > 0) el.style.transitionDelay = `${Math.min(idx, 5) * 80}ms`;
  io.observe(el);
});

/* ---------- магнитные кнопки ---------- */
if (!reduceMotion && finePointer) {
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
    });
    btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
  });
}
