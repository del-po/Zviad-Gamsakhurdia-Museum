const header = document.getElementById("site-header");
const menuButton = document.querySelector(".menu-button");
const mainNavigation = document.getElementById("main-navigation");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const postCards = [...document.querySelectorAll(".post-card")];
const searchInput = document.getElementById("article-search");
const noResults = document.getElementById("no-results");
const revealElements = [...document.querySelectorAll(".reveal-on-scroll")];

let activeFilter = "all";
let searchTerm = "";

function updateHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 18);
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

function normalizeText(value) {
  return value.toLocaleLowerCase().trim();
}

function updatePosts() {
  let visibleCount = 0;

  postCards.forEach((card) => {
    const category = card.dataset.category || "";
    const searchableText = normalizeText(
      `${card.dataset.search || ""} ${card.textContent || ""}`,
    );

    const matchesCategory =
      activeFilter === "all" || category === activeFilter;
    const matchesSearch =
      searchTerm.length === 0 || searchableText.includes(searchTerm);
    const isVisible = matchesCategory && matchesSearch;

    card.classList.toggle("is-hidden", !isVisible);
    card.setAttribute("aria-hidden", String(!isVisible));

    if (isVisible) visibleCount += 1;
  });

  if (noResults) {
    noResults.hidden = visibleCount !== 0;
  }
}

function activateFilter(button) {
  activeFilter = button.dataset.filter || "all";

  filterButtons.forEach((candidate) => {
    const isActive = candidate === button;
    candidate.classList.toggle("active", isActive);
    candidate.setAttribute("aria-pressed", String(isActive));
  });

  updatePosts();
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
      threshold: 0.12,
      rootMargin: "0px 0px -60px",
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
  button.setAttribute("aria-pressed", String(button.classList.contains("active")));
  button.addEventListener("click", () => activateFilter(button));
});

searchInput?.addEventListener("input", (event) => {
  searchTerm = normalizeText(event.currentTarget.value);
  updatePosts();
});

window.addEventListener("scroll", updateHeader, { passive: true });

window.addEventListener("resize", () => {
  if (window.innerWidth > 860) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

updateHeader();
updatePosts();
setupRevealObserver();
