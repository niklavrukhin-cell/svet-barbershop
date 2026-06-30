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
//  КОНТЕНТ САЙТА (акции + услуги + контакты) — грузится с сервера
// =====================================================================
const catGroups = [
  { key: "strizhki", title: "Стрижки" },
  { key: "boroda", title: "Борода и бритьё" },
  { key: "kompleksy", title: "Комплексы" },
  { key: "dop", title: "Дополнительные услуги" },
];

let content = normalizeContent(JSON.parse(JSON.stringify(window.DEFAULT_CONTENT)));

// приводим контент к актуальной структуре (миграция со старого формата)
function normalizeContent(c) {
  c = c || {};
  // старый формат: одиночный promo -> массив promos
  if (!Array.isArray(c.promos)) {
    c.promos = c.promo && (c.promo.title || c.promo.text)
      ? [Object.assign({ id: "promo-1", img: "" }, c.promo)]
      : [];
  }
  delete c.promo;
  if (!Array.isArray(c.services)) c.services = [];
  const D = window.DEFAULT_CONTENT || {};
  c.contacts = Object.assign({}, D.contacts || {}, c.contacts || {});
  c.hero = Object.assign({}, D.hero || {}, c.hero || {});
  c.review = Object.assign({}, D.review || {}, c.review || {});
  if (!Array.isArray(c.perks)) c.perks = (D.perks || []).slice();
  if (!Array.isArray(c.masters)) c.masters = (D.masters || []).map((m) => Object.assign({}, m));
  return c;
}

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function telHref(phone) {
  return "tel:" + String(phone || "").replace(/[^\d+]/g, "");
}

// ---- рендер акций ----
const promosWrap = document.getElementById("promosWrap");
const promoSection = document.getElementById("promoSection");
function renderPromos() {
  promosWrap.innerHTML = "";
  const list = content.promos || [];
  promoSection.style.display = list.length ? "" : "none";
  list.forEach((p) => {
    const card = document.createElement("div");
    card.className = "promo__inner reveal" + (p.img ? " promo__inner--photo" : "");
    const imgHtml = p.img
      ? `<div class="promo__img"><img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.title || "акция")}" loading="lazy" /></div>`
      : "";
    const btnHtml = (p.btnText && p.btnText.trim())
      ? `<a href="${escapeHtml(p.btnUrl || "#")}" target="_blank" rel="noopener" class="btn btn--solid">${escapeHtml(p.btnText)}</a>`
      : "";
    card.innerHTML = `
      ${imgHtml}
      <div class="promo__text-wrap">
        ${p.badge ? `<div class="promo__badge">${escapeHtml(p.badge)}</div>` : ""}
        ${p.title ? `<h2 class="promo__title">${escapeHtml(p.title)}</h2>` : ""}
        ${p.text ? `<p class="promo__text">${p.text}</p>` : ""}
        ${btnHtml}
      </div>`;
    promosWrap.appendChild(card);
  });
  observeReveals(promosWrap);
}

// ---- рендер контактов ----
const contactsList = document.getElementById("contactsList");
function renderContacts() {
  const c = content.contacts || {};
  const rows = [];
  if (c.address) {
    const addr = c.mapUrl
      ? `<a href="${escapeHtml(c.mapUrl)}" target="_blank" rel="noopener">${escapeHtml(c.address)}</a>`
      : escapeHtml(c.address);
    rows.push(`<li><span>Адрес</span> ${addr}</li>`);
  }
  if (c.phone) rows.push(`<li><span>Телефон</span> <a href="${telHref(c.phone)}">${escapeHtml(c.phone)}</a></li>`);
  if (c.telegram) rows.push(`<li><span>Telegram</span> <a href="${escapeHtml(c.telegramUrl || "#")}" target="_blank" rel="noopener">${escapeHtml(c.telegram)}</a></li>`);
  if (c.routeUrl) rows.push(`<li class="contacts__route"><a class="contacts__route-btn" href="${escapeHtml(c.routeUrl)}" target="_blank" rel="noopener">Как доехать →</a></li>`);
  if (c.bookingUrl) rows.push(`<li class="contacts__cta"><a class="btn btn--solid contacts__cta-btn" href="${escapeHtml(c.bookingUrl)}" target="_blank" rel="noopener" data-book>Записаться онлайн</a></li>`);
  contactsList.innerHTML = rows.join("");

  // телефон в блоке записи
  const bp = document.getElementById("bookingPhone");
  if (bp && c.phone) { bp.textContent = c.phone; bp.href = telHref(c.phone); }

  // все ссылки записи на сайте
  if (c.bookingUrl) {
    document.querySelectorAll("[data-book]").forEach((a) => (a.href = c.bookingUrl));
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

// ---- hero-подзаголовок ----
function renderHero() {
  const el = document.getElementById("heroSub");
  if (el && content.hero && content.hero.sub != null) el.innerHTML = content.hero.sub;
}

// ---- преимущества ----
const perksWrap = document.getElementById("perksWrap");
function renderPerks() {
  perksWrap.innerHTML = "";
  (content.perks || []).forEach((text) => {
    const div = document.createElement("div");
    div.className = "perk reveal";
    div.innerHTML = `<span class="perk__icon">✦</span><h3>${escapeHtml(text)}</h3>`;
    perksWrap.appendChild(div);
  });
  observeReveals(perksWrap);
}

// ---- мастера ----
const mastersGrid = document.getElementById("mastersGrid");
function renderMasters() {
  mastersGrid.innerHTML = "";
  (content.masters || []).forEach((m) => {
    const art = document.createElement("article");
    art.className = "master reveal";
    const initial = (m.name || "?").trim().charAt(0).toUpperCase();
    const photo = m.img
      ? `<img class="master__img" src="${escapeHtml(m.img)}" alt="${escapeHtml(m.name || "")}" loading="lazy" />`
      : "";
    art.innerHTML = `
      <div class="master__photo" data-initials="${escapeHtml(initial)}">${photo}</div>
      <h3>${escapeHtml(m.name || "")}</h3>
      <p>${escapeHtml(m.desc || "")}</p>`;
    mastersGrid.appendChild(art);
  });
  observeReveals(mastersGrid);
}

// ---- отзыв ----
function renderReview() {
  const r = content.review || {};
  const t = document.getElementById("reviewText");
  const c = document.getElementById("reviewCite");
  if (t) t.textContent = r.text || "";
  if (c) {
    c.innerHTML = r.cite
      ? `<a href="${escapeHtml(r.url || "#")}" target="_blank" rel="noopener">${escapeHtml(r.cite)}</a>`
      : "";
  }
}

function renderAll() {
  renderPromos();
  renderServices();
  renderContacts();
  renderHero();
  renderPerks();
  renderMasters();
  renderReview();
  catalogDirty = true;
}

// ---- загрузка контента с сервера ----
async function loadContent() {
  try {
    const res = await fetch("/api/content", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && (Array.isArray(data.services) || Array.isArray(data.promos))) {
        content = normalizeContent(data);
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
const modalCta = document.getElementById("modalCta");

function openService(s) {
  modalImg.src = s.img || "";
  modalImg.alt = s.title || "";
  modalTitle.textContent = s.title || "";
  modalPrice.textContent = s.price || "";
  // ссылка записи: своя у услуги, иначе общая запись
  const fallbackBook = (content.contacts && content.contacts.bookingUrl) || "https://n365899.yclients.com";
  modalCta.href = (s.bookUrl && s.bookUrl.trim()) ? s.bookUrl : fallbackBook;
  const full = Array.isArray(s.full) ? s.full : (s.full ? [s.full] : []);
  const first = full[0] || "";
  const rest = full.slice(1);
  let html = first ? `<p>${escapeHtml(first)}</p>` : "";
  if (rest.length) {
    html += `<div class="modal__more" hidden>${rest.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}</div>`;
    html += `<button type="button" class="modal__more-btn">Подробнее</button>`;
  }
  modalDesc.innerHTML = html;
  const moreBtn = modalDesc.querySelector(".modal__more-btn");
  if (moreBtn) {
    moreBtn.addEventListener("click", () => {
      const more = modalDesc.querySelector(".modal__more");
      const willShow = more.hidden;
      more.hidden = !willShow;
      moreBtn.textContent = willShow ? "Свернуть" : "Подробнее";
    });
  }
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
let adminPassword = "";

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

function fillPanel() {
  renderAdminPromos();
  renderAdminServices();
  renderAdminPerks();
  renderAdminMasters();
  const c = content.contacts || {};
  document.getElementById("ac_address").value = c.address || "";
  document.getElementById("ac_phone").value = c.phone || "";
  document.getElementById("ac_telegram").value = c.telegram || "";
  document.getElementById("ac_telegramUrl").value = c.telegramUrl || "";
  document.getElementById("ac_bookingUrl").value = c.bookingUrl || "";
  document.getElementById("ac_mapUrl").value = c.mapUrl || "";
  document.getElementById("ac_routeUrl").value = c.routeUrl || "";
  document.getElementById("ao_heroSub").value = (content.hero && content.hero.sub) || "";
  const r = content.review || {};
  document.getElementById("ao_reviewText").value = r.text || "";
  document.getElementById("ao_reviewCite").value = r.cite || "";
  document.getElementById("ao_reviewUrl").value = r.url || "";
}

// раздел «Другое»: считать одиночные поля обратно в контент
function readOtherFromPanel() {
  content.hero = { sub: document.getElementById("ao_heroSub").value };
  content.review = {
    text: document.getElementById("ao_reviewText").value,
    cite: document.getElementById("ao_reviewCite").value.trim(),
    url: document.getElementById("ao_reviewUrl").value.trim(),
  };
}

// --- редактор преимуществ ---
const adminPerks = document.getElementById("adminPerks");
function renderAdminPerks() {
  adminPerks.innerHTML = "";
  (content.perks || []).forEach((text, idx) => {
    const row = document.createElement("div");
    row.className = "admin-inline";
    row.innerHTML = `
      <input type="text" class="admin-input" value="${escapeHtml(text)}" />
      <button class="admin-btn admin-btn--del" title="Удалить">✕</button>`;
    const inp = row.querySelector("input");
    inp.addEventListener("input", () => { content.perks[idx] = inp.value; });
    row.querySelector("button").addEventListener("click", () => {
      content.perks.splice(idx, 1);
      renderAdminPerks();
    });
    adminPerks.appendChild(row);
  });
}
document.getElementById("adminAddPerk").addEventListener("click", () => {
  content.perks = content.perks || [];
  content.perks.push("Новый пункт");
  renderAdminPerks();
});

// --- редактор мастеров ---
const adminMasters = document.getElementById("adminMasters");
function renderAdminMasters() {
  adminMasters.innerHTML = "";
  (content.masters || []).forEach((m, idx) => {
    const card = document.createElement("div");
    card.className = "admin-service";
    card.innerHTML = `
      <div class="admin-service__head">
        <span class="admin-service__name">${escapeHtml(m.name) || "Мастер"}</span>
        <div class="admin-service__head-actions">
          <button class="admin-btn admin-btn--up" data-act="up" title="Выше">↑</button>
          <button class="admin-btn admin-btn--up" data-act="down" title="Ниже">↓</button>
          <button class="admin-btn admin-btn--del" data-act="del">Удалить</button>
        </div>
      </div>
      <div class="admin-service__grid">
        <div class="admin-service__photo">
          <img src="${escapeHtml(m.img) || ""}" alt="" class="admin-thumb" data-thumb ${m.img ? "" : 'style="opacity:.3"'} />
          <label class="admin-upload">
            <span data-uploadlabel>${m.img ? "Заменить фото" : "Добавить фото"}</span>
            <input type="file" accept="image/*" data-file hidden />
          </label>
          ${m.img ? '<button class="admin-btn admin-btn--del" data-act="delimg">Убрать фото</button>' : ""}
        </div>
        <div class="admin-service__fields">
          <label class="admin-field"><span>Имя</span>
            <input type="text" class="admin-input" data-f="name" value="${escapeHtml(m.name || "")}" /></label>
          <label class="admin-field"><span>Описание</span>
            <input type="text" class="admin-input" data-f="desc" value="${escapeHtml(m.desc || "")}" /></label>
        </div>
      </div>`;
    card.querySelectorAll("[data-f]").forEach((inp) => {
      inp.addEventListener("input", () => {
        m[inp.dataset.f] = inp.value;
        if (inp.dataset.f === "name") {
          card.querySelector(".admin-service__name").textContent = inp.value || "Мастер";
        }
      });
    });
    const fileInput = card.querySelector("[data-file]");
    const uploadLabel = card.querySelector("[data-uploadlabel]");
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if (!file) return;
      uploadLabel.textContent = "Загрузка…";
      try {
        const url = await uploadImage(file);
        m.img = url;
        renderAdminMasters();
      } catch (err) {
        uploadLabel.textContent = "Ошибка загрузки";
        alert("Не удалось загрузить фото: " + err.message);
      }
    });
    const delImgBtn = card.querySelector('[data-act="delimg"]');
    if (delImgBtn) delImgBtn.addEventListener("click", () => { m.img = ""; renderAdminMasters(); });
    card.querySelector('[data-act="del"]').addEventListener("click", () => {
      if (confirm("Удалить мастера «" + (m.name || "") + "»?")) {
        content.masters.splice(idx, 1);
        renderAdminMasters();
      }
    });
    card.querySelector('[data-act="up"]').addEventListener("click", () => {
      if (idx > 0) {
        [content.masters[idx - 1], content.masters[idx]] = [content.masters[idx], content.masters[idx - 1]];
        renderAdminMasters();
      }
    });
    card.querySelector('[data-act="down"]').addEventListener("click", () => {
      if (idx < content.masters.length - 1) {
        [content.masters[idx + 1], content.masters[idx]] = [content.masters[idx], content.masters[idx + 1]];
        renderAdminMasters();
      }
    });
    adminMasters.appendChild(card);
  });
}
document.getElementById("adminAddMaster").addEventListener("click", () => {
  content.masters = content.masters || [];
  content.masters.push({ name: "Новый мастер", desc: "" });
  renderAdminMasters();
});

// --- аккордеон разделов ---
document.querySelectorAll("[data-acc-toggle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.closest(".admin-acc").classList.toggle("open");
  });
});

function readContactsFromPanel() {
  content.contacts = {
    address: document.getElementById("ac_address").value.trim(),
    phone: document.getElementById("ac_phone").value.trim(),
    telegram: document.getElementById("ac_telegram").value.trim(),
    telegramUrl: document.getElementById("ac_telegramUrl").value.trim(),
    bookingUrl: document.getElementById("ac_bookingUrl").value.trim(),
    mapUrl: document.getElementById("ac_mapUrl").value.trim(),
    routeUrl: document.getElementById("ac_routeUrl").value.trim(),
  };
}

// загрузка фото на сервер (используется и для услуг, и для акций)
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

// --- редактор акций ---
const adminPromos = document.getElementById("adminPromos");
function renderAdminPromos() {
  adminPromos.innerHTML = "";
  (content.promos || []).forEach((p, idx) => {
    const card = document.createElement("div");
    card.className = "admin-service";
    card.innerHTML = `
      <div class="admin-service__head">
        <span class="admin-service__name">${escapeHtml(p.title) || "Акция"}</span>
        <div class="admin-service__head-actions">
          <button class="admin-btn admin-btn--up" data-act="up" title="Выше">↑</button>
          <button class="admin-btn admin-btn--up" data-act="down" title="Ниже">↓</button>
          <button class="admin-btn admin-btn--del" data-act="del">Удалить</button>
        </div>
      </div>
      <div class="admin-service__grid">
        <div class="admin-service__photo">
          <img src="${escapeHtml(p.img) || ""}" alt="" class="admin-thumb" data-thumb ${p.img ? "" : 'style="opacity:.3"'} />
          <label class="admin-upload">
            <span data-uploadlabel>${p.img ? "Заменить фото" : "Добавить фото"}</span>
            <input type="file" accept="image/*" data-file hidden />
          </label>
          ${p.img ? '<button class="admin-btn admin-btn--del" data-act="delimg">Убрать фото</button>' : ""}
        </div>
        <div class="admin-service__fields">
          <label class="admin-field"><span>Бейдж (маленькая надпись)</span>
            <input type="text" class="admin-input" data-f="badge" value="${escapeHtml(p.badge || "")}" /></label>
          <label class="admin-field"><span>Заголовок</span>
            <input type="text" class="admin-input" data-f="title" value="${escapeHtml(p.title || "")}" /></label>
          <label class="admin-field"><span>Текст (можно &lt;br&gt; для переноса строки)</span>
            <textarea class="admin-input" data-f="text" rows="2">${escapeHtml(p.text || "")}</textarea></label>
          <div class="admin-row2">
            <label class="admin-field"><span>Текст кнопки (пусто — без кнопки)</span>
              <input type="text" class="admin-input" data-f="btnText" value="${escapeHtml(p.btnText || "")}" /></label>
            <label class="admin-field"><span>Ссылка кнопки</span>
              <input type="text" class="admin-input" data-f="btnUrl" value="${escapeHtml(p.btnUrl || "")}" /></label>
          </div>
        </div>
      </div>`;

    card.querySelectorAll("[data-f]").forEach((inp) => {
      inp.addEventListener("input", () => {
        p[inp.dataset.f] = inp.value;
        if (inp.dataset.f === "title") {
          card.querySelector(".admin-service__name").textContent = inp.value || "Акция";
        }
      });
    });

    const fileInput = card.querySelector("[data-file]");
    const uploadLabel = card.querySelector("[data-uploadlabel]");
    const thumb = card.querySelector("[data-thumb]");
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if (!file) return;
      uploadLabel.textContent = "Загрузка…";
      try {
        const url = await uploadImage(file);
        p.img = url;
        renderAdminPromos();
      } catch (err) {
        uploadLabel.textContent = "Ошибка загрузки";
        alert("Не удалось загрузить фото: " + err.message);
      }
    });

    const delImgBtn = card.querySelector('[data-act="delimg"]');
    if (delImgBtn) delImgBtn.addEventListener("click", () => { p.img = ""; renderAdminPromos(); });

    card.querySelector('[data-act="del"]').addEventListener("click", () => {
      if (confirm("Удалить эту акцию?")) {
        content.promos.splice(idx, 1);
        renderAdminPromos();
      }
    });
    card.querySelector('[data-act="up"]').addEventListener("click", () => {
      if (idx > 0) {
        [content.promos[idx - 1], content.promos[idx]] = [content.promos[idx], content.promos[idx - 1]];
        renderAdminPromos();
      }
    });
    card.querySelector('[data-act="down"]').addEventListener("click", () => {
      if (idx < content.promos.length - 1) {
        [content.promos[idx + 1], content.promos[idx]] = [content.promos[idx], content.promos[idx + 1]];
        renderAdminPromos();
      }
    });

    adminPromos.appendChild(card);
  });
}

document.getElementById("adminAddPromo").addEventListener("click", () => {
  content.promos = content.promos || [];
  content.promos.push({
    id: "promo-" + Date.now(),
    badge: "акция",
    title: "Новая акция",
    text: "",
    img: "",
    btnText: "Записаться",
    btnUrl: (content.contacts && content.contacts.bookingUrl) || "https://n365899.yclients.com",
  });
  renderAdminPromos();
  adminPromos.lastChild.scrollIntoView({ behavior: "smooth", block: "center" });
});

// --- редактор услуг ---
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
          <label class="admin-field"><span>Ссылка записи на эту услугу (необязательно — с выбранной услугой в YClients)</span>
            <input type="text" class="admin-input" data-f="bookUrl" value="${escapeHtml(s.bookUrl || "")}" placeholder="https://n365899.yclients.com/...select-services?o=..." /></label>
        </div>
      </div>`;

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

// сохранить и опубликовать
document.getElementById("adminSave").addEventListener("click", async () => {
  readContactsFromPanel();
  readOtherFromPanel();
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
