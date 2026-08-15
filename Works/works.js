const header = document.getElementById("site-header");
const menuButton = document.querySelector(".menu-button");
const mainNavigation = document.getElementById("main-navigation");
const worksPage = document.querySelector(".works-page");
const revealElements = [...document.querySelectorAll(".reveal-on-scroll")];
const filterButtons = [...document.querySelectorAll(".works-filter")];
const workCards = [...document.querySelectorAll(".work-card")];
const searchInput = document.getElementById("works-search-input");
const noResults = document.getElementById("works-no-results");
const readingPaths = [...document.querySelectorAll("[data-set-filter]")];

let activeFilter = "all";
let searchTerm = "";

function normalizeText(value) {
  return String(value || "")
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
}

function setMenu(open) {
  if (!menuButton || !mainNavigation) return;

  menuButton.setAttribute("aria-expanded", String(open));
  mainNavigation.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

function closeMenu() {
  setMenu(false);
}

function updatePageProgress() {
  if (!worksPage) return;

  const maximumScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );

  const progress = Math.min(1, Math.max(0, window.scrollY / maximumScroll));
  worksPage.style.setProperty("--works-progress", progress.toFixed(4));
  worksPage.style.setProperty("--works-angle", `${(progress * 40).toFixed(2)}deg`);
  worksPage.style.setProperty(
    "--works-angle-small",
    `${(progress * 28).toFixed(2)}deg`,
  );
}

function getCardCategories(card) {
  return normalizeText(card.dataset.category).split(" ").filter(Boolean);
}

function updateFilterCounts() {
  filterButtons.forEach((button) => {
    const filter = button.dataset.filter || "all";
    const count = workCards.filter((card) => {
      const categories = getCardCategories(card);
      return filter === "all" || categories.includes(filter);
    }).length;

    const countElement = button.querySelector("span");
    if (countElement) countElement.textContent = String(count).padStart(2, "0");
  });
}

function updateWorks() {
  let visibleCount = 0;

  workCards.forEach((card) => {
    const categories = getCardCategories(card);
    const searchableText = normalizeText(
      `${card.textContent || ""} ${card.dataset.search || ""}`,
    );

    const matchesCategory =
      activeFilter === "all" || categories.includes(activeFilter);
    const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
    const isVisible = matchesCategory && matchesSearch;

    card.classList.toggle("is-hidden", !isVisible);
    card.setAttribute("aria-hidden", String(!isVisible));

    if (isVisible) visibleCount += 1;
  });

  if (noResults) noResults.hidden = visibleCount !== 0;
}

function setActiveFilter(filter) {
  activeFilter = filter;

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  updateWorks();
}

function setupRevealObserver() {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -55px",
    },
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
    observer.observe(element);
  });
}

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenu(!isOpen);
});

mainNavigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveFilter(button.dataset.filter || "all");
  });
});

searchInput?.addEventListener("input", (event) => {
  searchTerm = normalizeText(event.currentTarget.value);
  updateWorks();
});

readingPaths.forEach((path) => {
  path.addEventListener("click", () => {
    const filter = path.dataset.setFilter;
    if (filter) setActiveFilter(filter);
  });
});

window.addEventListener(
  "scroll",
  () => {
    updateHeader();
    updatePageProgress();
  },
  { passive: true },
);

window.addEventListener("resize", () => {
  if (window.innerWidth > 860) closeMenu();
  updatePageProgress();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

updateHeader();
updatePageProgress();
updateFilterCounts();
setActiveFilter("all");
setupRevealObserver();
