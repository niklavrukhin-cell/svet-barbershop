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
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        entry.target.style.transitionDelay = delay + "ms";
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);
function observeReveals(root) {
  (root || document).querySelectorAll(".reveal:not(.visible)").forEach((el) =>
    revealObserver.observe(el)
  );
}

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
  glow.style.transform = `translate(${curX - 240}px, ${curY - 240}px)`;
  requestAnimationFrame(animateGlow);
};
animateGlow();

// =====================================================================
//  КОНТЕНТ САЙТА (акция + услуги) — грузится с сервера, иначе дефолт
// =====================================================================
const catGroups = [
  { key: "strizhki", title: "Стрижки" },
  { key: "boroda", title: "Борода и бритьё" },
  { key: "kompleksy", title: "Комплексы" },
  { key: "dop", title: "Дополнительные услуги" },
];
const catTitle = (key) => (catGroups.find((g) => g.key === key) || {}).title || key;

// рабочая копия контента
let content = JSON.parse(JSON.stringify(window.DEFAULT_CONTENT));

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---- рендер акции ----
function renderPromo() {
  const p = content.promo || {};
  const section = document.getElementById("promoSection");
  const hasPromo = (p.title && p.title.trim()) || (p.text && p.text.trim());
  if (section) section.style.display = hasPromo ? "" : "none";
  document.getElementById("promoBadge").textContent = p.badge || "";
  document.getElementById("promoTitle").textContent = p.title || "";
  document.getElementById("promoText").innerHTML = p.text || "";
  const btn = document.getElementById("promoBtn");
  if (p.btnText && p.btnText.trim()) {
    btn.style.display = "";
    btn.textContent = p.btnText;
    btn.href = p.btnUrl || "#";
  } else {
    btn.style.display = "none";
  }
}

// ---- рендер карточек услуг ----
const servicesGrid = document.getElementById("servicesGrid");
function renderServices() {
  servicesGrid.innerHTML = "";
  (content.services || []).forEach((s) => {
    const art = document.createElement("article");
    art.className = "service reveal";
    art.dataset.cat = s.cat || "dop";
    art.dataset.id = s.id;
    art.tabIndex = 0;
    art.setAttribute("role", "button");
    art.setAttribute("aria-label", "Подробнее: " + (s.title || ""));
    art.innerHTML = `
      <div class="service__img"><img src="${escapeHtml(s.img)}" alt="${escapeHtml(s.title)}" loading="lazy" /></div>
      <div class="service__body">
        <div class="service__top"><h4>${escapeHtml(s.title)}</h4><span class="service__price">${escapeHtml(s.price)}</span></div>
        <p>${escapeHtml(s.short || "")}</p>
        <span class="service__more">Подробнее →</span>
      </div>`;
    art.addEventListener("click", () => openService(s));
    art.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openService(s);
      }
    });
    servicesGrid.appendChild(art);
  });
  observeReveals(servicesGrid);
}

function renderAll() {
  renderPromo();
  renderServices();
  catalogDirty = true; // каталог пересоберётся при следующем открытии
}

// ---- загрузка контента с сервера ----
async function loadContent() {
  try {
    const res = await fetch("/api/content", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.services) && data.services.length) {
        content = data;
      }
    }
  } catch (e) {
    /* нет сети/бэкенда — остаёмся на дефолте */
  }
  renderAll();
}

// =====================================================================
//  Окно каталога (все услуги по категориям)
// =====================================================================
const catalogModal = document.getElementById("catalogModal");
const catalogBody = document.getElementById("catalogBody");
const openCatalogBtn = document.getElementById("openCatalog");
let catalogDirty = true;

function buildCatalog() {
  catalogBody.innerHTML = "";
  catGroups.forEach((g) => {
    const items = (content.services || []).filter((s) => s.cat === g.key);
    if (!items.length) return;
    const group = document.createElement("div");
    group.className = "cat-group";
    const h = document.createElement("h4");
    h.className = "cat-group__title";
    h.textContent = g.title;
    group.appendChild(h);
    const ul = document.createElement("ul");
    ul.className = "cat-list";
    items.forEach((s) => {
      const li = document.createElement("li");
      li.className = "cat-item";
      li.innerHTML = `<span class="cat-item__name">${escapeHtml(s.title)}</span><span class="cat-item__dots"></span><span class="cat-item__price">${escapeHtml(s.price)}</span>`;
      li.addEventListener("click", () => {
        closeCatalog();
        openService(s);
      });
      ul.appendChild(li);
    });
    group.appendChild(ul);
    catalogBody.appendChild(group);
  });
  catalogDirty = false;
}
function openCatalog() {
  if (catalogDirty) buildCatalog();
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

// =====================================================================
//  Модальное окно услуги
// =====================================================================
const modal = document.getElementById("serviceModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");
const modalDesc = document.getElementById("modalDesc");

function openService(s) {
  modalImg.src = s.img || "";
  modalImg.alt = s.title || "";
  modalTitle.textContent = s.title || "";
  modalPrice.textContent = s.price || "";
  const full = Array.isArray(s.full) ? s.full : (s.full ? [s.full] : []);
  modalDesc.innerHTML = full.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeService() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
modal.querySelectorAll("[data-close]").forEach((el) =>
  el.addEventListener("click", closeService)
);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (modal.classList.contains("open")) closeService();
  else if (catalogModal.classList.contains("open")) closeCatalog();
  else if (adminLogin.classList.contains("open")) closeLogin();
});

// =====================================================================
//  АДМИН-РЕЖИМ
// =====================================================================
const headerLogo = document.getElementById("headerLogo");
const adminLogin = document.getElementById("adminLogin");
const adminPanel = document.getElementById("adminPanel");
const adminPassInput = document.getElementById("adminPass");
const adminError = document.getElementById("adminError");
const adminStatus = document.getElementById("adminStatus");
let adminPassword = ""; // хранится в памяти на время сессии

// --- тройной клик по логотипу ---
let clickCount = 0, clickTimer = null;
headerLogo.addEventListener("click", (e) => {
  clickCount++;
  if (clickCount === 1) {
    clickTimer = setTimeout(() => { clickCount = 0; }, 600);
  }
  if (clickCount >= 3) {
    e.preventDefault();
    clearTimeout(clickTimer);
    clickCount = 0;
    openLogin();
  }
});

function openLogin() {
  adminError.hidden = true;
  adminPassInput.value = "";
  adminLogin.classList.add("open");
  adminLogin.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => adminPassInput.focus(), 50);
}
function closeLogin() {
  adminLogin.classList.remove("open");
  adminLogin.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
adminLogin.querySelectorAll("[data-close-login]").forEach((el) =>
  el.addEventListener("click", closeLogin)
);

async function tryLogin() {
  const pass = adminPassInput.value;
  if (!pass) return;
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pass }),
    });
    if (res.ok) {
      adminPassword = pass;
      closeLogin();
      openPanel();
    } else {
      adminError.hidden = false;
    }
  } catch (e) {
    // бэкенд недоступен (например, открыто локально) — но дадим войти для предпросмотра
    adminError.textContent = "Бэкенд недоступен. Откройте сайт на Vercel, чтобы сохранять правки.";
    adminError.hidden = false;
  }
}
document.getElementById("adminEnter").addEventListener("click", tryLogin);
adminPassInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") tryLogin();
});

// --- панель ---
function openPanel() {
  fillPanel();
  adminPanel.classList.add("open");
  adminPanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("admin-open");
  document.body.style.overflow = "hidden";
}
function closePanel() {
  adminPanel.classList.remove("open");
  adminPanel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("admin-open");
  document.body.style.overflow = "";
}
document.getElementById("adminExit").addEventListener("click", closePanel);

// --- заполнение полей акции из текущего контента ---
function fillPanel() {
  const p = content.promo || {};
  document.getElementById("ap_badge").value = p.badge || "";
  document.getElementById("ap_title").value = p.title || "";
  document.getElementById("ap_text").value = p.text || "";
  document.getElementById("ap_btnText").value = p.btnText || "";
  document.getElementById("ap_btnUrl").value = p.btnUrl || "";
  renderAdminServices();
}

// --- считать акцию из полей обратно в контент ---
function readPromoFromPanel() {
  content.promo = {
    badge: document.getElementById("ap_badge").value.trim(),
    title: document.getElementById("ap_title").value.trim(),
    text: document.getElementById("ap_text").value,
    btnText: document.getElementById("ap_btnText").value.trim(),
    btnUrl: document.getElementById("ap_btnUrl").value.trim(),
  };
}

// --- редактор списка услуг ---
const adminServices = document.getElementById("adminServices");
function renderAdminServices() {
  adminServices.innerHTML = "";
  (content.services || []).forEach((s, idx) => {
    const card = document.createElement("div");
    card.className = "admin-service";
    const catOptions = catGroups
      .map((g) => `<option value="${g.key}" ${s.cat === g.key ? "selected" : ""}>${g.title}</option>`)
      .join("");
    const fullText = (Array.isArray(s.full) ? s.full : [s.full || ""]).join("\n\n");
    card.innerHTML = `
      <div class="admin-service__head">
        <span class="admin-service__name">${escapeHtml(s.title) || "Без названия"}</span>
        <div class="admin-service__head-actions">
          <button class="admin-btn admin-btn--up" data-act="up" title="Выше">↑</button>
          <button class="admin-btn admin-btn--up" data-act="down" title="Ниже">↓</button>
          <button class="admin-btn admin-btn--del" data-act="del">Удалить</button>
        </div>
      </div>
      <div class="admin-service__grid">
        <div class="admin-service__photo">
          <img src="${escapeHtml(s.img)}" alt="" class="admin-thumb" data-thumb />
          <label class="admin-upload">
            <span data-uploadlabel>Заменить фото</span>
            <input type="file" accept="image/*" data-file hidden />
          </label>
        </div>
        <div class="admin-service__fields">
          <label class="admin-field"><span>Название</span>
            <input type="text" class="admin-input" data-f="title" value="${escapeHtml(s.title)}" /></label>
          <div class="admin-row2">
            <label class="admin-field"><span>Цена</span>
              <input type="text" class="admin-input" data-f="price" value="${escapeHtml(s.price)}" /></label>
            <label class="admin-field"><span>Категория</span>
              <select class="admin-input" data-f="cat">${catOptions}</select></label>
          </div>
          <label class="admin-field"><span>Короткое описание (в карточке)</span>
            <input type="text" class="admin-input" data-f="short" value="${escapeHtml(s.short || "")}" /></label>
          <label class="admin-field"><span>Полное описание (абзацы разделяйте пустой строкой)</span>
            <textarea class="admin-input" data-f="full" rows="6">${escapeHtml(fullText)}</textarea></label>
        </div>
      </div>`;

    // привязка полей к данным
    card.querySelectorAll("[data-f]").forEach((inp) => {
      inp.addEventListener("input", () => {
        const f = inp.dataset.f;
        if (f === "full") {
          s.full = inp.value.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
        } else {
          s[f] = inp.value;
        }
        if (f === "title") {
          card.querySelector(".admin-service__name").textContent = inp.value || "Без названия";
        }
      });
    });

    // загрузка фото
    const fileInput = card.querySelector("[data-file]");
    const uploadLabel = card.querySelector("[data-uploadlabel]");
    const thumb = card.querySelector("[data-thumb]");
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if (!file) return;
      uploadLabel.textContent = "Загрузка…";
      try {
        const url = await uploadImage(file);
        s.img = url;
        thumb.src = url;
        uploadLabel.textContent = "Фото обновлено ✓";
      } catch (err) {
        uploadLabel.textContent = "Ошибка загрузки";
        alert("Не удалось загрузить фото: " + err.message);
      }
    });

    // кнопки порядка/удаления
    card.querySelector('[data-act="del"]').addEventListener("click", () => {
      if (confirm("Удалить услугу «" + (s.title || "") + "»?")) {
        content.services.splice(idx, 1);
        renderAdminServices();
      }
    });
    card.querySelector('[data-act="up"]').addEventListener("click", () => {
      if (idx > 0) {
        [content.services[idx - 1], content.services[idx]] = [content.services[idx], content.services[idx - 1]];
        renderAdminServices();
      }
    });
    card.querySelector('[data-act="down"]').addEventListener("click", () => {
      if (idx < content.services.length - 1) {
        [content.services[idx + 1], content.services[idx]] = [content.services[idx], content.services[idx + 1]];
        renderAdminServices();
      }
    });

    adminServices.appendChild(card);
  });
}

// добавить услугу
document.getElementById("adminAddService").addEventListener("click", () => {
  content.services = content.services || [];
  content.services.push({
    id: "service-" + Date.now(),
    cat: "strizhki",
    title: "Новая услуга",
    price: "0 ₽",
    short: "",
    img: "assets/services/muzhskaya-strizhka.png",
    full: [],
  });
  renderAdminServices();
  adminServices.lastChild.scrollIntoView({ behavior: "smooth", block: "center" });
});

// загрузка фото на сервер
async function uploadImage(file) {
  const res = await fetch(
    "/api/upload?filename=" + encodeURIComponent(file.name),
    {
      method: "POST",
      headers: {
        "x-admin-password": adminPassword,
        "content-type": file.type || "application/octet-stream",
      },
      body: file,
    }
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.status);
  }
  const data = await res.json();
  return data.url;
}

// сохранить и опубликовать
document.getElementById("adminSave").addEventListener("click", async () => {
  readPromoFromPanel();
  adminStatus.textContent = "Сохранение…";
  try {
    const res = await fetch("/api/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": adminPassword,
      },
      body: JSON.stringify(content),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || res.status);
    }
    adminStatus.textContent = "Опубликовано ✓";
    renderAll();
    setTimeout(() => (adminStatus.textContent = ""), 3000);
  } catch (err) {
    adminStatus.textContent = "";
    alert("Не удалось сохранить: " + err.message);
  }
});

// =====================================================================
//  СТАРТ
// =====================================================================
observeReveals(document);
loadContent();
