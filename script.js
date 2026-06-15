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

const serviceCards = document.querySelectorAll("#servicesGrid .service");

// ===== Окно каталога (все услуги по категориям) =====
const catalogModal = document.getElementById("catalogModal");
const catalogBody = document.getElementById("catalogBody");
const openCatalogBtn = document.getElementById("openCatalog");
const catGroups = [
  { key: "strizhki", title: "Стрижки" },
  { key: "boroda", title: "Борода и бритьё" },
  { key: "kompleksy", title: "Комплексы" },
  { key: "dop", title: "Дополнительные услуги" },
];

function buildCatalog() {
  catalogBody.innerHTML = "";
  catGroups.forEach((g) => {
    const cards = [...serviceCards].filter((c) => c.dataset.cat === g.key);
    if (!cards.length) return;
    const group = document.createElement("div");
    group.className = "cat-group";
    const h = document.createElement("h4");
    h.className = "cat-group__title";
    h.textContent = g.title;
    group.appendChild(h);
    const ul = document.createElement("ul");
    ul.className = "cat-list";
    cards.forEach((card) => {
      const name = card.querySelector("h4").textContent;
      const price = card.querySelector(".service__price").textContent;
      const li = document.createElement("li");
      li.className = "cat-item";
      li.innerHTML = `<span class="cat-item__name">${name}</span><span class="cat-item__dots"></span><span class="cat-item__price">${price}</span>`;
      li.addEventListener("click", () => {
        closeCatalog();
        openService(card);
      });
      ul.appendChild(li);
    });
    group.appendChild(ul);
    catalogBody.appendChild(group);
  });
}
function openCatalog() {
  if (!catalogBody.children.length) buildCatalog();
  catalogModal.classList.add("open");
  catalogModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeCatalog() {
  catalogModal.classList.remove("open");
  catalogModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
openCatalogBtn.addEventListener("click", openCatalog);
catalogModal.querySelectorAll("[data-close-catalog]").forEach((el) =>
  el.addEventListener("click", closeCatalog)
);

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
  if (e.key !== "Escape") return;
  if (modal.classList.contains("open")) closeService();
  else if (catalogModal.classList.contains("open")) closeCatalog();
});
