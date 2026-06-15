// ===== Прелоадер =====
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("preloader").classList.add("hidden");
  }, 1100);
});

// ===== Шапка: фон при скролле =====
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 40);
});

// ===== Мобильное меню =====
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
burger.addEventListener("click", () => {
  burger.classList.toggle("open");
  nav.classList.toggle("open");
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    burger.classList.remove("open");
    nav.classList.remove("open");
  })
);

// ===== Reveal при скролле =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // лёгкая каскадная задержка для соседних элементов
        const delay = entry.target.dataset.delay || 0;
        entry.target.style.transitionDelay = delay + "ms";
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);

// добавляем каскад внутри сеток
document.querySelectorAll(".services__grid, .masters__grid, .gallery__grid, .stats").forEach((grid) => {
  [...grid.children].forEach((child, i) => {
    if (child.classList.contains("reveal")) child.dataset.delay = i * 80;
  });
});
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ===== Анимация счётчиков =====
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      const duration = 1600;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + (el.dataset.suffix || "");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll(".stat__num").forEach((el) => statObserver.observe(el));

// ===== Параллакс солнца в hero =====
const heroSun = document.querySelector(".hero__sun");
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  if (y < window.innerHeight) {
    heroSun.style.transform = `translate(-50%, calc(-50% + ${y * 0.25}px))`;
    heroSun.style.opacity = Math.max(1 - y / (window.innerHeight * 0.8), 0);
  }
});

// ===== Курсор-свечение =====
const glow = document.getElementById("cursorGlow");
let glowX = 0, glowY = 0, curX = 0, curY = 0;
window.addEventListener("mousemove", (e) => {
  glow.style.opacity = "1";
  glowX = e.clientX;
  glowY = e.clientY;
});
const animateGlow = () => {
  curX += (glowX - curX) * 0.12;
  curY += (glowY - curY) * 0.12;
  // transform вместо left/top — без перерисовки страницы (GPU composite)
  glow.style.transform = `translate(${curX - 240}px, ${curY - 240}px)`;
  requestAnimationFrame(animateGlow);
};
animateGlow();

// ===== Фильтр каталога по категориям =====
const tabs = document.querySelectorAll(".stab");
const serviceCards = document.querySelectorAll("#servicesGrid .service");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    const filter = tab.dataset.filter;
    serviceCards.forEach((card) => {
      const show = filter === "all" || card.dataset.cat === filter;
      card.style.display = show ? "" : "none";
    });
  });
});

// ===== Модальное окно услуги =====
const modal = document.getElementById("serviceModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");
const modalDesc = document.getElementById("modalDesc");

function openService(card) {
  const img = card.querySelector(".service__img img");
  modalImg.src = img.src;
  modalImg.alt = img.alt;
  modalTitle.textContent = card.querySelector("h4").textContent;
  modalPrice.textContent = card.querySelector(".service__price").textContent;
  modalDesc.innerHTML = card.querySelector(".service__full").innerHTML;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeService() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
document.querySelectorAll(".service").forEach((card) => {
  card.addEventListener("click", () => openService(card));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openService(card);
    }
  });
});
modal.querySelectorAll("[data-close]").forEach((el) =>
  el.addEventListener("click", closeService)
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeService();
});

// ===== Форма записи =====
const form = document.getElementById("bookForm");
const note = document.getElementById("formNote");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  note.textContent = `${name ? name + ", спасибо" : "Спасибо"}! Заявка принята — перезвоним в течение 15 минут.`;
  note.classList.add("show");
  form.reset();
  setTimeout(() => note.classList.remove("show"), 6000);
});
